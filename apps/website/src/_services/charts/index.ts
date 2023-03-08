import * as d3 from 'd3'

import { downloadPng } from '@rfcx-bio/utils/file'

export const DATASET_LEGEND_GAP = 10
const EACH_LEGEND_WIDTH = 100
const GAP_BETWEEN_CIRCLE_AND_LEGEND = 15
const GAP_BETWEEN_LEGEND = 20

export const downloadSvgAsPng = async (svg: SVGSVGElement, filename: string): Promise<void> => {
 await svgToCanvas(svg)
    .then(canvasToPngDataUrl)
    .then(async pngDataUrl => { downloadPng(pngDataUrl, filename) })
}

export const svgToCanvas = async (svg: SVGSVGElement): Promise<HTMLCanvasElement> => {
  return await new Promise(resolve => {
    // Extract width/height
    const width = Number(svg.getAttribute('width')) || svg.viewBox.baseVal.width
    const height = Number(svg.getAttribute('height')) || svg.viewBox.baseVal.height

    // Ensure width/height explicitly set (required by Firefox)
    svg.setAttribute('width', `${width}`)
    svg.setAttribute('height', `${height}`)

    // Convert to Base64 SVG/XML
    const svgXml = new XMLSerializer().serializeToString(svg)
    const svgBase64 = 'data:image/svg+xml;base64,' + window.btoa(window.unescape(window.encodeURIComponent(svgXml)))

    // Setup canvas
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height

    // Render image to canvas
    const image = new Image()
    image.onload = () => {
      canvas.getContext('2d')?.drawImage(image, 0, 0, width, height)
      resolve(canvas)
    }
    image.src = svgBase64
  })
}

export const canvasToPngDataUrl = async (canvas: HTMLCanvasElement, mimetype = 'image/png', quality = 0.92): Promise<string> =>
  canvas.toDataURL(mimetype, quality)

export const canvasToPngBlob = async (canvas: HTMLCanvasElement, mimetype = 'image/png', quality = 0.92): Promise<Blob> =>
  await new Promise((resolve, reject) => {
 canvas.toBlob(
      (result: Blob | null): void => {
        if (result) resolve(result)
        else reject(new Error('Failed to convert canvas to blob'))
      },
      mimetype,
      quality
    )
})

export const clearChart = (id: string): void => {
  d3.select(`#${id}`).selectAll('*').remove()
}

// TODO: Return instead of mutate
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
  return Array.from({ length: totalGroup }, (_, idx) => `Dataset ${idx + 1}`)
}
