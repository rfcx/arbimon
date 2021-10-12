import JSZip from 'jszip'
import XLSX from 'xlsx'

import { FileModels } from '@/models'

export async function generateSheet (jsonData: any, bookType?: XLSX.BookType, sheetName: string = 'Worksheet'): Promise<string> {
  const workbook = XLSX.utils.book_new()
  const worksheet = XLSX.utils.json_to_sheet(jsonData)
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName)
  return XLSX.write(workbook, { bookType, type: 'string' })
}

export async function zipFiles (files: FileModels.File[], folderName: string): Promise<void> {
  const zip = new JSZip()
  files.forEach(file => {
    zip.file(`${folderName}/${file.filename}`, file.data)
  })
  const blob = await zip.generateAsync({ type: 'blob' })
  downloadZip(URL.createObjectURL(blob), folderName)
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
