import * as GUI from 'babylonjs-gui'

export default class Gui{
    constructor(mainScene){
        let UI = GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI")
        let button1 = GUI.Button.CreateSimpleButton("but1", "Come back!")
            button1.width = "150px"
            button1.height = "40px"
            button1.left = 20
            button1.top = 20
            //button1.fontFamily= "'Beth Ellen', cursive"
            button1.hoverCursor = "pointer"
            button1.shadowOffsetX = 4
            button1.shadowOffsetY = 4
            button1.shadowBlur = 5
            button1.shadowColor ="#e3ed92"
            button1.color = "white"
            button1.cornerRadius = 20
            button1.background = "green"        
            button1.onPointerDownObservable.add(() => {
                mainScene.model.reset()
            })
            button1.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT
            button1.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP
            UI.addControl(button1)    
    }
    
}