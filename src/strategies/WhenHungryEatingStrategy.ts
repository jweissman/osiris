import { EatingStrategy } from "./EatingStrategy";
import { ResourceBlock } from "../models/Economy";
import { Fridge, Desk } from "../models/Machine";

export class WhenHungryEatingStrategy extends EatingStrategy {
    canApply(): boolean {
        return this.pawn.isHungry &&
            this.planet.storedResources.includes(ResourceBlock.Meal)
        // hunger > 0.6
        // throw new Error("Method not implemented.");
    }

    protected async apply() {
        // find the store with the food! reserve it maybe?
        let fridge = this.devices.find(d => d.machine.operation.type === 'store' &&
          d.machine.operation.stores.includes(ResourceBlock.Meal) &&
          d.product.includes(ResourceBlock.Meal) &&
          !d.reserved
        )

        if (fridge) {
            fridge.reserved = true
            // take the meal to a desk? (maybe need table here... or eatingSurface aspect?)
            await this.visitDevice(fridge)
            await fridge.interact(this.pawn, { type: 'retrieve', resource: ResourceBlock.Meal })
            fridge.reserved = false

            let desk = this.devices.find(d => d.machine instanceof Desk)
            if (desk) {
                await this.visitDevice(desk)
            }
            await this.pawn.eat()
            // fridge.interac
            // this.pawn.interact()
        }
    }
    
    
}