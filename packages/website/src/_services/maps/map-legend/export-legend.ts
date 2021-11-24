import * as d3 from 'd3'

// pixels
const DEFAULT_WIDTH = 160
const DEFAULT_ROW_HEIGHT = 16
const DEFAULT_GAP_X = 10
const DEFAULT_GAP_Y = 5
const CONTAINER_PADDING_X = 5
const CONTAINER_PADDING_Y = 10

export interface LegendEntry {
  pixels: number
  value: number
}

export const generateNormalizeMapLegend = (color: string, maxValue: number, maxRadius: number, legendEntriesNumber = 5, title?: string): Element | null => {
  if (maxValue === 0) return null

  const container = d3.create('div')
  const legendEntries = getLegendEntries(maxRadius, maxValue, legendEntriesNumber)
  const plotHeight = (legendEntries[legendEntries.length - 1].pixels * 2) * DEFAULT_GAP_Y
  const legendHeight = (CONTAINER_PADDING_Y * 2) + (title ? plotHeight + (DEFAULT_ROW_HEIGHT + DEFAULT_GAP_Y) : plotHeight)

  const svg = container
    .append('svg')
    .attr('width', DEFAULT_WIDTH)
    .attr('height', legendHeight)
    .append('g')
    .attr('transform', 'translate(0,0)')

  if (title) {
    svg.append('text')
      .attr('x', CONTAINER_PADDING_X + DEFAULT_GAP_X)
      .attr('y', CONTAINER_PADDING_Y + DEFAULT_GAP_Y)
      .text(title)
      .style('fill', '#000')
      .style('font-size', '14px')
  }

  const legend = svg.selectAll('.legend')
    .data(legendEntries)
    .enter()
    .append('g')
    .attr('class', 'legend')

  legend.append('circle')
    .attr('cx', CONTAINER_PADDING_X + DEFAULT_GAP_X + legendEntries[legendEntries.length - 1].pixels)
    .attr('cy', (d, i) => CONTAINER_PADDING_Y + (title ? (DEFAULT_ROW_HEIGHT + DEFAULT_GAP_Y) + (((legendEntries[legendEntries.length - 1].pixels * 2) + DEFAULT_GAP_Y) * i) : ((legendEntries[legendEntries.length - 1].pixels * 2) + DEFAULT_GAP_Y) * i))
    .attr('r', (d, i) => legendEntries[i].pixels)
    .style('fill', color)

  legend.append('text')
    .attr('x', CONTAINER_PADDING_X + (DEFAULT_GAP_X * 2) + (legendEntries[legendEntries.length - 1].pixels * 2))
    .attr('y', (d, i) => CONTAINER_PADDING_Y + (title ? (DEFAULT_ROW_HEIGHT + DEFAULT_GAP_Y) + (((legendEntries[legendEntries.length - 1].pixels * 2) + DEFAULT_GAP_Y) * i) : ((legendEntries[legendEntries.length - 1].pixels * 2) + DEFAULT_GAP_Y) * i))
    .attr('dy', '.3em')
    .text((d, i) => legendEntries[i].value)
    .attr('fill', '#000')
    .style('color', '#000')
    .style('font-size', '14px')

  return container.node()
}

const prettyRound = (input: number): number => {
  return Math.ceil(input) // TODO ??? - Make this prettier...
}

export const getLegendEntries = (maxPixels: number, maxValue: number, legendEntryCount: number): LegendEntry[] => {
  // Only support positive integer values
  if (maxValue <= 0) return []

  // Round maxValue up to nice number (& scale pixels proportionally)
  const maxValuePretty = prettyRound(maxValue)
  const maxPixelsLegend = maxPixels / maxValue * maxValuePretty

  // Create requested number of entries
  return Array.from({ length: legendEntryCount }, (_, idx) => ({
    pixels: maxPixelsLegend * ((idx + 1) / legendEntryCount),
    value: maxValuePretty * ((idx + 1) / legendEntryCount)
  }))
}
