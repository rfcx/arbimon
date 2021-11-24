export interface LegendEntry {
  pixels: number
  value: number
}

const prettyRound = (input: number): number => {
  return Math.ceil(input) // TODO ??? - Make this prettier...
}

export const getLegendSizes = (maxPixels: number, maxValue: number, legendItemCount: number): LegendEntry[] => {
  // Only support positive integer values
  if (maxValue <= 0) return []

  // Round maxValue up to nice number (& scale pixels proportionally)
  const maxValuePretty = prettyRound(maxValue)
  const maxPixelsLegend = maxPixels / maxValue * maxValuePretty

  // Create requested number of entries
  return Array.from({ length: legendItemCount }, (_, idx) => ({
    pixels: maxPixelsLegend * ((idx + 1) / legendItemCount),
    value: maxValuePretty * ((idx + 1) / legendItemCount)
  }))
}
