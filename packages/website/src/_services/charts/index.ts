import * as d3 from 'd3'

import { downloadPng } from '../utils/file'

export interface ChartSVGElement {
  svg: SVGSVGElement
  width: number
  height: number
}

const LEGEND_MARGIN_TOP = 50
const LEGEND_ITEM_WIDTH = 100

export const exportChartWithElement = async (element: Element, filename: string): Promise<void> => {
  const chartElement = getChartElement(element)
  await exportChart(chartElement, filename)
}

const exportChart = async (chartElement: ChartSVGElement, filename: string): Promise<void> => {
  const data = await svgToPngData(chartElement)
  downloadPng(data, filename)
}

const getChartElement = (element: Element): ChartSVGElement => {
  const svg = element.getElementsByTagName('svg')[0]
  const width = Number(svg.getAttribute('width') as string)
  const height = Number(svg.getAttribute('height') as string)
  return { svg, width, height }
}

export const svgToPngData = async (chartElement: ChartSVGElement): Promise<string> => {
  const serializer = new XMLSerializer()
  const source = serializer.serializeToString(chartElement.svg)

  const mimetype = 'image/png'
  const quality = 0.92
  const svgString = source

  return await new Promise(function (resolve, reject) {
    // Create a non-visible node to render the SVG string
    const SVGContainer = document.createElement('div')
    SVGContainer.style.display = 'none'
    SVGContainer.innerHTML = svgString
    const svgNode = SVGContainer.firstElementChild as Node

    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')
    const svgXml = new XMLSerializer().serializeToString(svgNode)
    const svgBase64 = 'data:image/svg+xml;base64,' + btoa(svgXml)

    const image = new Image()

    image.onload = function () {
      const finalWidth = chartElement.width
      const finalHeight = chartElement.height

      // Define the canvas intrinsic size
      canvas.width = finalWidth
      canvas.height = finalHeight

      // Render image in the canvas
      context?.drawImage(image, 0, 0, finalWidth, finalHeight)
      // Fullfil and Return the Base64 image
      const pngDataURL = canvas.toDataURL(mimetype, quality)
      resolve(pngDataURL)
    }

    // Load the SVG in Base64 to the image
    image.src = svgBase64
  })
}

export const clearChart = (id: string): void => {
  d3.select(`#${id}`).selectAll('*').remove()
}

export function generateHorizontalLegend <T extends d3.BaseType> (width: number, chartHeight: number, labels: string[], colors: string[], svg: d3.Selection<T, undefined, null, undefined>): void {
  const xStartPosition = ((width - (labels.length * LEGEND_ITEM_WIDTH)) / 2)
  const yPosition = chartHeight + LEGEND_MARGIN_TOP

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
