import { type Map as MapboxMap } from 'mapbox-gl'

import { type JsZipFile, withFileName, zipAndDownload } from '@rfcx-bio/utils/file'
import { asPromise } from '@rfcx-bio/utils/fp'
import { isDefined } from '@rfcx-bio/utils/predicates'

import { canvasToPngBlob, svgToCanvas } from '~/charts'
import { generateMapLegend } from './map-legend'
import { type MapBaseLegendEntry } from './types'

export const downloadMapPng = async (map: MapboxMap, filename: string, legendEntry?: MapBaseLegendEntry[]): Promise<void> => {
  const mapBlobPromise = canvasToPngBlob(map.getCanvas())
    .then(withFileName(`${filename}.png`))

  const legendBlobPromise: Promise<JsZipFile> | undefined = legendEntry
    ? asPromise(legendEntry)
      .then(generateMapLegend)
      .then(svgToCanvas)
      .then(canvasToPngBlob)
      .then(withFileName(`${filename}-legend.png`))
    : undefined

  await Promise.all([mapBlobPromise, legendBlobPromise].filter(isDefined))
    .then(async files => { await zipAndDownload(files, filename) })
}
