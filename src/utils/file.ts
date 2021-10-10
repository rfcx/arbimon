import XLSX from 'xlsx'

export async function exportCSVFile (filename: string, jsonData: any, sheetName: string = 'Worksheet'): Promise<void> {
  const workbook = XLSX.utils.book_new()
  const worksheet = XLSX.utils.json_to_sheet(jsonData)
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName)
  XLSX.writeFile(workbook, filename, { bookType: 'csv' })
}
