import { Color, ParticleEmitter, EmitterType } from "excalibur";
import { Scale } from "../values/Scale";

export function makeEmitter(beginC: Color, endC: Color, size: number = Scale.minor.first) {
    let emitter = new ParticleEmitter()
    emitter.emitterType = EmitterType.Circle
    emitter.radius = size
    emitter.minVel = 10
    emitter.maxVel = 24
    emitter.minAngle = 0
    emitter.maxAngle = Math.PI * 2
    emitter.emitRate = 350
    emitter.opacity = 0.5
    emitter.fadeFlag = true
    emitter.particleLife = 500
    emitter.maxSize = 2
    emitter.minSize = 1
    emitter.beginColor = beginC //Color.Red.darken(0.12)
    emitter.endColor = endC //Color.Red.darken(0.36)
    emitter.isEmitting = false
    return emitter
}