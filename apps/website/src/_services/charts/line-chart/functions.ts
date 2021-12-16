import * as d3 from 'd3'

import { generateHorizontalLegend, getLegendGroupNames } from '..'
import { LineChartConfig, LineChartSeries } from './types'

const X_TITLE_MARGIN_TOP = 50

export const generateChart = (datasets: LineChartSeries[], config: LineChartConfig): d3.Selection<SVGSVGElement, undefined, null, undefined> => {
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
  const yTickFormatter = (val: d3.NumberValue): string => Number.isInteger(val) ? d3.format('d')(val) : d3.format('.1e')(val)

  const xAxis = (g: any): unknown => g
    .attr('transform', `translate(0, ${config.height - config.margins.bottom})`)
    .call(d3.axisBottom(xScale).ticks(xValues.length).tickSizeOuter(0).tickFormat(xTickFormatter))

  const yScale = d3.scaleLinear()
    .domain(yBounds).nice()
    .range([config.height - config.margins.bottom, config.margins.top])

  const yAxis = (g: any): unknown => g
    .attr('transform', `translate(${config.margins.left}, 0)`)
    .call(d3.axisLeft(yScale).tickFormat(yTickFormatter))

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
      .attr('stroke-width', 2)

    svg.selectAll('.line-point')
      .data(xValues.filter(line.defined()))
      .enter().append('circle')
      .attr('r', 3)
      .attr('transform', x => `translate(${xScale(x)}, ${yScale(data[x] ?? 0)})`)
      .style('fill', dataset.color)
  })

  return svg
}

export function generateAxisTitle <T extends d3.BaseType> (svg: d3.Selection<T, undefined, null, undefined>, width: number, chartHeight: number, xTitle: string, yTitle: string): void {
  svg.append('text')
      .attr('y', chartHeight)
      .attr('x', width / 2)
      .attr('dx', '1em')
      .attr('fill', 'currentColor')
      .style('text-anchor', 'middle')
      .text(xTitle)

  svg.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 0)
      .attr('x', 0 - ((chartHeight - X_TITLE_MARGIN_TOP) / 2))
      .attr('dy', '1em')
      .attr('fill', 'currentColor')
      .style('text-anchor', 'middle')
      .text(yTitle)
}

export const generateChartInternal = (datasets: LineChartSeries[], config: LineChartConfig): SVGSVGElement | null => {
  const svg = generateChart(datasets, config)
  return svg.node()
}

export const generateChartExport = (datasets: LineChartSeries[], config: LineChartConfig, xTitle: string, yTitle: string): SVGSVGElement | null => {
  const { width, height, margins } = config
  const extendedMarginBottom = margins.bottom + X_TITLE_MARGIN_TOP
  const svg = generateChart(datasets, { ...config, margins: { ...margins, bottom: extendedMarginBottom } })

  const labels = getLegendGroupNames(datasets.length)
  const colors = datasets.map(d => d.color)
  const chartHeight = height - margins.bottom

  generateAxisTitle(svg, width, chartHeight, xTitle, yTitle)
  generateHorizontalLegend(width, chartHeight, labels, colors, svg)

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
