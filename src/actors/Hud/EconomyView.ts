import { Actor } from "excalibur";
import { Economy, PureValue, availableCapacity, allValues } from "../../models/Economy";
import { EconomicValue } from "./EconomicValue";

export class EconomyView extends Actor {
    private valueLabels: { [key in PureValue]: EconomicValue } = {
        Power: null,
        Oxygen: null,
        Water: null,
        Shelter: null,
        Hope: null,
        Joy: null,
        Wisdom: null,
        Wealth: null,
        Beauty: null,
        Wonder: null
    }

    constructor(market: Economy, x: number, y: number) {
        super(x, y, 0, 0);

        let index = 0
        for (let value of allValues) {
            let valueLabel: EconomicValue =  new EconomicValue(value, (index++ * 34), 0)
            this.valueLabels[value] = valueLabel
            this.add(valueLabel)
        }

        this.updateView(market);
    }

    updateView(updatedEconomy: Economy): void {
        let market = updatedEconomy;

        for (let value of allValues) {
            this.valueLabels[value].setCount(
                availableCapacity(market, value)
            )
        }

    }
}
