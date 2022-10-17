import * as d3 from 'd3'

import { MapBaseLegendEntry } from '../types'

const CONTAINER_DEFAULT_WIDTH = 160
const DEFAULT_ROW_HEIGHT = 16
const CONTAINER_PADDING_X = 5
const CONTAINER_PADDING_Y = 20
const DEFAULT_GAP_X = 10
const DEFAULT_GAP_Y = 5

const TITLE_HEIGHT = DEFAULT_ROW_HEIGHT + DEFAULT_GAP_Y

export const generateMapLegend = (legendEntries: MapBaseLegendEntry[], title?: string): SVGSVGElement => {
  const maxRadiusPixels = legendEntries[legendEntries.length - 1].radiusPx
  const legendEntriesHeight = (maxRadiusPixels * 2) * DEFAULT_GAP_Y // TODO: This looks wrong
  const containerHeight = (CONTAINER_PADDING_Y * 2) + (title ? legendEntriesHeight + TITLE_HEIGHT : legendEntriesHeight)

  const calculateYPosition = (d: MapBaseLegendEntry, idx: number): number => {
    return CONTAINER_PADDING_Y + (title ? TITLE_HEIGHT : 0) + (2 * maxRadiusPixels + DEFAULT_GAP_Y) * idx
  }

  const svg = d3
    .create('svg')
    .attr('width', CONTAINER_DEFAULT_WIDTH)
    .attr('height', containerHeight)

  svg
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
    .attr('r', d => d.radiusPx)
    .attr('stroke-width', d => d.style.strokeWidth)
    .style('fill', d => d.style.color)
    .style('stroke', d => d.style.strokeColor)

  legend.append('text')
    .attr('x', CONTAINER_PADDING_X + (DEFAULT_GAP_X * 2) + (maxRadiusPixels * 2))
    .attr('y', calculateYPosition)
    .attr('dy', '.3em')
    .text(d => d.label)
    .attr('fill', '#000')
    .style('color', '#000')
    .style('font-size', '14px')

  return svg.node() as SVGSVGElement
}
