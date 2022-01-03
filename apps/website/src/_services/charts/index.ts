import * as d3 from 'd3'

import { downloadPng } from '@rfcx-bio/utils/file'

// TODO 170: Delete this type (get from the SVG directly)
interface SvgAndDimensions {
  svg: SVGSVGElement
  width: number
  height: number
}

export const DATASET_LEGEND_GAP = 30
const EACH_LEGEND_WIDTH = 100
const GAP_BETWEEN_CIRCLE_AND_LEGEND = 15
const GAP_BETWEEN_LEGEND = 20

export const exportChartWithElement = async (element: Element, filename: string): Promise<void> => {
  const chartElement = getChartElement(element)
  await exportChart(chartElement, filename)
}

const exportChart = async (svg: SvgAndDimensions, filename: string): Promise<void> => {
  const data = await svgToPng(svg)
  downloadPng(data, filename)
}

export const getChartElement = (element: Element): SvgAndDimensions => {
  const svg = element.tagName === 'svg'
    ? element as SVGSVGElement
    : element.getElementsByTagName('svg')[0]

  return {
    svg,
    width: Number(svg.getAttribute('width') as string),
    height: Number(svg.getAttribute('height') as string)
  }
}
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

export function generateHorizontalLegend <T extends d3.BaseType> (svg: d3.Selection<T, undefined, null, undefined>, width: number, positionX: number, positionY: number, labels: string[], colors: string[]): void {
  const startXPosition = ((width / 2) - (((labels.length * EACH_LEGEND_WIDTH) + (labels.length * GAP_BETWEEN_CIRCLE_AND_LEGEND)) / 2))

  const legend = svg.selectAll('.legend')
    .data(labels)
    .enter()
    .append('g')
    .attr('class', 'legend')
    .attr('transform', `translate(${positionX} , ${positionY})`)

  legend.append('circle')
    .attr('r', 8)
    .attr('cx', (_, i) => (i * (EACH_LEGEND_WIDTH + GAP_BETWEEN_LEGEND)) + startXPosition)
    .style('fill', (_, i) => colors[i])

  legend.append('text')
    .text(d => d)
    .attr('x', (_, i) => (i * (EACH_LEGEND_WIDTH + GAP_BETWEEN_LEGEND)) + GAP_BETWEEN_CIRCLE_AND_LEGEND + startXPosition)
    .attr('dy', '.3em')
    .attr('fill', 'currentColor')
}

export function getLegendGroupNames (totalGroup: number): string[] {
  return [...Array(totalGroup).keys()].map(n => `Dataset ${n + 1}`)
}
