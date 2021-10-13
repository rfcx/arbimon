import { DatasetDefinition } from '@/_services/api'
import { getAllDetections } from '@/_services/api/detections-service'
import { dayjs } from '@/_services/dayjs'

export interface ReportData {
  species: string
  site: string
  latitude: number
  longitude: number
  day: string
  month: string
  year: string
  date: string
  hour: number
}

export async function getReportRawData (dataset: DatasetDefinition): Promise<ReportData[]> {
  return (await getAllDetections(dataset))
    .map(({ speciesName, siteName, latitude, longitude, date, hour }) => {
      const newDate = dayjs.utc(date)
      return {
        species: speciesName,
        site: siteName,
        latitude,
        longitude,
        day: newDate.format('D'),
        month: newDate.format('M'),
        year: newDate.format('YYYY'),
        date: newDate.format('M/DD/YYYY'),
        hour
      }
    })
}
