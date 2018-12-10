import { Game } from './Game';
import { World } from './models/World';
import { Construct } from './scenes/Construct';

const theWorld = new World();
const game = new Game(theWorld);

// scenes
const construct = new Construct(game);
game.add('construct', construct);

game.start().then(() => {
  game.goToScene('construct');
});
