import * as d3 from 'd3'

import LineChart from './line-chart.vue'

export const LineChartComponent = LineChart

export interface LineChartConfig {
  height: number
  width: number
  margins: {
    top: number
    bottom: number
    left: number
    right: number
  }
  xBounds?: [number, number]
}

export interface LineChartSeries {
  color: string
  data: Record<number, number>
}

export const generateChart = (datasets: LineChartSeries[], config: LineChartConfig): SVGSVGElement | null => {
  // Prepare data
  const yBounds = [0, datasets.reduce((acc, cur) => Math.max(acc, Math.max(...Object.values(cur.data))), 0)]
  const xBounds = config.xBounds ?? getXBoundsFromDatasets(datasets)
  const xValues = Array.from({ length: xBounds[1] - xBounds[0] + 1 }, (_, i) => i + xBounds[0])

  // Setup axes
  const xScale = d3.scaleLinear()
    .domain(xBounds)
    .range([config.margins.left, config.width - config.margins.right])

  const xAxis = (g: any): unknown => g
    .attr('transform', `translate(0, ${config.height - config.margins.bottom})`)
    .call(d3.axisBottom(xScale).ticks(xValues.length).tickSizeOuter(0).tickFormat(d3.format('d')))

  const yScale = d3.scaleLinear()
    .domain(yBounds).nice()
    .range([config.height - config.margins.bottom, config.margins.top])

  const yAxis = (g: any): unknown => g
    .attr('transform', `translate(${config.margins.left}, 0)`)
    .call(d3.axisLeft(yScale))

  // Render chart
  const svg = d3.create('svg')
    .attr('viewBox', [0, 0, config.width, config.height].join(' '))
    .attr('fill', 'none')
    .attr('stroke-linejoin', 'round')
    .attr('stroke-linecap', 'round')

  svg.append('g').call(xAxis)
  svg.append('g').call(yAxis)

  // Render lines
  datasets.forEach((dataset) => {
    const data = dataset.data

    const line = d3.line<number>()
      .defined(d => d in data)
      .x(x => xScale(x))
      .y(x => yScale(data[x] ?? NaN))

    svg.append('path')
      .datum(xValues.filter(line.defined()))
      .attr('d', line)
      .attr('stroke', '#999')
      .attr('stroke-width', 1)
      .style('stroke-dasharray', ('3, 3'))
      .style('opacity', 50)

    svg.append('path')
      .datum(xValues)
      .attr('d', line)
      .attr('stroke', dataset.color)
      .attr('stroke-width', 3)
  })

  return svg.node()
}

const getXBoundsFromDatasets = (datasets: LineChartSeries[]): [number, number] => {
  let xMin = Number.MAX_VALUE
  let xMax = Number.MIN_VALUE

  datasets.forEach(series => {
    const xActuals = Object.keys(series.data)
    xActuals.forEach(xActual => {
      const x = Number(xActual)
      console.log(x)
      if (x < xMin) xMin = x
      if (x > xMax) xMax = x
    })
  })

  return [xMin, xMax]
}
