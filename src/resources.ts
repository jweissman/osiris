import * as ex from 'excalibur';
const sword = require('./images/sword.png');
const bookshelf = require('./images/bookshelf.png');
// const bookshelfSvg = require('./images/bookshelf-plain.svg');

let Resources = {
    Sword: new ex.Texture(sword),

    Bookshelf: new ex.Texture(bookshelf),

    // BookshelfSVG: new ex.Texture(bookshelfSvg)
}

export { Resources }
