import { Actor, Color, CollisionType, Traits } from "excalibur";
import { Game } from "../Game";
import { Citizen } from "./Citizen";

export class LaserBeam extends Actor {
    private evil: boolean
    constructor(private source: Citizen, private targetDirectionSign: number) {
        super(
            source.pos.x + 42 * targetDirectionSign,
            source.pos.y - 10,
            12,
            1 //0.8
        )

        this.evil = source.isEvil

        this.color = (this.evil ? Color.Green : Color.Cyan).clone().lighten(0.3)
        this.vel.x = Game.bulletSpeed * targetDirectionSign

        let drift = 24
        this.vel.y = (Math.random() * drift) - (drift/2)
        this.on('collisionstart', this.handleCollision) 
        this.collisionType = CollisionType.Passive
        this.traits = this.traits.filter(trait => !(trait instanceof Traits.OffscreenCulling))
    }

    handleCollision = (collision) => {
        let validTarget = collision.other instanceof Citizen &&
            collision.other.alive &&
            this.evil !== collision.other.isEvil
        if (!validTarget) { return }

        if (collision.other.guarding) {
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
            collision.other.injure(5 + (Math.random() * 2), this.source)
        }
    }
}