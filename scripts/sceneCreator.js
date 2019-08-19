import * as BABYLON from 'babylonjs'
import Model from './model'
import Locomotor from './locomotor'

export default class SceneCreator{
    constructor(engine, canvas){
        this.engine = engine
        this.canvas = canvas
        this.scene = new BABYLON.Scene(this.engine)
        this.scene.fogMode = BABYLON.Scene.FOGMODE_LINEAR
        this.scene.fogStart = 40
        this.scene.fogEnd = 60
        this.scene.fogColor = new BABYLON.Color3(0.25,0.3,0.3)           
        this.scene.clearColor = new BABYLON.Color4(0.25,0.3,0.3,1)   
        this.scene.enablePhysics()        
        this.physicsWorld = this.scene._physicsEngine._physicsPlugin.world
        this.init()
    }

    init(){
        this.createCamera()
        this.createGround()
        this.createLight()
        this.model = new Model(this.scene)
        this.locomotor = new Locomotor(this.scene)
    }

    createCamera(){        
        this.camera = new BABYLON.UniversalCamera('camera', new BABYLON.Vector3(-13, 4, -13), this.scene)
        this.camera.setTarget(BABYLON.Vector3.Up().add(new BABYLON.Vector3(0,1,0)))
        //this.camera.attachControl(this.canvas, true)       
    }

    createGround(){
        this.ground = new BABYLON.MeshBuilder.CreateGround('ground', {width:100, height:100, subdivisions:2}, this.scene)
        this.ground.receiveShadows = true
        this.ground.physicsImpostor = new BABYLON.PhysicsImpostor(this.ground, BABYLON.PhysicsImpostor.BoxImpostor, {mass: 0, restitution: .6})
        
        let material = new BABYLON.StandardMaterial('material', this.scene)
        material.diffuseTexture = new BABYLON.Texture('./texture/diff.jpg', this.scene)
        material.diffuseTexture.uScale = 15
        material.diffuseTexture.vScale = 15
        material.bumpTexture = new BABYLON.Texture('./texture/norm.jpg')
        material.bumpTexture.uScale = 15
        material.bumpTexture.vScale = 15
        this.ground.material = material
    }

    createLight(){
        this.light2 = new BABYLON.DirectionalLight("light2", new BABYLON.Vector3(0, -1, 0), this.scene)
        this.light2.position = new BABYLON.Vector3(0, 30, 0)
        this.light2.intensity = 2
        
        this.light3 = new BABYLON.DirectionalLight("light2", new BABYLON.Vector3(13, -4, 13), this.scene)
        this.light3.position = this.camera.position
        this.light3.intensity = 1       
    }

    lightHelper(light){
        let lightHelper = new BABYLON.MeshBuilder.CreateSphere(`sphere_${light.name}`, {diameter:2}, this.scene)
        lightHelper.position = light.position
        lightHelper.material = new BABYLON.StandardMaterial(`light_${light.name}`, this.scene)
        lightHelper.material.emissiveColor = new BABYLON.Color3(1, 1, 0)
        let origin = light.position
        let direction = light.direction   
        let ray = new BABYLON.Ray(origin, direction, 1000)
        let rayHelper = new BABYLON.RayHelper(ray)
        rayHelper.show(this.scene, new BABYLON.Color3.Red())
    }
}