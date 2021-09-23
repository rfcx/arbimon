/* eslint-disable no-unused-vars */
const fs = require('fs')

const rawSpeciesRichnessStringData = fs.readFileSync('raw-species-richness-data-01-07-apr-2021.json')
const rawSpeciesRichnessData = JSON.parse(rawSpeciesRichnessStringData)

// Call fuction that needed
transformToSelectedSitesAndExportAsJSONFile(rawSpeciesRichnessData, '07-apr-2021.json')

/**
 * Transfrom raw data into site list json file
 * @param  {[Object]} data raw species richness data
 * @param  {[String]} filePath json desination path
 */
function transformToSitesAndExportAsJSONFile (data, filePath) {
  const splitter = '-----'
  const rawSiteList = Array.from(new Set(data.map(r => r.stream_id + splitter + r.name + splitter + r.lat + splitter + r.lon)))
  const siteList = rawSiteList.map(s => s.split(splitter)).map(tuple => ({ site_id: tuple[0], name: tuple[1], latitude: tuple[2], longitude: tuple[3] }))
  const json = JSON.stringify(siteList, null, 2)
  fs.writeFileSync(filePath, json, 'utf8')
}

function transformToSelectedSitesAndExportAsJSONFile (data, filePath) {
  const d = data.filter(i => i.date === '2021-04-07T00:00:00.000Z')
  const json = JSON.stringify(d, null, 2)
  fs.writeFileSync(filePath, json, 'utf8')
}
