import { Actor, Color } from 'excalibur';

export class PlanetBackground extends Actor {
    constructor(y: number, width: number, color: Color) {
        super(0, y, width, 1500, color)
    }
}

