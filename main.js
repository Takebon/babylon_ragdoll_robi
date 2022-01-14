import * as BABYLON from 'babylonjs'
import 'babylonjs-loaders'
window.CANNON = require('cannon')
import SceneCreator from './scripts/sceneCreator'
import Gui from './scripts/gui'

class App{
    constructor(){
        this.canvas = document.getElementById('renderCanvas')
        this.engine = new BABYLON.Engine(this.canvas, true, {stencil: true, preserveDrawingBuffer: true})
        window.addEventListener('resize', () => this.engine.resize())
        this.init()
    }

    init(){
        this.mainScene = new SceneCreator(this.engine, this.canvas)
        this.gui = new Gui(this.mainScene)  
        this.loop()
    }

    loop(){
        this.engine.runRenderLoop(()=>{
            this.mainScene.scene.render()
        })
    }
}

const app = new App()