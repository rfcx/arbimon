import * as d3 from 'd3'

import { getLegendEntries, LegendEntry } from './index'

// pixels
const CONTAINER_DEFAULT_WIDTH = 160
const DEFAULT_ROW_HEIGHT = 16
const CONTAINER_PADDING_X = 5
const CONTAINER_PADDING_Y = 20
const DEFAULT_GAP_X = 10
const DEFAULT_GAP_Y = 5
const TITLE_HEIGHT = DEFAULT_ROW_HEIGHT + DEFAULT_GAP_Y

export const generateNormalizeMapLegend = (color: string, maxValue: number, maxRadius: number, legendEntriesNumber = 5, title?: string): Element | null => {
  if (maxValue === 0) return null

  const container = d3.create('div')
  const legendEntries = getLegendEntries(maxRadius, maxValue, legendEntriesNumber)
  const maxRadiusPixels = legendEntries[legendEntries.length - 1].pixels
  const legendEntriesHeight = (maxRadiusPixels * 2) * DEFAULT_GAP_Y
  const containerHeight = (CONTAINER_PADDING_Y * 2) + (title ? legendEntriesHeight + TITLE_HEIGHT : legendEntriesHeight)

  const calculateYPosition = (d: LegendEntry, idx: number): number => {
    return CONTAINER_PADDING_Y + (title ? TITLE_HEIGHT : 0) + ((maxRadius * 2) + DEFAULT_GAP_Y) * idx
  }

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
    .attr('cy', calculateYPosition)
    .attr('r', (d, i) => legendEntries[i].pixels)
    .style('fill', color)

  legend.append('text')
    .attr('x', CONTAINER_PADDING_X + (DEFAULT_GAP_X * 2) + (maxRadiusPixels * 2))
    .attr('y', calculateYPosition)
    .attr('dy', '.3em')
    .text((d, i) => legendEntries[i].value)
    .attr('fill', '#000')
    .style('color', '#000')
    .style('font-size', '14px')

  return container.node()
}
