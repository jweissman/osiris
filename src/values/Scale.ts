import { Game } from "../Game";

const majorUnit = Game.mansheight * 2
const minorUnit = Math.floor(Game.mansheight / 4)
// const microUnit = Math.floor(Game.mansheight / 8)
// const microUnit = Game.man

// type ScaleDegree = 'first'
interface Octave {
    first: number
    second: number
    third: number
    fourth: number
    fifth: number
    sixth: number
    seventh: number
    eighth: number
}

function octave(unit: number): Octave {
    return {
        first: unit,
        second: unit * 2,
        third: unit * 3,
        fourth: unit * 4,
        fifth: unit * 5,
        sixth: unit * 6,
        seventh: unit * 7,
        eighth: unit * 8,
    }
}

const majorScale = octave(majorUnit)
const minorScale = octave(minorUnit) 
// const nanoScale = octave(microUnit)

export const Scale = {
    major: majorScale,
    minor: minorScale,
    // nano: nanoScale,
}