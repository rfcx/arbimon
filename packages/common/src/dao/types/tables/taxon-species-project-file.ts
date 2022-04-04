export interface TaxonSpeciesProjectFile {
  taxonSpeciesId: number // 1
  projectId: number // 1
  order: number // 0
  fileUrl: string // https://blah-blah-storage.com/...
  filename: string // blah-blah.png
  mimeType: string // image/png
  description: string // Predicted Occupancy Map for Puerto Rico
}
