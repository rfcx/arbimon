import * as d3 from 'd3'
import numeral from 'numeral'

import { generateHorizontalLegend, getLegendGroupNames, X_AXIS_GAP, Y_AXIS_GAP } from '..'
import { LineChartConfig, LineChartSeries } from './types'

export const generateChart = (datasets: LineChartSeries[], config: LineChartConfig, xTitleDistance = 25, yTitleDistance = 25): d3.Selection<SVGSVGElement, undefined, null, undefined> => {
  // Prepare data
  const yBounds = [0, datasets.reduce((acc, cur) => Math.max(acc, Math.max(...Object.values(cur.data))), 0)]
  const xBounds = config.xBounds ?? getXBoundsFromDatasets(datasets)
  const xValues = Array.from({ length: xBounds[1] - xBounds[0] + 1 }, (_, i) => i + xBounds[0])

  // Setup axes
  const xScale = d3.scaleLinear()
    .domain(xBounds)
    .range([config.margins.left, config.width - config.margins.right])

  const xLabels = config.xLabels
  const xTickFormatter = xLabels ? (val: d3.NumberValue): string => xLabels[val.valueOf()] : d3.format('d')
  const yTickFormatter = (val: d3.NumberValue): string => Number.isInteger(val) ? numeral(val).format('0,0') : d3.format('.1e')(val)

  const xAxis = (g: any): unknown => g
    .attr('transform', `translate(${yTitleDistance}, ${config.height - config.margins.bottom})`)
    .call(d3.axisBottom(xScale).ticks(xValues.length).tickSizeOuter(0).tickFormat(xTickFormatter))

  const yScale = d3.scaleLinear()
    .domain(yBounds).nice()
    .range([config.height - config.margins.bottom, config.margins.top])

  const yAxis = (g: any): unknown => g
    .attr('transform', `translate(${config.margins.left + yTitleDistance}, 0)`)
    .call(d3.axisLeft(yScale).tickFormat(yTickFormatter))

  const width = config.width + yTitleDistance
  const height = config.height + xTitleDistance

  // Render chart
  const svg = d3.create('svg')
    .attr('viewBox', [0, 0, width, height].join(' '))
    .attr('fill', 'none')
    .attr('stroke-linejoin', 'round')
    .attr('stroke-linecap', 'round')

  svg.append('g').call(xAxis)
  svg.append('g').call(yAxis)

  generateAxisTitle(svg, config, xTitleDistance, yTitleDistance)

  // Render lines
  datasets.forEach((dataset) => {
    const data = dataset.data

    const line = d3.line<number>()
      .defined(d => d in data)
      .x(x => xScale(x) + yTitleDistance)
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
      .attr('stroke-width', 2)

    svg.selectAll('.line-point')
      .data(xValues.filter(line.defined()))
      .enter().append('circle')
      .attr('r', 3)
      .attr('transform', x => `translate(${xScale(x) + yTitleDistance}, ${yScale(data[x] ?? 0)})`)
      .style('fill', dataset.color)
  })

  return svg
}

export function generateAxisTitle <T extends d3.BaseType> (svg: d3.Selection<T, undefined, null, undefined>, config: LineChartConfig, xTitleDistance: number, yTitleDistance: number): void {
  let mostLeft = 0
  let mostBottom = 0

  svg.selectAll('text')
    .each(function () {
      const element = d3.select(this)
      const x = Number(element.attr('x'))
      const y = Number(element.attr('y'))
      if (mostBottom < y) {
        mostBottom = y
      }
      if (mostLeft > x) {
        mostLeft = x
      }
    })

  // X Title
  svg.append('g')
    .attr('transform', `translate(0, ${config.height - (config.margins.top + config.margins.bottom) + (xTitleDistance + mostBottom)})`)
    .append('text')
    .attr('x', ((config.width - config.margins.left) / 2) + config.margins.left)
    .attr('y', mostBottom + xTitleDistance)
    .attr('fill', 'currentColor')
    .style('text-anchor', 'middle')
    .text(config.xTitle)

  // Y Title
  svg.append('g')
    .attr('transform', `translate(${config.margins.left - yTitleDistance}, 0)`)
    .append('text')
    .attr('transform', 'rotate(-90)')
    .attr('x', 0 - ((config.height - config.margins.bottom) / 2))
    .attr('y', 0)
    .attr('fill', 'currentColor')
    .style('text-anchor', 'middle')
    .text(config.yTitle)
}

export const generateChartInternal = (datasets: LineChartSeries[], config: LineChartConfig): SVGSVGElement | null => {
  const svg = generateChart(datasets, config)
  return svg.node()
}

export const generateChartExport = (datasets: LineChartSeries[], config: LineChartConfig): SVGSVGElement | null => {
  const { width, height, margins } = config
  const newConfig = { ...config, margins: { ...margins, left: margins.left + X_AXIS_GAP, bottom: margins.bottom + Y_AXIS_GAP } }
  const svg = generateChart(datasets, newConfig, 25, 40)

  const labels = getLegendGroupNames(datasets.length)
  const colors = datasets.map(d => d.color)
  const chartHeight = height - margins.bottom

  generateHorizontalLegend(width, chartHeight - (Y_AXIS_GAP / 2), labels, colors, svg)

  svg.selectAll('text')
    .style('font-size', '1.25rem')

  return svg.node()
}

const getXBoundsFromDatasets = (datasets: LineChartSeries[]): [number, number] => {
  let xMin = Number.MAX_VALUE
  let xMax = Number.MIN_VALUE

  datasets.forEach(series => {
    const xActuals = Object.keys(series.data)
    xActuals.forEach(xActual => {
      const x = Number(xActual)
      if (x < xMin) xMin = x
      if (x > xMax) xMax = x
    })
  })

  return [xMin, xMax]
}
