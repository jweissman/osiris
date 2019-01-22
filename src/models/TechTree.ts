import { Machine } from "./Machine";
import { range } from "../Util";
import { Discipline, TechnologyRank, disciplineTree } from "./TechnologyRank";

export class TechTree {
    currentLevels: {
        [key in Discipline]: number;
    } = {
            [Discipline.Survival]: -1,
            [Discipline.LibraryScience]: -1,
        };

    findDisciplineToRankUp(machines: (typeof Machine)[]): Discipline {
        for (let disciplineName of Object.keys(Discipline)) {
            let discipline: Discipline = Discipline[disciplineName];
            if (this.canRankUp(discipline, machines)) {
                return discipline;
            }
        }
        return null;
    }

    rankUp(discipline: Discipline): TechnologyRank {
        this.currentLevels[discipline] += 1;
        return this.currentRank(discipline);
    }

    private currentRank(discipline: Discipline): TechnologyRank {
        return disciplineTree[discipline][this.currentLevels[discipline]];
    }

    private canRankUp(discipline: Discipline, machines: (typeof Machine)[]): boolean {
        let level = this.currentLevels[discipline];
        let nextLevel: TechnologyRank = disciplineTree[discipline][level + 1];
        if (nextLevel) {
            if (nextLevel.prereqs.every(machine => machines.includes(machine))) {
                return true;
            }
        }
        return false;
    }

    allUnlockedMachines(): (typeof Machine)[] {
        let unlocked = [];
        for (let disciplineName of Object.keys(Discipline)) {
            unlocked.push(...this.unlockedMachinesFor(Discipline[disciplineName]));
        }
        return unlocked;
    }

    private unlockedMachinesFor(discipline: Discipline) {
        let tree = disciplineTree[discipline];
        let unlocked = [];
        let level = this.currentLevels[discipline] + 1;
        for (let i in range(level)) {
            unlocked.push(...tree[i].unlocks);
        }
        return unlocked;
    }
}
