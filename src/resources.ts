import * as ex from 'excalibur';
const sword = require('./images/sword.png');
const craterRock = require('./sounds/crater-rock.mp3')
const assembler = require('./sounds/assembler.mp3')
const indivision = require('./sounds/indivision.mp3')
const understanding = require('./sounds/understanding.mp3')

let Resources = {
    Sword: new ex.Texture(sword),

    CraterRock: new ex.Sound(craterRock),
    Assembler: new ex.Sound(assembler),
    Indivision: new ex.Sound(indivision),
    Understanding: new ex.Sound(understanding),


}

export { Resources }
