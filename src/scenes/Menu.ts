import { Pane } from "../actors/Hud/Pane";
import { Scene, Color, Engine, ParticleEmitter } from "excalibur";
import { assembleButton } from "../Elemental";

class SceneList extends Pane {
    setup(btns: { label: string, scene: string }[], engine: Engine) {
        btns.forEach(btn => {
            let theButton = assembleButton(btn.label, Color.Blue)
            theButton.onclick = () => {
                engine.goToScene(btn.scene)
                this._element.style.display = 'none'
            }
            this._element.appendChild(theButton)
        })
    }
}

export class Menu extends Scene {
    sceneList: SceneList

    onInitialize() {
        this.sceneList = new SceneList(
            'AD ASTRA: OSIRIS',
            this.engine.halfCanvasWidth - 100, this.engine.halfCanvasHeight - 30
        )

        this.sceneList.setup([
            { label: 'Play', scene: 'construct' },
            { label: 'Arena', scene: 'arena' }
        ], this.engine)

        let emitter = new ParticleEmitter(
            this.engine.halfCanvasWidth,
            this.engine.halfCanvasHeight

        )
        emitter.endColor = Color.Blue //Cyan.darken(0.36);
        emitter.beginColor = Color.White
        emitter.radius = 100
        emitter.minVel = 10
        emitter.maxVel = 150
        emitter.minAngle = 0
        emitter.maxAngle = Math.PI * 2;
        emitter.emitRate = 250 // 300 particles/second
        emitter.opacity = 0.5
        emitter.fadeFlag = true // fade particles overtime
        emitter.particleLife = 6000 // in milliseconds = 1 sec
        emitter.maxSize = 20 // in pixels
        emitter.minSize = 1
        // emitter.beginColor = Color.Red.darken(0.12);
        emitter.isEmitting = true;
        this.add(emitter)
    }

    draw(ctx, delta) {
        super.draw(ctx, delta)
        this.sceneList.draw(ctx)
    }
}