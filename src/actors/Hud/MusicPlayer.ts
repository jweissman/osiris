import { Sound, Color } from "excalibur";
import { sample } from "../../Util";

interface MusicPlayerPlay { type: 'play'}
interface MusicPlayerPause { type: 'pause'}
interface MusicPlayerStop { type: 'stop'}
interface MusicPlayerNext { type: 'next'}
type MusicPlayerAction = MusicPlayerPlay | MusicPlayerPause | MusicPlayerStop | MusicPlayerNext

export class MusicPlayer {
    private _wrapper: HTMLDivElement;
    private _element: HTMLDivElement;
    private _titleElem: HTMLSpanElement;

    currentTrack: string

    constructor(private x: number, private y: number, private playlist: {
        [track: string]: Sound;
    }) {
        this.makePlayer();
        // this.song.isLoaded
        setTimeout(() => { this.startMusic() }, 2000)
        this._titleElem.textContent = `Please wait, the jams are on their way...`;
        this.currentTrack = sample(Object.keys(this.playlist)); //[0];
    }

    startMusic() {
        // this.currentTrack = Object.keys(this.playlist)[0];
        this._titleElem.textContent = `Playing: ${this.currentTrack}`;

        this.playlist[this.currentTrack].play()
    }

    draw(ctx: CanvasRenderingContext2D) {
        if (this._element) {
            let left = ctx.canvas.offsetLeft;
            let top = ctx.canvas.offsetTop;
            this._wrapper.style.left = `${left + this.x}px`;
            this._wrapper.style.top = `${top + this.y}px`;
        }
    }

    private makePlayer() {
        this._wrapper = document.createElement('div')
        this._wrapper.style.position = 'absolute'
        this._wrapper.style.width = '20%'
        this._wrapper.style.textAlign = 'center'
        this._wrapper.style.border = 'none';
        document.body.appendChild(this._wrapper);

        this._element = document.createElement('div');
        // this._element.style.position = 'absolute';
        this._element.style.display = 'inline-block';
        this._element.style.border = 'none';
        this._wrapper.appendChild(this._element)

        // document.body.appendChild(this._element);
        // let track = Object.keys(this.playlist)[0];
        // if (track) {
            // console.log("WOULD DISPLAY TRACK INFO", { track })
            this._titleElem = document.createElement('span');
            // this._titleElem.textContent = `Currently Playing: ${track}`;
            this._titleElem.style.fontFamily = 'Verdana';
            this._titleElem.style.fontSize = '7pt';
            this._titleElem.style.padding = '24px'
            this._titleElem.style.color = 'white';
            this._wrapper.appendChild(this.inlineBlock(this._titleElem));
        // }

        let play = this.iconFactory({ type: 'play' }, '&#9655;') //, this.handleAction)
        // this._element.appendChild(play)
        this._wrapper.appendChild(this.inlineBlock(play));

        let pause = this.iconFactory({ type: 'pause' }, '&#10072; &#10072;') //, this.handleAction)
        this._wrapper.appendChild(this.inlineBlock(pause))

        let next = this.iconFactory({ type: 'next' }, '&#9288;')
        this._wrapper.appendChild(this.inlineBlock(next))

    }

    handleAction(action: MusicPlayerAction) {
        // console.warn("WOULD HANDLE MUSIC PLAYER ACTION", { action })
        if (action.type === 'pause') {
            this.song.pause() //.play()
        } else if (action.type === 'play') {
            this.song.play()
        } else if (action.type === 'next') {
            this.song.stop()
            let ndx = this.trackNames.indexOf(this.currentTrack)
            ndx = (ndx + 1) % this.trackNames.length
            console.log("NEW SONG INDEX", { ndx })
            this.currentTrack = this.trackNames[ndx]
            this.startMusic() // play() and set title...
            // this.song.play()
            // this.currentTrac
        }
    }

    get trackNames() { return Object.keys(this.playlist) }
    get song() { return this.playlist[this.currentTrack] }

    private inlineBlock(elem) {
        let block = document.createElement('div');
        block.style.display = 'inline-block';
        block.style.border = 'none';
        block.append(elem)
        return block
    }

    private iconFactory(
        action: MusicPlayerAction,
        iconContent: string,
        // handleClick: (action: MusicPlayerAction) => any
    ) {
        let bg = Color.DarkGray.darken(0.5)
        let fg = Color.White
        let icon = document.createElement('button')
        icon.innerHTML = iconContent
        icon.style.display = 'block';
        icon.style.fontSize = '7pt';
        icon.style.fontFamily = 'Verdana';
        icon.style.background = bg.toRGBA();
        icon.style.color = fg.toRGBA();
        icon.onclick = () => { this.handleAction(action) }
        return icon
    }

}
