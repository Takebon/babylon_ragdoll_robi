export default class Model{
    constructor(scene){
        this.scene = scene
        this.scene.enablePhysics()        
        this.physicsWorld = this.scene._physicsEngine._physicsPlugin.world
        this.runModel()
    }

    runModel(){
        BABYLON.SceneLoader.ImportMesh("", "./model/", "robi.glb", this.scene, newMeshes => {
            this.robi = newMeshes[0]
            this.robi.position.y += 15
            this.robiParts = newMeshes.filter(mesh => mesh.name !== "__root__")
            this.runShadowGenerator()   
            this.addImpostors(newMeshes)       
        })
    }

    runShadowGenerator(){
        let light = this.scene.lights[0]        
        let shadowGenerator = new BABYLON.ShadowGenerator(1024, light)
        this.robiParts.forEach(part => {            
            shadowGenerator.addShadowCaster(part)
        })
        shadowGenerator.useBlurExponentialShadowMap = true
        shadowGenerator.useKernelBlur = true
        shadowGenerator.blurKernel = 16
        shadowGenerator.setDarkness(.28)
    }

    reset(){
        let body = this.scene.meshes.filter(mesh => mesh.name === 'bounding_body')[0]
        let marker = this.createMarker("grabber", new BABYLON.Vector3(0,8,0))
        marker.isVisible = false
        marker.physicsImpostor = new BABYLON.PhysicsImpostor(marker, BABYLON.PhysicsImpostor.SphereImpostor, {mass:0}, this.scene)
        marker.physicsImpostor.physicsBody.collisionFilterGroup = 0
        marker.physicsImpostor.physicsBody.collisionFilterMask = 0
        let joint = new BABYLON.PhysicsJoint(BABYLON.PhysicsJoint.BallAndSocketJoint, {
            mainPivot: new BABYLON.Vector3(0,0,0),
            connectedPivot: new BABYLON.Vector3(0,0,0)
        })
        marker.physicsImpostor.addJoint(body.physicsImpostor, joint)
        setTimeout(() => {
            body.physicsImpostor.sleep()
            setTimeout(() => {
                marker.dispose()
                body.physicsImpostor.wakeUp()
            },1500)
        },1000)
    }

    addImpostors(newMeshes){        
        newMeshes.forEach(mesh => {
            if(mesh.name !== "__root__" && mesh.name !== 'body'){
                let boundInfo = mesh._boundingInfo.boundingBox
                let center = boundInfo.centerWorld
                let x = boundInfo.maximum.x - boundInfo.minimum.x
                let y = boundInfo.maximum.y - boundInfo.minimum.y
                let z = boundInfo.maximum.z - boundInfo.minimum.z
                let boundingBox = new BABYLON.MeshBuilder.CreateBox(`bounding_${mesh.name}`, {width:x, height:y-.11, depth:z}, this.scene)
                boundingBox.position = center
                //this.createMarker(mesh.name, center)
                boundingBox.physicsImpostor = new BABYLON.PhysicsImpostor(boundingBox, BABYLON.PhysicsImpostor.BoxImpostor, {mass: 10, restitution: .6, friction: 0.5})               
                mesh.isPickable = false                
                boundingBox.visibility = 0
                boundingBox.addChild(mesh)                
            } else if(mesh.name === "body"){
                let boundInfo = mesh._boundingInfo.boundingSphere
                let center = boundInfo.centerWorld
                let boundingBox = new BABYLON.MeshBuilder.CreateSphere(`bounding_${mesh.name}`, {diameter: 2.22})
                boundingBox.position = center
                boundingBox.physicsImpostor = new BABYLON.PhysicsImpostor(boundingBox, BABYLON.PhysicsImpostor.SphereImpostor, {mass: 10, restitution: .6 , friction: 0.5})
                mesh.isPickable = false               
                boundingBox.visibility = 0
                boundingBox.addChild(mesh)                
            }
        })
        this.createConstraints()
    }

    createConstraints(){
        let boundingBoxes = this.scene.meshes.filter(mesh => mesh.name.indexOf('bounding') !== -1)
        
        let body = boundingBoxes.filter(mesh => mesh.name === 'bounding_body')[0]
        let body_body = body.physicsImpostor.physicsBody        

        let legUpR = boundingBoxes.filter(mesh => mesh.name === 'bounding_legUp.R')[0]
        let legUpR_body = legUpR.physicsImpostor.physicsBody
        let legUpR_length = legUpR._boundingInfo.boundingBox.maximum.y - legUpR._boundingInfo.boundingBox.minimum.y

        let legUpL = boundingBoxes.filter(mesh => mesh.name === 'bounding_legUp.L')[0]        
        let legUpL_body = legUpL.physicsImpostor.physicsBody
        let legUpL_length = legUpL._boundingInfo.boundingBox.maximum.y - legUpL._boundingInfo.boundingBox.minimum.y

        let legDownR = boundingBoxes.filter(mesh => mesh.name === 'bounding_legDown.R')[0]
        let legDownR_body = legDownR.physicsImpostor.physicsBody
        let legDownR_length = legDownR._boundingInfo.boundingBox.maximum.y - legDownR._boundingInfo.boundingBox.minimum.y

        let legDownL = boundingBoxes.filter(mesh => mesh.name === 'bounding_legDown.L')[0]
        let legDownL_body = legDownL.physicsImpostor.physicsBody
        let legDownL_length = legDownL._boundingInfo.boundingBox.maximum.y - legDownL._boundingInfo.boundingBox.minimum.y

        let hoofL = boundingBoxes.filter(mesh => mesh.name === 'bounding_hoof.L')[0]
        let hoofL_body = hoofL.physicsImpostor.physicsBody
        let hoofL_length = hoofL._boundingInfo.boundingBox.maximum.y - hoofL._boundingInfo.boundingBox.minimum.y

        let hoofR = boundingBoxes.filter(mesh => mesh.name === 'bounding_hoof.R')[0]
        let hoofR_body = hoofR.physicsImpostor.physicsBody
        let hoofR_length = hoofR._boundingInfo.boundingBox.maximum.y - hoofR._boundingInfo.boundingBox.minimum.y
        
        
        let leftKneeJoint = new CANNON.ConeTwistConstraint(legUpL_body, legDownL_body, {
            pivotA: new CANNON.Vec3(0, -legUpL_length/2, 0),
            pivotB: new CANNON.Vec3(0, legDownL_length/2, 0),
            axisA: CANNON.Vec3.UNIT_Y,
            axisB: CANNON.Vec3.UNIT_Y,
            angle: Math.PI/4,
            twistAngle: Math.PI/4
        })
        this.physicsWorld.addConstraint(leftKneeJoint)
        
        let rightKneeJoint = new CANNON.ConeTwistConstraint(legUpR_body, legDownR_body, {
            pivotA: new CANNON.Vec3(0, -legUpR_length/2, 0),
            pivotB: new CANNON.Vec3(0, legDownR_length/2, 0),
            axisA: CANNON.Vec3.UNIT_Y,
            axisB: CANNON.Vec3.UNIT_Y,
            angle: Math.PI/4,
            twistAngle: Math.PI/4
        })
        this.physicsWorld.addConstraint(rightKneeJoint)
        
        let leftAnkleJoint = new CANNON.ConeTwistConstraint(legDownL_body, hoofL_body, {
            pivotA: new CANNON.Vec3(0, -legDownL_length/2, 0),
            pivotB: new CANNON.Vec3(0, hoofL_length/2, 0),
            axisA: CANNON.Vec3.UNIT_Y,
            axisB: CANNON.Vec3.UNIT_Y,
            angle: Math.PI/4,
            twistAngle: Math.PI/4
        })
        this.physicsWorld.addConstraint(leftAnkleJoint)
        
        let rightAnkleJoint = new CANNON.ConeTwistConstraint(legDownR_body, hoofR_body, {
            pivotA: new CANNON.Vec3(0, -legDownR_length/2, 0),
            pivotB: new CANNON.Vec3(0, hoofR_length/2, 0),
            axisA: CANNON.Vec3.UNIT_Y,
            axisB: CANNON.Vec3.UNIT_Y,
            angle: Math.PI/4,
            twistAngle: Math.PI/4
        })
        this.physicsWorld.addConstraint(rightAnkleJoint)

        let posA = body.position
        let posB = legUpL.position
        posB.y += legUpL_length/2    
        let axis = posB.subtract(posA)
        let antiRoot = body_body.quaternion
        let pivot = antiRoot.vmult(axis)   

        let leftHipJoint = new CANNON.ConeTwistConstraint(body_body, legUpL_body, {
            pivotA: pivot,
            pivotB: new CANNON.Vec3(0, legUpL_length/2, 0),
            axisA: pivot.mult(-1),
            axisB: CANNON.Vec3.UNIT_Y,
            angle: Math.PI/4,
            twistAngle: Math.PI/2
        })
        this.physicsWorld.addConstraint(leftHipJoint)

        posB = legUpR.position
        posB.y += legUpR_length/2
        axis = posB.subtract(posA)
        antiRoot = body_body.quaternion.inverse()
        pivot = antiRoot.vmult(axis)
        
        let rightHipJoint = new CANNON.ConeTwistConstraint(body_body, legUpR_body, {
            pivotA: pivot,
            pivotB: new CANNON.Vec3(0, legUpR_length/2, 0),
            axisA: pivot.mult(-1),
            axisB: CANNON.Vec3.UNIT_Y,
            angle: Math.PI/4,
            twistAngle: Math.PI/2
        })
        this.physicsWorld.addConstraint(rightHipJoint)
    }

    createMarker(name, center){
        let marker = new BABYLON.MeshBuilder.CreateSphere(`marker_${name}`,{diameter:.3}, this.scene)
        let material = new BABYLON.StandardMaterial('markerMat', this.scene)
        material.diffuseColor = new BABYLON.Color3.Red()
        marker.material = material
        marker.position = center
        return marker
    }
}