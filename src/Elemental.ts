import { Color } from "excalibur";
import { Game } from "./Game";

export function assembleButton(label: string, color: Color = Color.LightGray) {
    let c = color.clone()
    let bg = c.darken(0.5).desaturate(0.5).clone();
    bg.a = 0.8;
    let fg = c.lighten(0.8).desaturate(0.4).clone();
    let theButton = document.createElement('button');
    theButton.textContent = label;

    theButton.style.display = 'block';
    theButton.style.fontSize = '6pt';
    theButton.style.fontFamily = Game.font // 'Verdana';
    theButton.style.fontWeight = '500';
    theButton.style.padding = '2px';
    theButton.style.width = '100px';
    // theButton.style.height = '100px';
    theButton.style.textTransform = 'uppercase';
    theButton.style.border = 'none' //1px solid rgba(255,255,255,0.08)';
    theButton.style.background = bg.toRGBA();
    theButton.style.color = fg.toRGBA();
    theButton.onmouseover = () => {
        theButton.style.background = bg.saturate(0.5).lighten(0.95).toRGBA();
        theButton.style.color = fg.lighten(0.9).toRGBA();
    };
    theButton.onmouseleave = () => {
        theButton.style.background = bg.toRGBA();
        theButton.style.color = fg.toRGBA();
    };
    return theButton;
}