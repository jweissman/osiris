const raisedSquare = require('../../images/raised-square-bg.png')
const leafy = require('../../images/leafy-bg.png')
const bookish = require('../../images/books-bg.png')
const posters = require('../../images/poster-wall-bg.png')
const tech = require('../../images/tech-bg.png')
const checker = require('../../images/checker-bg.png')
const beige = require('../../images/beige-bg.png')
const window = require('../../images/window-bg.png')

interface Background {
    image: HTMLImageElement
    pattern: CanvasPattern
    loading: boolean
}

const loadBg = (path) => {
    let background: Background = { image: null, pattern: null, loading: true }
    background.image = new Image();
    background.image.src = path
    background.image.onload = function () {
      background.loading = false
    }
    return background
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
}

const backgroundPatterns: { [ key in BackgroundPattern ]: Background } = {
    Leafy: loadBg(leafy),
    Grid: loadBg(raisedSquare),
    Books: loadBg(bookish),
    Poster: loadBg(posters),
    Tech: loadBg(tech),
    Checker: loadBg(checker),
    Beige: loadBg(beige),
    Window: loadBg(window)
}

export const getBackgroundPattern = (ctx, pattern: BackgroundPattern) => {
    let bg = backgroundPatterns[pattern]
    if (!bg.loading) {
        if (!bg.pattern) {
            bg.pattern = ctx.createPattern(bg.image, 'repeat');
        }
        return bg.pattern
    }
}