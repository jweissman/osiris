import { Texture, Sound } from 'excalibur';
const sword = require('./images/sword.png');
const craterRock = require('./sounds/crater-rock.mp3')
const assembler = require('./sounds/assembler.mp3')
const indivision = require('./sounds/indivision.mp3')
const understanding = require('./sounds/understanding.mp3')
const futureTense = require('./sounds/future tense.mp3')
// const isomer = require('./sounds/isomer.mp3')
// const outbound = require('./sounds/outbound.mp3')

let Resources = {
    Sword: new Texture(sword),

    // CraterRock: new Sound(craterRock),
    Assembler: new Sound(assembler),
    // Indivision: new Sound(indivision),
    // Understanding: new Sound(understanding),
    FutureTense: new Sound(futureTense),
    // Isomer: new Sound(isomer),
    // Outbound: new Sound(outbound),


}

export { Resources }
