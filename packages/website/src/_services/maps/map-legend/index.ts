export { generateNormalizeMapLegend } from './export-legend'

export interface LegendEntry {
  pixels: number
  value: number
}

const prettyRound = (input: number): number => {
  return Math.ceil(input) // TODO ??? - Make this prettier...
}

export const getLegendEntries = (maxPixels: number, maxValue: number, legendEntryCount: number): LegendEntry[] => {
  // Only support positive integer values
  if (maxValue <= 0) return []

  // Round maxValue up to nice number (& scale pixels proportionally)
  const maxValuePretty = prettyRound(maxValue)
  const maxPixelsLegend = maxPixels * maxValuePretty / maxValue

  // Create requested number of entries
  return Array.from({ length: legendEntryCount }, (_, idx) => ({
    pixels: maxPixelsLegend * ((idx + 1) / legendEntryCount),
    value: maxValuePretty * ((idx + 1) / legendEntryCount)
  }))
}
