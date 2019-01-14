const raisedSquare = require('../../images/raised-square-bg.png')
const leafy = require('../../images/leafy-bg.png')
const bookish = require('../../images/books-bg.png')
const posters = require('../../images/poster-wall-bg.png')
const tech = require('../../images/tech-bg.png')
const checker = require('../../images/checker-bg.png')
const beige = require('../../images/beige-bg.png')
const window = require('../../images/window-bg.png')
const ussf = require('../../images/ussf.png')
const wood = require('../../images/wood-panel-bg.png')

interface Background {
    image: HTMLImageElement
    pattern: CanvasPattern
    loading: boolean
}

const loadBg = (path, scale = 1) => {
    let background: Background = { image: null, pattern: null, loading: true }
    background.image = new Image();
    background.image.src = path
    background.image.onload = function () {
      background.loading = false
    }
    return { background, scale }
}

export enum BackgroundPattern {
    Leafy = 'Leafy',
    Grid = 'Grid',
    Books = 'Books',
    Poster = 'Poster',
    Tech = 'Tech',
    Checker = 'Checker',
    Beige = 'Beige',
    Window = 'Window',
    USSF = 'USSF',
    Wood = 'Wood',
}

const backgroundPatterns: { [ key in BackgroundPattern ]: { background: Background, scale: number } } = {
    Leafy: loadBg(leafy),
    Grid: loadBg(raisedSquare),
    Books: loadBg(bookish),
    Poster: loadBg(posters),
    Tech: loadBg(tech),
    Checker: loadBg(checker),
    Beige: loadBg(beige),
    Window: loadBg(window),
    USSF: loadBg(ussf, 0.5),
    Wood: loadBg(wood),
}

export const getBackgroundPattern = (ctx: CanvasRenderingContext2D, p: BackgroundPattern) => {
    let pattern = backgroundPatterns[p]
    let bg = pattern.background
    if (!bg.loading) {
        if (!bg.pattern) {
            let matrix = new DOMMatrix() //bg.pattern.cre //ctx. // new SVGMatrix()

            // bg.image.scal
            // bg.image.scale
            bg.pattern = ctx.createPattern(bg.image, 'repeat');
            bg.pattern.setTransform(matrix.scale(pattern.scale)) //0.5))

        }
        return bg.pattern
    }
}