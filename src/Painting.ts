import { Vector, Color } from "excalibur";
import { Rectangle } from "./values/Rectangle";
import { BackgroundPattern, getBackgroundPattern } from "./actors/Building/BackgroundPatterns";

type PaintingPath = { x: number, y: number }[]

export function pathFromRect(rect: Rectangle): PaintingPath {
  let pos = { x: rect.x, y: rect.y }
  let path = [
            // bottom-left
            { x: pos.x, y: pos.y + rect.height }, // this.getHeight() },

            // upper-left
            { x: pos.x, y: pos.y },

            // upper-right
            { x: pos.x + rect.width, y: pos.y },

            // bottom-right
            { x: pos.x + rect.width, y: pos.y + rect.height },
        ];

  return path
}

// tiny rendering lib
export function drawLine(ctx: CanvasRenderingContext2D, a: Vector, b: Vector, clr: Color = Color.White, lineWidth: number = 1) {
  let c = clr.clone()
  // c.a = 0.5
  ctx.beginPath()
  ctx.moveTo(a.x, a.y)
  ctx.lineTo(b.x, b.y)
  ctx.strokeStyle = c.toRGBA()
  ctx.lineWidth = lineWidth
  ctx.stroke()
}

export function drawPatternedRect(
  ctx: CanvasRenderingContext2D,
  rect: Rectangle,
  pattern: BackgroundPattern = BackgroundPattern.Grid
) {
  const gridPattern = getBackgroundPattern(ctx, pattern)
  if (gridPattern) {
    drawPatternedPoly(ctx, pathFromRect(rect), pattern)
    // let { x, y, width, height } = rect;
    // ctx.fillStyle = gridPattern
    // ctx.fillRect(x,y,width,height)

    //ctx.lineWidth = 0
    //ctx.setLineDash([])
    //ctx.strokeStyle = Color.White.toRGBA()
    //ctx.strokeRect(x,y,width,height)
  }
}

export function drawPatternedPoly(
  ctx: CanvasRenderingContext2D,
  path: {x:number, y:number}[],
  // rect: Rectangle,
  pattern: BackgroundPattern = BackgroundPattern.Grid
) {
  const gridPattern = getBackgroundPattern(ctx, pattern)
  if (gridPattern) {
    ctx.save()
    ctx.translate(path[0].x, path[0].y)
    // ctx.moveTo(0, 0)
    ctx.beginPath()
    ctx.moveTo(0,0) //path[0].x, path[0].y)
    path.forEach(pt => ctx.lineTo(pt.x - path[0].x, pt.y-path[0].y))
    ctx.lineTo(0,0) // path[0].x, path[0].y)
    ctx.closePath()
    // let { x, y, width, height } = rect;
    ctx.fillStyle = gridPattern
    ctx.fill()
    ctx.restore()
    // ctx.fillRect(x,y,width,height)

    // ctx.lineWidth = 2
    // ctx.setLineDash([])
    // ctx.strokeStyle = Color.White.toRGBA()
    // ctx.strokeRect(x,y,width,height)
  }
}

export function drawRect(
  ctx: CanvasRenderingContext2D,
  rectangle: Rectangle,
  edgeWidth: number = 0,
  color: Color = Color.White,
  filled: boolean = true,
  dashed: boolean = false
) {
  let { x, y, width, height } = rectangle;

  if (filled) {
    let main = color.clone();
    // main.a = 1
    ctx.fillStyle = main.toRGBA();
    ctx.fillRect(
      x,
      y,
      width,
      height
    )
  }

  if (edgeWidth > 0) {
    let edge = Color.White.clone();
    ctx.strokeStyle = edge.toRGBA();
    ctx.lineWidth=edgeWidth
    if (dashed) { ctx.setLineDash([5, 10]) }
    else { ctx.setLineDash([]) }
    ctx.strokeRect(
      x, y, width, height
    )
  }
}

export function drawPoly(
  ctx: CanvasRenderingContext2D,
  path: {x:number, y:number}[],
  color: Color
  // rect: Rectangle,
  // pattern: BackgroundPattern = BackgroundPattern.Grid
) {
  // const gridPattern = getBackgroundPattern(ctx, pattern)
  // if (gridPattern) {
    ctx.beginPath()
    ctx.moveTo(path[0].x, path[0].y)
    path.forEach(pt => ctx.lineTo(pt.x, pt.y))
    ctx.lineTo(path[0].x, path[0].y)
    ctx.closePath()
    // let { x, y, width, height } = rect;
    ctx.fillStyle = color.fillStyle()
    ctx.fill()
    // ctx.fillRect(x,y,width,height)

    // ctx.lineWidth = 2
    // ctx.setLineDash([])
    // ctx.strokeStyle = Color.White.toRGBA()
    // ctx.strokeRect(x,y,width,height)
  // }
}

export function drawStar(ctx, cx, cy, outerRadius=3.6, innerRadius=1.4, spikes=5, ) {
    var rot = Math.PI / 2 * 3;
    var x = cx;
    var y = cy;
    var step = Math.PI / spikes;

    ctx.beginPath();
    ctx.moveTo(cx, cy - outerRadius)
    for (let i = 0; i < spikes; i++) {
        x = cx + Math.cos(rot) * outerRadius;
        y = cy + Math.sin(rot) * outerRadius;
        ctx.lineTo(x, y)
        rot += step

        x = cx + Math.cos(rot) * innerRadius;
        y = cy + Math.sin(rot) * innerRadius;
        ctx.lineTo(x, y)
        rot += step
    }
    ctx.lineTo(cx, cy - outerRadius);
    ctx.closePath();
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'yellow';
    ctx.stroke();
    ctx.fillStyle = 'yellow';
    ctx.fill();
}