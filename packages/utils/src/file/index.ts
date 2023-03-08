import JSZip from 'jszip'
import XLSX from 'xlsx'

export type JsZipFileData = string | number[] | Uint8Array | ArrayBuffer | Blob | NodeJS.ReadableStream

export interface JsZipFile {
  filename: string
  data: JsZipFileData
}

export const withFileName = (filename: string) => (data: JsZipFileData): JsZipFile => ({ filename, data })

export async function toSpreadsheet (jsonData: any, fileType: XLSX.BookType = 'csv', sheetName: string = 'Worksheet'): Promise<string> {
  const worksheet = XLSX.utils.json_to_sheet(jsonData)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName)
  return XLSX.write(workbook, { bookType: fileType, type: 'string' })
}

export async function toCsv (jsonData: any): Promise<string> {
  return await toSpreadsheet(jsonData, 'csv')
}

export function downloadFile (data: string, filename: string, extension: string): void {
  // Create download link
  const a = document.createElement('a')
  a.download = `${filename}.${extension}`
  a.href = data
  document.body.appendChild(a)

  // Start download
  a.click()

  // Clean up
  a.parentNode?.removeChild(a)
}

export function downloadPng (data: string, filename: string): void {
  downloadFile(data, filename, 'png')
}

export function downloadZip (data: string, filename: string): void {
  downloadFile(data, filename, 'zip')
}

export async function zipAndDownload (files: JsZipFile[], folderName: string): Promise<void> {
  const url = await zipFiles(files, folderName)
  downloadZip(url, folderName)
}

async function zipFiles (files: JsZipFile[], folderName: string): Promise<string> {
  const zip = new JSZip()

  files.forEach(file => {
    zip.file(`${folderName}/${file.filename}`, file.data)
  })

  const blob = await zip.generateAsync({ type: 'blob' })
  return URL.createObjectURL(blob) // URGENT - This is being deprecated: https://developer.mozilla.org/en-US/docs/Web/API/URL/createObjectURL#using_object_urls_for_media_streams
}
