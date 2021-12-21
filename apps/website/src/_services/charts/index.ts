import * as d3 from 'd3'

import { downloadPng } from '@rfcx-bio/utils/file'

interface SvgAndDimensions {
  svg: SVGSVGElement
  width: number
  height: number
}

export const Y_AXIS_GAP = 50
const LEGEND_ITEM_WIDTH = 80

export const exportChartWithElement = async (element: Element, filename: string): Promise<void> => {
  const chartElement = getChartElement(element)
  await exportChart(chartElement, filename)
}

const exportChart = async (svg: SvgAndDimensions, filename: string): Promise<void> => {
  const data = await svgToPng(svg)
  downloadPng(data, filename)
}

const getChartElement = (element: Element): SvgAndDimensions => {
  const svg = element.getElementsByTagName('svg')[0]
  const width = Number(svg.getAttribute('width') as string)
  const height = Number(svg.getAttribute('height') as string)
  return { svg, width, height }
}

export const svgToPng = async (params: SvgAndDimensions): Promise<string> => {
  // Params
  const mimetype = 'image/png'
  const quality = 0.92
  const width = params.width
  const height = params.height

  return await new Promise((resolve) => {
    // Convert to Base64 SVG/XML
    const svgXml = new XMLSerializer()
      .serializeToString(params.svg)
      .replace('<svg', `<svg width="${width}" height="${height}"`)

    const svgBase64 = 'data:image/svg+xml;base64,' + window.btoa(svgXml)

    // Convert to Base64 PNG
    const image = new Image()
    image.onload = () => {
      // Setup canvas
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height

      // Render image to canvas
      canvas.getContext('2d')?.drawImage(image, 0, 0, width, height)

      // Extract base64 image
      const pngDataURL = canvas.toDataURL(mimetype, quality)
      resolve(pngDataURL)
    }
    image.src = svgBase64
  })
}

export const clearChart = (id: string): void => {
  d3.select(`#${id}`).selectAll('*').remove()
}

export function generateHorizontalLegend <T extends d3.BaseType> (width: number, chartHeight: number, labels: string[], colors: string[], svg: d3.Selection<T, undefined, null, undefined>): void {
  const xStartPosition = ((width - (labels.length * LEGEND_ITEM_WIDTH)) / 2)
  const yPosition = chartHeight + Y_AXIS_GAP

  const legend = svg.selectAll('.legend')
    .data(labels)
    .enter()
    .append('g')
    .attr('class', 'legend')

  legend.append('circle')
    .attr('cx', (d, i) => (i * LEGEND_ITEM_WIDTH) + xStartPosition)
    .attr('cy', yPosition)
    .attr('r', 8)
    .style('fill', (d, i) => colors[i])

  legend.append('text')
    .attr('x', (d, i) => (i * LEGEND_ITEM_WIDTH) + (xStartPosition + 15))
    .attr('y', yPosition)
    .attr('dy', '.3em')
    .text(d => d)
    .attr('fill', '#000000')
    .style('color', '#000000')
    .style('font-size', '14px')
}

export function getLegendGroupNames (totalGroup: number): string[] {
  return [...Array(totalGroup).keys()].map(n => `Dataset ${n + 1}`)
}
