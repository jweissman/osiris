import { Vector, Color } from "excalibur";
import { Rectangle } from "./values/Rectangle";
import { getBackgroundPattern, BackgroundPattern } from "./actors/Building/BackgroundPatterns";

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

export function closest<T>(cursor: Vector, arr: Array<T>, getVector: (elem: T) => Vector, predicate?: (elem: T) => boolean) {
   let matching: Array<T> = arr;
   if (predicate) { arr = arr.filter(predicate) }
   if (matching) {
      let distanceToCursor = (elem: T) => cursor.distance(getVector(elem))
      return minBy(matching, distanceToCursor)
   }
}

export const flatSingle = arr => [].concat(...arr);

export const deleteByValue = (arr, elem) => arr.filter(e => e !== elem)

export const deleteByValueOnce = (arr, elem) => {
  let index = arr.indexOf(elem);
  if (index !== -1) arr.splice(index, 1);
}

export function eachCons(a, n) {
  var r = []
  for (var i = 0; i < a.length - n + 1; i++) {
    r.push(_ecRange(a, i, n))
  }
  return r
}

function _ecRange (a, i, n) {
  var r = []
  for (var j = 0; j < n; j++) {
    r.push(a[i + j])
  }
  return r
}

export function eachChunk(a, n) {
  return a.reduce(function (result, value, index, array) {
    if (index % n === 0)
      result.push(array.slice(index, index + n));
    return result;
  }, []);
}

export const measureDistance = (a: Vector, b: Vector) => a.distance(b)


export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function shuffle(arr) {
  return arr.sort(() => Math.random() > 0.5 ? 1 : -1)
}

export const zip = (a, b) => a.map((e, i) => [e, b[i]])

export const countOccurrences = (arr) => {
  let counts = {}
  arr.forEach((elem) => {
    counts[elem] = counts[elem] || 0
    counts[elem] += 1
  })
  return counts
}

export function containsUniq<T>(arr: T[], testElems: T[]) {
  let doesContain = false
  let arrCopy = arr.slice()
  if (arr.length > 0) {
    let missingItem = false
    testElems.forEach(testElem => {
      if (arrCopy.find(e => e === testElem)) {
        deleteByValueOnce(arrCopy, testElem)
      } else {
        missingItem = true
      }
    })
    doesContain = !missingItem
  }
  return doesContain
}


export function mixColors(a: Color, b: Color, factor: number = 0.5): Color {
  let aFactor = factor, bFactor = (1-factor)
  return new Color(
    (a.r * aFactor) + (b.r * bFactor),
    (a.g * aFactor) + (b.g * bFactor),
    (a.b * aFactor) + (b.b * bFactor),
    255
  )
}

export function onlyUnique(value, index, self) { 
    return self.indexOf(value) === index;
}