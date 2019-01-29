import { Game } from './Game';
import { World } from './models/World';
import { Construct } from './scenes/Construct';
import { Resources } from './Resources';
import { Sound } from 'excalibur';
import { Arena } from './scenes/Arena';

const theWorld = new World();
const game = new Game(theWorld);

const construct = new Construct(game);
game.add('construct', construct);

const arena = new Arena(game)
game.add('arena', arena)


game.start().then(() => {
  game.goToScene('construct')
});
