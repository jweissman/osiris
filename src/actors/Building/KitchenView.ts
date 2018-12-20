import { CommonAreaView } from ".";
import { Color } from "excalibur";
import { Citizen } from "../Citizen";
import { ResourceBlock } from "../../models/Economy";

export class KitchenView extends CommonAreaView {
    consumes = ResourceBlock.Food
    produces = ResourceBlock.Meal
//   consumeColor = Color.Green
//   productColor = Color.Yellow

  //   produ
  interact(citizen: Citizen) {
     // iff citizen is carrying our input color...
     if (citizen.carrying === this.consumes) { //consumeColor) {
         // change it in place?
         citizen.carry(this.produces)
     }
  }

  produce(step) {
    // no-op, we need a citizen to help
  }
}