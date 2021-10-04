import { ChartSVGElement } from '@/models/Chart'

export const exportChartWithElementId = async (elementId: string, filename: string): Promise<void> => {
  const chartElement = getChartElementById(elementId)
  await exportChart(chartElement, filename)
}

export const exportChartWithElement = async (element: Element, filename: string): Promise<void> => {
  const chartElement = getChartElement(element)
  await exportChart(chartElement, filename)
}

const exportChart = async (chartElement: ChartSVGElement, filename: string): Promise<void> => {
  const data = await svgToPngData(chartElement)
  downloadPng(filename, data)
}

const getChartElementById = (id: string): ChartSVGElement => {
  const element = document.getElementById(id)
  if (!element) { throw new Error('Invalid graph id') }
  return getChartElement(element)
}

const getChartElement = (element: Element): ChartSVGElement => {
  const svg = element.getElementsByTagName('svg')[0]
  const width = Number(svg.getAttribute('width') as string)
  const height = Number(svg.getAttribute('height') as string)
  return { svg, width, height }
}

const svgToPngData = async (chartElement: ChartSVGElement): Promise<string> => {
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

export const downloadPng = (filename: string, data: string): void => {
  const a = document.createElement('a')
  a.download = `${filename}.png`
  a.href = data
  document.body.appendChild(a)
  a.click()
  // then remove after click
  a.parentNode?.removeChild(a)
}
