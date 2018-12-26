
export enum Orientation { Left, Up, Right, Down } //, Angle }

export const compass = [
    Orientation.Left,
    Orientation.Right,
    Orientation.Up,
    Orientation.Down,
]


export function flip(orientation: Orientation): Orientation {
    switch (orientation) {
        case Orientation.Left: return Orientation.Right
        case Orientation.Right: return Orientation.Left
        case Orientation.Up: return Orientation.Down
        case Orientation.Down: return Orientation.Up
    }
    throw new Error(`Don't know orientation ${ orientation }`)
}