import * as d3 from 'd3'
import numeral from 'numeral'

import { DATASET_LEGEND_GAP, generateHorizontalLegend, getLegendGroupNames } from '..'
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
    .attr('transform', `translate(${yTitleDistance}, ${config.height - config.margins.bottom - xTitleDistance})`)
    .call(d3.axisBottom(xScale).ticks(xValues.length).tickSizeOuter(0).tickFormat(xTickFormatter))

  const yScale = d3.scaleLinear()
    .domain(yBounds).nice()
    .range([config.height - config.margins.bottom - xTitleDistance, config.margins.top])

  const yAxis = (g: any): unknown => g
    .attr('transform', `translate(${config.margins.left + yTitleDistance}, 0)`)
    .call(d3.axisLeft(yScale).tickFormat(yTickFormatter))

  // Render chart
  const svg = d3.create('svg')
    .attr('viewBox', [0, 0, config.width, config.height].join(' '))
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
  const { width, height, margins, xTitle, yTitle } = config

  let mostBottom = 0
  svg.selectAll('text')
    .each(function () {
      const element = d3.select(this)
      const y = Number(element.attr('y'))
      if (mostBottom < y) {
        mostBottom = y
      }
    })

  // X Title
  svg.append('g')
    .attr('transform', `translate(0, ${height - (margins.top + margins.bottom) + (xTitleDistance + mostBottom)})`)
    .append('text')
    .attr('x', ((width - margins.left) / 2) + margins.left)
    .attr('y', mostBottom)
    .attr('fill', 'currentColor')
    .style('text-anchor', 'middle')
    .text(xTitle)

  // Y Title
  svg.append('g')
    .attr('transform', `translate(${margins.left - yTitleDistance}, 0)`)
    .append('text')
    .attr('transform', 'rotate(-90)')
    .attr('x', 0 - ((height - margins.bottom) / 2))
    .attr('y', 0)
    .attr('fill', 'currentColor')
    .style('text-anchor', 'middle')
    .text(yTitle)
}

export const generateChartInternal = (datasets: LineChartSeries[], config: LineChartConfig): SVGSVGElement | null => {
  const svg = generateChart(datasets, config)
  return svg.node()
}

export const generateChartExport = (datasets: LineChartSeries[], config: LineChartConfig): SVGSVGElement | null => {
  const { width, height, margins } = config
  const newConfig = { ...config, margins: { ...margins, left: margins.left, bottom: margins.bottom + DATASET_LEGEND_GAP } }

  const xTitleDistance = 25
  const yTitleDistance = 40
  const svg = generateChart(datasets, newConfig, xTitleDistance, yTitleDistance)

  const labels = getLegendGroupNames(datasets.length)
  const colors = datasets.map(d => d.color)
  const positionX = margins.left - xTitleDistance
  const positionY = height - margins.bottom + (xTitleDistance * 2)
  generateHorizontalLegend(svg, width, positionX, positionY, labels, colors)

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
