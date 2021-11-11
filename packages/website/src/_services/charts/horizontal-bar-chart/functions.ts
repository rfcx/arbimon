import * as d3 from 'd3'

import { generateHorizontalLegend, getLegendGroupNames } from '..'
import { BarChartConfig, GroupedBarChartItem } from '.'

const GROUP_MARGIN = 20
const BAR_MARGIN = 2

export interface GeneratedHorizontalChart {
  svg: d3.Selection<SVGSVGElement, undefined, null, undefined>
  chartHeight: number
}

export const generateChart = (data: GroupedBarChartItem[], config: BarChartConfig): GeneratedHorizontalChart => {
  const dataLength = data.length
  const dataSeriesLength = dataLength > 0 ? data[0].series.length : 0

  const maximumFrequency = Math.max(...data.map(d => Math.max(...d.series.map(v => v.frequency))))
  const barHeight = dataSeriesLength < 3 ? 30 : 60 / (dataSeriesLength === 0 ? 1 : dataSeriesLength)
  const groupHeight = dataSeriesLength * barHeight /** bar chart group y axis height */
  const chartWidth = config.width - config.margins.left - config.margins.right
  const chartHeight = (dataLength * groupHeight) + (dataLength * BAR_MARGIN) + (dataLength * GROUP_MARGIN)
  const fullHeight = chartHeight + config.margins.top + config.margins.bottom

  // =================== Scale setting =================
  // x axis scale configuration: d3 calculate the x number rely on maximum frequency (domain) and chart width (range)
  const xScale = d3.scaleLinear()
    .domain([0, maximumFrequency])
    .range([0, chartWidth])
    .nice()

  // x axis tick configuration: set tick to display only integer, hide tick, and add it padding
  const xAxis = d3.axisBottom(xScale)
    .tickFormat((d, i) => {
      return d.valueOf() % 1 !== 0 ? '' : d3.format('d')(d)
    })
    .tickSize(0)
    .tickPadding(5)

  // y axis scale configuration: d3 calculate the y position rely on data label (domain) and chart height (range)
  const yScale = d3.scaleBand()
    .domain(d3.map(data, (d) => d.group))
    .range([0, chartHeight])

  // y axis tick configuration: hide tick and add it padding
  const yAxis = d3.axisLeft(yScale)
    .tickSize(0)
    .tickPadding(5)

  const svg = d3.create('svg')
    .attr('viewBox', [0, 0, config.width, fullHeight].join(' '))
    .attr('fill', 'none')

  // adding x scale to the svg by setting
  svg.append('g')
    .attr('transform', `translate(${config.margins.left}, ${chartHeight})`)
    .transition()
    .call(xAxis)

  // adding y scale to the svg by setting
  svg.append('g')
    .transition()
    .attr('transform', `translate(${config.margins.left}, 0)`)
    .call(yAxis)

  // select all x and y matched `domain` class name and set scale stroke to be none (invisible)
  svg.selectAll('.domain')
    .style('stroke', 'none')

  // select all x and y matched `text` tag name and set text color and font size
  svg.selectAll('text')
    .style('color', config.fontColor)
    .style('font-size', '14px')

  // select all x and y matched `line` tag name and set scale line color to be none (invisible)
  svg.selectAll('line')
    .style('color', 'none')

  // =================== Generate bar group =================
  // select all match `category` class in `g` tag and binding data
  svg.selectAll('g.category')
    .data(data)
    .enter()
    .append('g')
    .classed('category', true)
    .attr('transform', (d, i) => {
      // center the group bar chart to label
      const y = (yScale(d.group) ?? 0) + 8
      return `translate(${config.margins.left},${y})`
    })
    // adding bar chart by looping item in `data`
    .each(function (d) {
      const category = d3.select(this)
      const seriesLength = d.series.length
      for (let idx = 0; idx < seriesLength; idx++) {
        const frequencyValue = d.series[idx].frequency
        const x = xScale(frequencyValue)
        const width = x === 0 ? 2 : x - xScale(0)
        const y = idx * (barHeight + BAR_MARGIN)
        // adding bar chart into each bar chart in bar group
        category.append('rect')
          .attr('x', xScale(0))
          .attr('y', y)
          .attr('width', width)
          .attr('height', barHeight)
          .style('fill', d.series[idx].color ?? '')

        // adding text label into each bar chart in bargroup
        const textSize = { width: 30, height: 10 }
        const xPosition = width + 4
        category.append('text')
          .text(frequencyValue)
          .attr('fill', config.fontColor)
          .style('color', config.fontColor)
          .style('font-size', '14px')
          .attr('width', textSize.width)
          .attr('height', textSize.height)
          // In case the number is too less
          .attr('x', xPosition)
          .attr('y', y + (barHeight / 2) + 5)
      }
    })

  return { svg, chartHeight }
}

export const generateChartInternal = (data: GroupedBarChartItem[], config: BarChartConfig): SVGSVGElement | null => {
  const { svg } = generateChart(data, config)
  return svg.node()
}

export const generateChartExport = (data: GroupedBarChartItem[], config: BarChartConfig): SVGSVGElement | null => {
  const { svg, chartHeight } = generateChart(data, config)

  const labels = getLegendGroupNames(data[0].series.length)
  const colors = data[0].series.map(s => s.color)
  generateHorizontalLegend(config.width, chartHeight, labels, colors, svg)

  return svg.node()
}
