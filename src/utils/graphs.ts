export const svgToPngData = async (svg: SVGGElement, width: number, height: number): Promise<string> => {
  const serializer = new XMLSerializer()
  const source = serializer.serializeToString(svg)

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
      const finalWidth = width
      const finalHeight = height

      // Define the canvas intrinsic size
      canvas.width = finalWidth
      canvas.height = finalHeight

      // Render image in the canvas
      context?.drawImage(image, 0, 0, finalWidth, finalHeight)
      // Fullfil and Return the Base64 image
      const pngDataURL = canvas.toDataURL(mimetype, quality)
      console.log(pngDataURL)
      resolve(pngDataURL)
    }

    // Load the SVG in Base64 to the image
    image.src = svgBase64
  })
}
