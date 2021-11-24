import * as d3 from 'd3'

// pixels
const CONTAINER_DEFAULT_WIDTH = 160
const DEFAULT_ROW_HEIGHT = 16
const CONTAINER_PADDING_X = 5
const CONTAINER_PADDING_Y = 20
const DEFAULT_GAP_X = 10
const DEFAULT_GAP_Y = 5
const TITLE_HEIGHT = DEFAULT_ROW_HEIGHT + DEFAULT_GAP_Y

export interface LegendEntry {
  pixels: number
  value: number
}

export const generateNormalizeMapLegend = (color: string, maxValue: number, maxRadius: number, legendEntriesNumber = 5, title?: string): Element | null => {
  if (maxValue === 0) return null

  const container = d3.create('div')
  const legendEntries = getLegendEntries(maxRadius, maxValue, legendEntriesNumber)
  const maxRadiusPixels = legendEntries[legendEntries.length - 1].pixels
  const legendEntriesHeight = (maxRadiusPixels * 2) * DEFAULT_GAP_Y
  const containerHeight = (CONTAINER_PADDING_Y * 2) + (title ? legendEntriesHeight + TITLE_HEIGHT : legendEntriesHeight)

  const svg = container
    .append('svg')
    .attr('width', CONTAINER_DEFAULT_WIDTH)
    .attr('height', containerHeight)
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
    .attr('cx', CONTAINER_PADDING_X + DEFAULT_GAP_X + maxRadiusPixels)
    .attr('cy', (d, i) => CONTAINER_PADDING_Y + calculateYAxis(maxRadiusPixels, i) + (title ? TITLE_HEIGHT : 0))
    .attr('r', (d, i) => legendEntries[i].pixels)
    .style('fill', color)

  legend.append('text')
    .attr('x', CONTAINER_PADDING_X + (DEFAULT_GAP_X * 2) + (maxRadiusPixels * 2))
    .attr('y', (d, i) => CONTAINER_PADDING_Y + calculateYAxis(maxRadiusPixels, i) + (title ? TITLE_HEIGHT : 0))
    .attr('dy', '.3em')
    .text((d, i) => legendEntries[i].value)
    .attr('fill', '#000')
    .style('color', '#000')
    .style('font-size', '14px')

  return container.node()
}

function calculateYAxis (maxRadius: number, idx: number): number {
  return ((maxRadius * 2) + DEFAULT_GAP_Y) * idx
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
