export default class Locomotor{
    constructor(scene){
        this.scene = scene        
        this.drag = false
        this.mesh = null    
        this.events()        
    }

    events(){        
        this.scene.onPointerObservable.add((pointerInfo) => {
            switch (pointerInfo.type) {
                case BABYLON.PointerEventTypes.POINTERDOWN:                                                                                  
                    this.handlePointerDown(pointerInfo)
                    break;
                case BABYLON.PointerEventTypes.POINTERUP:
                    this.handlePointerUp()
                    break;
                case BABYLON.PointerEventTypes.POINTERMOVE:                                            
                    this.handlePointerMove(pointerInfo)
                    break;    
            }
        })
    }

    handlePointerDown(pointerInfo){
        this.mesh = pointerInfo.pickInfo.pickedMesh
        if(!this.mesh || this.mesh.name.indexOf('bounding') === -1) return
        this.drag = true
        let pos = pointerInfo.pickInfo.pickedPoint
        if(!this.clickMarker){            
            this.createClickMarker()
        }
        this.setUVPlane(pos)
        this.setClickMarkerPosition(pos)
        this.addJoint(pos)
    }

    handlePointerMove(pointerInfo){
        if(!this.drag) return
        if(this.uVPlane && this.clickMarker){
            let pos = this.projecOntoPlane(pointerInfo)
            this.setClickMarkerPosition(pos)
        }    
    }

    handlePointerUp(){    
        if(!this.drag) return
        if(this.clickMarker){
            this.scene.getPhysicsEngine().removeJoint(this.clickMarker.physicsImpostor, this.mesh.physicsImpostor, this.joint)
            this.drag = false
            this.mesh = null
        }
    }

    createClickMarker(){
        this.clickMarker = new BABYLON.MeshBuilder.CreateSphere('marker', {diameter:.2}, this.scene)
        let material = new BABYLON.StandardMaterial('markerMaterial', this.scene)
        material.diffuseColor = new BABYLON.Color3(1,0,0)
        this.clickMarker.material = material
        this.clickMarker.physicsImpostor = new BABYLON.PhysicsImpostor(this.clickMarker, BABYLON.PhysicsImpostor.SphereImpostor, {mass: 0, restitution: 0}, this.scene)
        this.clickMarker.physicsImpostor.physicsBody.collisionFilterGroup = 0
        this.clickMarker.physicsImpostor.physicsBody.collisionFilterMask = 0
        this.clickMarker.isVisible = false
    }

    setUVPlane(pos){
        if(!this.uVPlane){
            this.createUVPlane()
        }
        this.uVPlane.rotation = this.scene.activeCamera.rotation
        this.uVPlane.isPickable = false        
        this.uVPlane.position = pos
    }

    createUVPlane(){
        this.uVPlane = new BABYLON.MeshBuilder.CreatePlane('uVPlane', {width: 100, height:100}, this.scene)
        this.uVPlane.isVisible = false
        this.uVPlane.isPickable = false 
    }

    setClickMarkerPosition(pos){
        let groundPosY = this.scene.meshes.filter(mesh => mesh.name === "ground")[0].position.y
        if(pos.y < groundPosY){
            pos.y = groundPosY
        }
        this.clickMarker.position = pos
    }

    addJoint(pos){
        setTimeout(() => {
            let v = pos.subtract(this.mesh.position)
            let antiRot = this.mesh.physicsImpostor.physicsBody.quaternion.inverse()
            let pivot = antiRot.vmult(v)            
            this.joint = new BABYLON.PhysicsJoint(BABYLON.PhysicsJoint.BallAndSocketJoint, {
                mainPivot: new BABYLON.Vector3(0, 0, 0),
                connectedPivot: pivot
            })
            this.clickMarker.physicsImpostor.addJoint(this.mesh.physicsImpostor, this.joint)
        }, 20)
    }

    projecOntoPlane(pointerInfo){
        let origin = pointerInfo.pickInfo.ray.origin
        let direction = pointerInfo.pickInfo.ray.direction
        let ray = new BABYLON.Ray(origin, direction, 100)
        let point = ray.intersectsMesh(this.uVPlane, true).pickedPoint
        return point
    }
}