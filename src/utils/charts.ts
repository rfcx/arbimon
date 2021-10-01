import { ChartSVGElement } from '@/models/Chart'

export const exportChart = async (elementId: string, filename: string): Promise<void> => {
  const chartElement = getChartElement(elementId)
  const data = await svgToPngData(chartElement)
  downloadPng(filename, data)
}

const getChartElement = (id: string): ChartSVGElement => {
  const svg = document.getElementById(id)?.getElementsByTagName('svg')[0]
  if (!svg) { throw new Error('Invalid graph id') }
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
