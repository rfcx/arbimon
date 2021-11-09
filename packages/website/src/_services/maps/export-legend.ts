import * as d3 from 'd3'

const DEFAULT_WIDTH = 150
const DEFAULT_LINE_HEIGHT = 16
const MARGIN = {
  marginX: 5,
  marginY: 10
}

export const generateNormalizeMapLegend = (color: string, dataRange: number[], maximumRadius: number, title?: string): Element | null => {
  const container = d3.create('div')
  const radiusRatio = Math.ceil(dataRange.length / maximumRadius)

  const legendHeight = (title ? (dataRange.length + 1) * DEFAULT_LINE_HEIGHT : dataRange.length * DEFAULT_LINE_HEIGHT) + (MARGIN.marginY * 2)

  const svg = container
    .append('svg')
    .attr('width', DEFAULT_WIDTH)
    .attr('height', legendHeight)
    .append('g')
    .attr('transform', `translate(${MARGIN.marginX},${MARGIN.marginY})`)

  if (title) {
    svg.append('text')
      .attr('x', MARGIN.marginX)
      .attr('y', MARGIN.marginY)
      .text(title)
      .style('fill', '#000')
      .style('font-size', '14px')
  }

  const legend = svg.selectAll('.legend')
    .data(dataRange)
    .enter()
    .append('g')
    .attr('class', 'legend')

  legend.append('circle')
    .attr('cx', MARGIN.marginX)
    .attr('cy', (d, i) => MARGIN.marginY + (title ? (i + 1) * DEFAULT_LINE_HEIGHT : i * DEFAULT_LINE_HEIGHT))
    .attr('r', (d, i) => i * radiusRatio)
    .style('fill', color)

  legend.append('text')
    .attr('x', MARGIN.marginX + ((maximumRadius * 2) + 2))
    .attr('y', (d, i) => MARGIN.marginY + (title ? (i + 1) * DEFAULT_LINE_HEIGHT : i * DEFAULT_LINE_HEIGHT))
    .attr('dy', '.3em')
    .text(function (d) { return d })
    .attr('fill', '#000')
    .style('color', '#000')
    .style('font-size', '14px')

  return container.node()
}
