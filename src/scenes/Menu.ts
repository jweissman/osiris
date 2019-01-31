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
    emitter: ParticleEmitter

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
            { label: 'Play', scene: 'construct' },
            { label: 'Arena', scene: 'arena' },
        ], this.engine)

        this.emitter = this.makeBigBangEmitter(
            halfWidth + (halfWidth/2),
            halfHeight - 50
        )
        this.add(this.emitter)

        this.controller = new GameController(this.engine, this.camera)
    }

    onActivate() {

        this.sceneList.show()

        let canvasHeight = this.engine.canvasHeight / window.devicePixelRatio;

        this.camera.zoom(2.25)
        this.emitter.isEmitting = true

        this.controller = new GameController(this.engine, this.camera)
        this.controller.activate()
    }

    onDeactivate() {
        this.emitter.isEmitting = false
        this.controller.deactivate()
        this.sceneList.hide()
    }

    draw(ctx, delta) {
        let canvasHeight = this.engine.canvasHeight / window.devicePixelRatio;
        let canvasWidth = this.engine.canvasWidth / window.devicePixelRatio;
        super.draw(ctx, delta)
        this.sceneList.draw(ctx)
        drawText(ctx,
            `${Game.title} (prealpha build.)`,
            canvasWidth - 100, canvasHeight - 20)
        drawText(ctx,
            `Zoom: ${this.camera.getZoom()} / Pos: ${this.camera.pos.x}, ${this.camera.pos.y}`,
            1000, 1000)
    }

    private makeBigBangEmitter(x,y) {
        let emitter = new ParticleEmitter(
            x,
            y
        )
        emitter.endColor = Color.Blue
        emitter.beginColor = Color.White.darken(0.18)
        emitter.radius = 10
        emitter.minVel = 10
        emitter.maxVel = 160
        emitter.minAngle = 0 //3 * (Math.PI / 2) //0
        emitter.maxAngle = Math.PI * 2
        emitter.emitRate = 200 // 300 particles/second
        emitter.opacity = 0.5
        emitter.fadeFlag = true
        emitter.particleLife = 4500 // in milliseconds = 1 sec
        emitter.maxSize = 50 // in pixels
        emitter.minSize = 2
        // emitter.beginColor = Color.Red.darken(0.12);
        emitter.isEmitting = false;
        return emitter
    }
}