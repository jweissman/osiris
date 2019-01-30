import { Actor, Color, CollisionType } from "excalibur";
import { Game } from "../Game";
import { Citizen } from "./Citizen";

export class LaserBeam extends Actor {
    private evil: boolean
    constructor(private source: Citizen, private targetDirectionSign: number) {
        super(
            source.pos.x + 42 * targetDirectionSign,
            source.pos.y - 10,
            18,
            1 //0.8
        )

        this.evil = source.isEvil

        this.color = (this.evil ? Color.Green : Color.Cyan).clone().lighten(0.3)
        this.vel.x = Game.bulletSpeed * targetDirectionSign
        this.vel.y = (Math.random() * 10) - 5
        this.on('collisionstart', (collision) => {
            // console.log("COLLISION", { collision })
            if (collision.other instanceof Citizen) {
                if (collision.other.alive && this.evil !== collision.other.isEvil) {
                    if (collision.other.guarding) { 
                        this.vel.x = -this.vel.x
                        this.evil = !this.evil 
                        // this.
                        // bullet.kill() // absorb..
                    } else if (Math.random() > 0.3) {
                        // console.log("someone got hit!", { person: collision.other.name })
                        this.kill()
                        collision.other.injure(6 + (Math.random() * 4), this.source)
                    }
                }
            }
        })
        this.collisionType = CollisionType.Passive
    }

    // private get evil() { return this.source.isEvil }
}