import { Vector } from "excalibur";

const extremumBy = (arr, pluck, extremum) => {
  return arr.reduce(function(best, next) {
    var pair = [ pluck(next), next ];
    if (!best) {
       return pair;
    } else if (extremum.apply(null, [ best[0], pair[0] ]) == best[0]) {
       return best;
    } else {
       return pair;
    }
  },null)[1];
}

export const minBy = (arr, fn) => extremumBy(arr, fn, Math.min)
export const maxBy = (arr, fn) => extremumBy(arr, fn, Math.max)


export const sample = (arr) => arr[Math.floor(Math.random() * arr.length)]

export const range = (n) => Array(n).fill(0).map((_val,idx) => idx)

export function closest<T>(cursor: Vector, arr: Array<T>, getVector: (T) => Vector, predicate?: (T) => boolean) {
   let matching: Array<T> = arr;
   if (predicate) { arr = arr.filter(predicate) }
   if (matching) {
      let distanceToCursor = (elem: T) => cursor.distance(getVector(elem)) //vec) => cursor.distance(vec)
      return minBy(matching, distanceToCursor)
   }
}

export const flatSingle = arr => [].concat(...arr);