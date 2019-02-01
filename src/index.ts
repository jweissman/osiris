import { Game } from './Game';
import { World } from './models/World';
import { Play } from './scenes/Play';
import { Arena } from './scenes/Arena';
import { Menu } from './scenes/Menu';
import { Sandbox } from './scenes/Sandbox';

const theWorld = new World();
const game = new Game(theWorld);

const menu = new Menu(game)
game.add('menu', menu)

const play = new Play(game);
game.add('play', play);

const arena = new Arena(game)
game.add('arena', arena)

const sandbox = new Sandbox(game)
game.add('sandbox', sandbox)

game.start().then(() => {
  game.goToScene('menu')
});
