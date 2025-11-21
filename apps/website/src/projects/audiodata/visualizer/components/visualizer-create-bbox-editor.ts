export interface BBox {
  x1: number
  y1: number
  x2: number
  y2: number
}

export interface Point {
  sec: number
  hz: number
}

export class CreateBBoxEditor {
  public minEps = 0.001
  public scalex = 1.0
  public scaley = 0.001
  public bbox: BBox | null = null
  public points: Array<[number, number]> = []
  public tracer: [number, number] | null = null
  public valid = false

  constructor () {
    this.reset()
  }

  reset (): this {
    this.bbox = null
    this.points = []
    this.tracer = null
    this.valid = false
    return this
  }

  make_new_bbox (): void {
    this.bbox = { x1: 0, y1: 0, x2: 0, y2: 0 }
    this.points = []
    this.valid = false
  }

  add_tracer_point (x: number, y: number): void {
    if (this.bbox && !this.valid) {
      const tracer: [number, number] = [x, y]
      this.tracer = tracer
      this.validate([tracer])
    }
  }

  add_point (x: number, y: number, minEps = this.minEps): void {
    const similars = this.points?.filter((pt) => {
        const dx = (pt[0] - x) * this.scalex
        const dy = (pt[1] - y) * this.scaley
        const dd = dx * dx + dy * dy
        return dd <= minEps
      })

    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    if (similars && similars.length > 0) {
      return
    }

    if (!this.bbox) {
      this.make_new_bbox()
    }

    if (this.points.length < 2) {
      this.points.push([x, y])
    }

    this.validate()
  }

  validate (tmpPoints?: Array<[number, number]>): void {
    const ptsX = this.points.map((x) => x[0])
    const ptsY = this.points.map((x) => x[1])

    if (tmpPoints) {
      ptsX.push.apply(ptsX, tmpPoints.map((x) => x[0]))
      ptsY.push.apply(ptsY, tmpPoints.map((x) => x[1]))
    }

    if (this.bbox !== null) {
      this.bbox.x1 = Math.min.apply(null, ptsX)
      this.bbox.y1 = Math.min.apply(null, ptsY)
      this.bbox.x2 = Math.max.apply(null, ptsX)
      this.bbox.y2 = Math.max.apply(null, ptsY)
    }
    this.valid = this.points.length >= 2
  }
}
