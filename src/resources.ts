import * as ex from 'excalibur';
const sword = require('./images/sword.png');
const craterRock = require('./sounds/crater-rock.mp3')

let Resources = {
    Sword: new ex.Texture(sword),
    CraterRock: new ex.Sound(craterRock),

}

export { Resources }
