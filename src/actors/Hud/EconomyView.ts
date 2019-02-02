import { Actor, Color } from "excalibur";
import { Economy, PureValue, availableCapacity, allValues } from "../../models/Economy";
import { EconomicValue } from "./EconomicValue";
import { eachChunk } from "../../Util";

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
        super(x, y, 0, 0) //Color.DarkGray.clone().darken(0.5));

        let index = 0
        for (let [val1, val2] of eachChunk(allValues, 2)) {
            this.addValue(index * 38, 0, val1)
            this.addValue(index * 38, 7, val2)
            index += 1
        }

        this.updateView(market);
    }

    private addValue(x: number, y: number, value: PureValue) {
        let valueLabel: EconomicValue = new EconomicValue(value, x, y)
        this.valueLabels[value] = valueLabel
        this.add(valueLabel)
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
