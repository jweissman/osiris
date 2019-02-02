import { Game } from "../Game";

const majorUnit = Game.mansheight * 2
const minorUnit = Math.floor(Game.mansheight / 4)

const majorScale = {
    first: majorUnit,
    second: majorUnit * 2,
    third: majorUnit * 3,
    fourth: majorUnit * 4,
    fifth: majorUnit * 5,
    sixth: majorUnit * 6,
    seventh: majorUnit * 7,
    eighth: majorUnit * 8,
}

const minorScale = {
    first:   minorUnit,
    second:  minorUnit * 2,
    third:   minorUnit * 3,
    fourth:  minorUnit * 4,
    fifth:   minorUnit * 5,
    sixth:   minorUnit * 6,
    seventh: minorUnit * 7,
    eighth:  minorUnit * 8,
}

export const Scale = {
    major: majorScale,
    minor: minorScale
}