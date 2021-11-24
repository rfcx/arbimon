import JSZip from 'jszip'
import XLSX from 'xlsx'

export interface FileData {
  filename: string
  data: string
}

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
  const a = document.createElement('a')
  a.download = `${filename}.${extension}`
  a.href = data
  document.body.appendChild(a)
  a.click()
  // then remove after click
  a.parentNode?.removeChild(a)
}

export function downloadPng (data: string, filename: string): void {
  downloadFile(data, filename, 'png')
}

export function downloadZip (data: string, filename: string): void {
  downloadFile(data, filename, 'zip')
}

export async function downloadSpreadsheet (jsonData: any, filename: string, fileType: XLSX.BookType = 'csv', sheetName: string = 'Worksheet'): Promise<void> {
  const worksheet = XLSX.utils.json_to_sheet(jsonData)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName)
  await XLSX.writeFile(workbook, filename, { bookType: fileType, type: 'string' })
}

export const zipAndDownload = async (files: FileData[], folderName: string): Promise<void> =>
  await zipFiles(files, folderName)
    .then(url => downloadZip(url, folderName))

async function zipFiles (files: FileData[], folderName: string): Promise<string> {
  const zip = new JSZip()

  files.forEach(file => {
    zip.file(`${folderName}/${file.filename}`, file.data)
  })

  const blob = await zip.generateAsync({ type: 'blob' })
  return URL.createObjectURL(blob)
}
