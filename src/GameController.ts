import { Game } from "./Game";
import { BaseCamera, Vector, Input } from "excalibur";
import { Orientation } from "./values/Orientation";

export class GameController {

    private dragging: boolean = false
    private dragOrigin: Vector
    pointerMoveCallback: (pos: Vector) => any = null
    leftClickCallback: (pos: Vector, holdingShift: boolean) => any = null
    cameraPanCallback: () => any = null
    keyPressCallback: (key) => any = null

    constructor(private game: Game, private camera: BaseCamera) {
        
    }

    onMove(cb: (pos: Vector) => any) {
        this.pointerMoveCallback = cb
    }

    onLeftClick(cb: (pos: Vector, holdingShift: boolean) => any) {
        this.leftClickCallback = cb
    }

    onCameraPan(cb: () => any) {
        this.cameraPanCallback = cb
    }

    onKeyPress(cb: (key) => any) {
        this.keyPressCallback = cb

    }

    activate() {
        this.game.input.pointers.primary.on('move', (e: Input.PointerMoveEvent) => {

            if (this.dragging) {
                this.camera.pos = this.camera.pos.add(
                    this.dragOrigin.sub(e.pos)
                )
            } else {
                if (this.pointerMoveCallback) {
                    this.pointerMoveCallback(e.pos)
                }

            }
        })

        this.game.input.pointers.primary.on('up', () => {
            if (this.dragging) { this.dragging = false; }
        })

        this.game.input.pointers.primary.on('down', (e: Input.PointerDownEvent) => {
            if (e.button == Input.PointerButton.Left) {
                if (this.leftClickCallback) {
                    this.leftClickCallback(
                        e.pos,
                        this.game.input.keyboard.isHeld(Input.Keys.Shift)
                    )
                }

            } else if (e.button === Input.PointerButton.Middle) {
                this.dragging = true;
                this.dragOrigin = e.pos
            }
        })

        this.game.input.pointers.primary.on('wheel', (e: Input.WheelEvent) => {
            let z = this.camera.getZoom()
            let step = 0.05
            let min = 0.05, max = 8
            if (e.deltaY < 0) {
                this.camera.zoom(Math.min(z + step, max))
            } else if (e.deltaY > 0) {
                this.camera.zoom(Math.max(z - step, min))
            }
        })

        let { Up, Down, Left, Right } = Orientation;
        let moveCam = (direction: Orientation) => {
            if (this.cameraPanCallback) {
                this.cameraPanCallback()
            }
            let camMoveSpeed = 10 * (1 / this.camera.getZoom())
            let dv = new Vector(0, 0)
            switch (direction) {
                case Left: dv.x = -camMoveSpeed; break
                case Right: dv.x = camMoveSpeed; break
                case Up: dv.y = -camMoveSpeed; break
                case Down: dv.y = camMoveSpeed; break
            }
            this.camera.move(this.camera.pos.add(dv), 0)
        }


        this.game.input.keyboard.on('press', (e: Input.KeyEvent) => {
            if (e.key === Input.Keys.Up || e.key === Input.Keys.W) {
                moveCam(Up)
            } else if (e.key === Input.Keys.Left || e.key === Input.Keys.A) {
                moveCam(Left)
            } else if (e.key === Input.Keys.Down || e.key === Input.Keys.S) {
                moveCam(Down)
            } else if (e.key === Input.Keys.Right || e.key === Input.Keys.D) {
                moveCam(Right)
            } else {
                if (this.keyPressCallback) {
                    this.keyPressCallback(e.key)
                }
            }
        })
        this.game.input.keyboard.on('hold', (e: Input.KeyEvent) => {
            if (e.key === Input.Keys.Up || e.key === Input.Keys.W) {
                moveCam(Up)
            } else if (e.key === Input.Keys.Left || e.key === Input.Keys.A) {
                moveCam(Left)
            } else if (e.key === Input.Keys.Down || e.key === Input.Keys.S) {
                moveCam(Down)
            } else if (e.key === Input.Keys.Right || e.key === Input.Keys.D) {
                moveCam(Right)
            }
        })
    }
}