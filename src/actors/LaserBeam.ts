import { Actor, Color, CollisionType, Traits } from "excalibur";
import { Game } from "../Game";
import { Citizen } from "./Citizen";
import { Device } from "./Device";
import { Scale } from "../values/Scale";

export class LaserBeam extends Actor {
    private evil: boolean
    constructor(private source: Citizen | Device, private targetDirectionSign: number) {
        super(
            source.pos.x + 4 * targetDirectionSign,
            source.pos.y - (source.getHeight() / 3),
            Scale.minor.third,
            1 //0.8
        )

        this.evil = source.isEvil

        this.color = (this.evil ? Color.Green : Color.Cyan).clone().lighten(0.3)
        this.vel.x = Game.bulletSpeed * targetDirectionSign

        let drift = 12
        this.vel.y = (Math.random() * drift) - (drift/2)
        this.on('collisionstart', this.handleCollision) 
        this.collisionType = CollisionType.Passive
        this.traits = this.traits.filter(trait => !(trait instanceof Traits.OffscreenCulling))
    }

    handleCollision = (collision) => {
        let rightKindOfThing = 
            (collision.other instanceof Citizen && collision.other.alive) // ||
            // (collision.other instanceof Device && collision.other.defender)
        if (!rightKindOfThing) { return }

        let validTarget = this.evil !== collision.other.isEvil
        if (!validTarget) { return }

        if (collision.other instanceof Citizen) {
            this.hitPerson(collision.other)
        } // else if (collision.other instanceof Device) {
            // this.hitThing(collision.other)
        // }
    }

    private hitPerson(citizen: Citizen) {
        if (citizen.guarding) {
            // 60% chance to reflect
            if (Math.random() > 0.4) {
                this.vel.x = -this.vel.x
                this.evil = !this.evil
                // 10% chance to alter y-vel
                if (Math.random() > 0.9) {
                    this.vel.y += (Math.random() * 60) - 30
                }
            } else if (Math.random() > 0.4) {
                // if didn't reflect, 60% to absorb
                this.kill()
            }
        } else if (Math.random() > 0.4) {
            this.kill()
            let damage = 5 + (Math.random() * 2)
            citizen.injure(damage, this.source)
        }
    }

    // private hitThing(device: Device) {
        // console.debug("a defensive device was struck!")
    // }
}