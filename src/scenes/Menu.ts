import { Pane } from "../actors/Hud/Pane";
import { Scene, Color, Engine, ParticleEmitter, Vector } from "excalibur";
import { assembleButton } from "../Elemental";
import { GameController } from "../GameController";
import { drawText } from "../Painting";
import { Game } from "../Game";

class SceneList extends Pane {

    setup(btns: { label: string, scene: string }[], engine: Engine) {
        btns.forEach(btn => {
            let theButton = assembleButton(btn.label, Color.Blue)
            theButton.onclick = () => {
                engine.goToScene(btn.scene)
            }
            this._element.appendChild(theButton)
        })
    }

}

export class Menu extends Scene {
    controller: GameController

    sceneList: SceneList
    blueEmitter: ParticleEmitter
    redEmitter: ParticleEmitter

    onInitialize() {
        let canvasHeight = this.engine.canvasHeight / window.devicePixelRatio;
        let canvasWidth = this.engine.canvasWidth / window.devicePixelRatio;

        let halfHeight = Math.floor(canvasHeight/2)
        let halfWidth = Math.floor(canvasWidth/2)

        this.sceneList = new SceneList(
            'AD ASTRA: OSIRIS CONTINGENCY',
            halfWidth /2,
            halfHeight - 50,
        )
        this.sceneList.setup([
            { label: 'Play', scene: 'play' },
            { label: 'Arena', scene: 'arena' },
            { label: 'Sandbox', scene: 'sandbox' },
        ], this.engine)

        this.blueEmitter = this.makeBigBangEmitter(
            canvasWidth + 50,
            // halfWidth + (halfWidth/2),
            halfHeight - 50,
            Color.Blue.lighten(0.3)
        )
        this.add(this.blueEmitter)
        this.redEmitter = this.makeBigBangEmitter(
            canvasWidth + 50,
            // halfWidth + (halfWidth/2),
            halfHeight - 50,
            Color.Red.darken(0.3)
        )
        this.add(this.redEmitter)

        this.controller = new GameController(this.engine, this.camera)
    }

    onActivate() {

        this.sceneList.show()

        // let canvasHeight = this.engine.canvasHeight / window.devicePixelRatio;

        this.camera.zoom(1.25) //2.5)
        this.blueEmitter.isEmitting = true
        this.redEmitter.isEmitting = true

        this.controller = new GameController(this.engine, this.camera)
        this.controller.activate()
    }

    onDeactivate() {
        this.blueEmitter.isEmitting = false
        this.redEmitter.isEmitting = false
        this.controller.deactivate()
        this.sceneList.hide()
    }

    draw(ctx, delta) {
        let canvasHeight = this.engine.canvasHeight / window.devicePixelRatio;
        let canvasWidth = this.engine.canvasWidth / window.devicePixelRatio;
        super.draw(ctx, delta)
        this.sceneList.draw(ctx)
        drawText(ctx,
            `${Game.title} v0.0.1 (pre-alpha)`,
            canvasWidth - 100, canvasHeight - 20)
        drawText(ctx,
            `Zoom: ${this.camera.getZoom()} / Pos: ${this.camera.pos.x}, ${this.camera.pos.y}`,
            1000, 1000)
    }

    private makeBigBangEmitter(x,y,c) {
        let emitter = new ParticleEmitter(
            x,
            y
        )
        emitter.endColor = c.clone() //Color.Blue
        emitter.beginColor = Color.White.darken(0.18)
        emitter.radius = 10
        emitter.minVel = 10
        emitter.maxVel = 250
        emitter.minAngle = 0 //3 * (Math.PI / 2) //0
        emitter.maxAngle = Math.PI * 2
        emitter.emitRate = 36 // 300 particles/second
        emitter.opacity = 0.54
        emitter.fadeFlag = true
        emitter.particleLife = 5600 // in milliseconds = 1 sec
        emitter.maxSize = 180 // in pixels
        emitter.minSize = 2
        // emitter.beginColor = Color.Red.darken(0.12);
        emitter.isEmitting = false;
        return emitter
    }
}