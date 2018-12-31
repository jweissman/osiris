import { Vector, Color } from "excalibur";
import { Rectangle } from "./values/Rectangle";

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

export const deleteByValue = (arr, elem) => arr.filter(e => e !== elem)

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

export const measureDistance = (a: Vector, b: Vector) => a.distance(b)


// tiny rendering lib
export function drawLine(ctx: CanvasRenderingContext2D, a: Vector, b: Vector, c: Color = Color.White, lineWidth: number = 1) {
  c.a = 0.5
  ctx.beginPath()
  ctx.moveTo(a.x, a.y)
  ctx.lineTo(b.x, b.y)
  ctx.strokeStyle = c.toRGBA()
  ctx.lineWidth = lineWidth
  ctx.stroke()
}

export function drawRect(
  ctx: CanvasRenderingContext2D,
  rectangle: Rectangle,
  edgeWidth: number = 0,
  color: Color = Color.White,
  filled: boolean = true
) {
  let { x, y, width, height } = rectangle;

  // if (edgeWidth > 0) {
  //   let edge = Color.White;
  //   ctx.fillStyle = edge.toRGBA();
  //   ctx.fillRect(x, y, width, height)
  // }

  if (filled) {
    let main = color;
    ctx.fillStyle = main.toRGBA();
    ctx.fillRect(
      x, //+ edgeWidth,
      y, //+ edgeWidth,
      width, // - edgeWidth * 2,
      height // - edgeWidth * 2
    )
  }

  if (edgeWidth > 0) {
    let edge = Color.White;
    ctx.strokeStyle = edge.toRGBA();
    ctx.strokeRect(
      x, y, width, height
    )
  }
}