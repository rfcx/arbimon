import { Dayjs } from 'dayjs'
import JSZip from 'jszip'
import XLSX from 'xlsx'

import { FileModels, SiteModels } from '@/models'
import { VuexService } from '@/services'

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
  downloadFile(URL.createObjectURL(blob), folderName, 'zip')
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

const DATE_FORMAT = 'YYMMDD'

export function getExportName (startDate: Dayjs, endDate: Dayjs, sites: SiteModels.Site[], prefix: string): string {
  const project = VuexService.Project.selectedProject.get()

  let siteName = 'All_Sites'
  const siteLength = sites.length
  if (siteLength === 1) {
    siteName = sites[0].name
  } else if (siteLength > 1) {
    siteName = `${sites[0].name}+${siteLength - 1}-other-sites`
  }

  const start = startDate.format(DATE_FORMAT)
  const end = endDate.format(DATE_FORMAT)
  const date = startDate.isSame(endDate, 'date') ? `${start}-${end}` : start
  return `${project?.name ?? 'None'}--${prefix}--${siteName}--${date}`
}
