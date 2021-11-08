import * as d3 from 'd3'

import { downloadPng } from '@rfcx-bio/utils/file'

export interface ChartSVGElement {
  svg: SVGSVGElement
  width: number
  height: number
}

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

  return await new Promise((resolve) => {
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

export function generateLegend (svg: d3.Selection<SVGGElement, undefined, null, undefined>): d3.Selection<SVGGElement, string, SVGGElement, undefined> {
  const legend = svg.selectAll('.legend')
    .data(['a', 'b', 'c'])
    .enter()
    .append('g')
    .attr('class', 'legend')

  legend.append('circle')
    .attr('cx', (_d, i) => (i * 100) + 150)
    .attr('cy', 140)
    .attr('r', 6)
    .style('fill', '#000aaa')

  legend.append('text')
    .attr('x', (_d, i) => (i * 100) + 160)
    .attr('y', 140)
    .attr('dy', '.3em')
    .text(function (d) { return d })
    .attr('fill', '#000aaa')
    .style('color', '#000aaa')
    .style('font-size', '14px')

  return legend
}
