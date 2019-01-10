import { Game } from './Game';
import { World } from './models/World';
import { Construct } from './scenes/Construct';
import { Resources } from './Resources';
import { Sound } from 'excalibur';

const theWorld = new World();
const game = new Game(theWorld);

const construct = new Construct(game);
game.add('construct', construct);

game.start().then(() => {
  game.goToScene('construct');
  setTimeout(() => {
    console.log("let's jam!");
    let jam: Sound = Resources.CraterRock //play();
    jam.play()
  }, 1500)
  // jam.oncomplete = () => jam.play()
});
