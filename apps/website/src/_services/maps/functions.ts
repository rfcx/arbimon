import { Map as MapboxMap } from 'mapbox-gl'

import { withFileName, zipAndDownload } from '@rfcx-bio/utils/file'
import { asPromise } from '@rfcx-bio/utils/fp'

import { canvasToPngBlob, svgToCanvas } from '~/charts'
import { generateMapLegend } from './map-legend'
import { MapBaseLegendEntry } from './types'

export const downloadMapPng = async (map: MapboxMap, filename: string, legendEntry: MapBaseLegendEntry[]): Promise<void> => {
  const mapBlobPromise = canvasToPngBlob(map.getCanvas())
    .then(withFileName(`${filename}.png`))

  const legendBlobPromise = asPromise(legendEntry)
    .then(generateMapLegend)
    .then(svgToCanvas)
    .then(canvasToPngBlob)
    .then(withFileName(`${filename}-legend.png`))

  await Promise.all([mapBlobPromise, legendBlobPromise])
    .then(async files => await zipAndDownload(files, filename))
}
