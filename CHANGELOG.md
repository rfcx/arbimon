<!---
All logs should be useful to & readable by end-users
Do not write about internal work (ex: refactoring) unless it has an impact on the end-user

Allowed categories:
- Notes
- Features
- Bug Fixes
- Enhancements
- Breaking changes
--->

# 1.0.0-rc3 (2021-12-23)

## Features

- **dashboard:** Maps for Species Richness & Detection Frequency [#314]

## Enhancements

- TODO

## Bug Fixes

- TODO

# 1.0.0-rc2 (2021-12-22)

## Features

- **spotlight:** Species call spectrogram and audio [#326]
- **spotlight:** Extinction risk rating [#320]
- **spotlight:** CSV Export [#146]
- **dashboard:** Richness by extinction rating [#332]

## Enhancements

- **species:** Add species common name [#330]
- **spotlight:** Fix species-selector styles & alignment [#146]
- **activity:** Reconnect filter [#312]
- **activity:** Improve table UI for multiple datasets [#312]
- **activity:** Update CSV to support multiple datasets [#370]
- **exports:** Add export button to charts and maps everywhere consistently [#329]
- **filters:** Searchable drop-down for site filter [#50]
- **filters:** Improve date-range picker [#55]
- **maps:** Center map on project [#351]
- **maps:** Replace scroll to zoom with +/- buttons (to avoid conflicts with page scrolling) [#350]
- **navbar:** Remove "analytics" and give more space for project title [#353]
- **line-charts:** Show hour-of-day, day-of-week, month-of-year (remove by quarter, by year) [#325]
- **line-charts:** Add axis titles to chart exports [#199]
- **line-chart:** Increase font size for x/y axis ticks [#327]

## Bug Fixes

- **activity:** Remove naive occupancy from line chart [#328]
- **spotlight:** Fix IUCN citation [#321]
- **charts:** Fix chart downloads on Firefox [#171]
- **dx:** Verify Safari serve is working [#246]

# 1.0.0-rc1 (2021-12-13)

## Enhancements

- **project:** Support Puerto Rico project id in staging

# 0.0.11 (2021-12-08)

## Features

- **dashboard:** Project profile panel [#308]
- **dashboard:** "Top Taxons" bar & badges panel [#315]
- **dashboard:** Highlighted Species panel [#304]
- **dashboard:** Endangered species panel [#316]
- **dashboard:** Line chart for species and detection frequency [#313]

## Enhancements

- **spotlight:** Searchable species selector [#228]
- **species:** Update species name style [#229]

# 0.0.10 (2021-11-27)

## Features

- **export:** Legend for bar & line charts [#109]
- **dashboard:** Project metrics with mock api connecting [#303]

# 0.0.9 (2021-11-25)

## Features

- **activity-overview:** Export species information match to the table species as csv [#282]
- **activity-overview:** Species table which display each species detection, detection frequency, occupied sites, and naive occupancy [#281]
- **activity-overview:** Group detection, detection frequency, and occupancy map [#255][#257]
- **activity-overview:** Group detection, detection frequency, and occupancy line chart [#259][#260]
- **selection:** Add taxon in dataset comparison filter [#219]
- **selection:** Remove taxon toggle from map [#267]

# 0.0.8 (2021-11-22)

## Features

- **inclusion:** New inclusive color theme (better contrast & color-blindness support) [#300]
- **overview:** Sitemap on overview page [#277]

# 0.0.7 (2021-11-19)

## Features

- **overview:** Puerto Rico project information [#278]
- **activity-patterns:** Puerto Rico "Predicted Occupancy" maps [#285]
- **activity-patterns:** Species information from IUCN [#165][#294]
- **activity-patterns:** Group detection, detection frequency, and occupancy map [#261]

## Bug Fixes

- **auth:** Do not redirect to overview after deep-link [#293]

# 0.0.6 (2021-11-12)

> // TODO: Replace this with logs
> Sprint Goal:
>
> - [Activity Pattern]
>   - Map: detection, detection frequency, occupancy by location
>   - Line chart: detection, detection frequency, occupancy ratio by time
> - [Filter]
>   - Add taxon filter in the Dataset comparison
>   - Remember Dataset filter across different reports
> - [API] Setup API & Species Richness data structure
> - [UI] Increase map bubble contrast
> - [Export] Add legends on chart and map exports

# 0.0.5 (2021-10-27)

> // TODO: Replace this with logs
> Sprint Goal:
>
> - [Species Richness]
>   - Real data from Puerto Rico project (as embed JSON file in the project)
>   - UI & Usability improvement
>   - Export menu
>   - Table sort & pagination
>   - Line chart bug fixes & UI improvement
> - [Activity Pattern]
>   - Add title & comparison box
>   - POC on species information with Wikipedia / IUCN Red List
>   - Add detection frequency & occupancy metrics
> - Other improvements
>   - refactoring code, prepare for the new structure of data

# 0.0.4 (2021-10-13)

> // TODO: Replace this with logs
> Sprint Goal:
>
> - New elements in Species Richness page
> - Line chart that represents dataset by time (hour, day, month, year)
> - Map
> - Add export feature to map chart
> - Pick background style & toggle place names
> - Table represents species name data, and export as csv feature
> - Other improvements
> - Move species group toggle to the top level filter
> - Improve png export to be dark foreground
> - Support responsive: bar chart, filter box
> - Start on Activity Pattern page (if all mentioned above are done)

- **fixed:** Update SR line-chart to correctly display SR instead of detections (#172)
- **refactor:** Refactor species richness table display (#112)

# 0.0.3 (2021-09-29)

> // TODO: Replace this with logs
> Sprint Goal:
>
> - First version of Map chart
> - Improve species richness count graph to include the comparison data source
> - Export graph as image figure
> - [Bonus] Refactor some code: stream => site / env file / pop up component / search sites

# 0.0.2 (2021-09-23)

> // TODO: Replace this with logs
>
> - Sprint Goal:
> - Species count per Taxonomic Group (histogram)
> - Real data from Puerto Rico project (via export)
> - Filter site list
> - Filter start/end dates

# 0.0.1 (2021-09-15)

- **setup:** CE-1261 Setup biodiversity analytics project ([CE-1261](https://jira.rfcx.org/browse/CE-1261))
- **setup:** CE-1297 Setup biodiversity analytics deployment ([CE-1297](https://jira.rfcx.org/browse/CE-1297))
- **setup:** CE-1335 Setup navigation bar with project selector ([CE-1335](https://jira.rfcx.org/browse/CE-1335))
- **setup:** CE-1262 Set up authentication page ([CE-1262](https://jira.rfcx.org/browse/CE-1262))
- **setup:** CE-1348 Set up biodiversity analytics store data tool([CE-1348](https://jira.rfcx.org/browse/CE-1348))
- **setup:** Set up api service for calling an api

# LEGACY

// TODO: Move to correct version: 0.0.2 - 0.0.6

- **feature:** CE-1327 User can see the comparison box at the top of report ([CE-1327](https://jira.rfcx.org/browse/CE-1327))
- **feature:** CE-1357 User can change project directly in Analytics website ([CE-1357](https://jira.rfcx.org/browse/CE-1357))
- **feature:** See species by taxonomic group in graph (#12, #27, #42)
- **feature:** Export graph as image (#31)
- **feature:** Improve bar chart to support group bar chart (#58)
- **feature:** Getting the comparison filter box ready for chart data (#59)
- **feature:** Map of species count by site (#41)
- **feature:** Map to be export as png (#86)
- **feature:** Map style toggle (#88)
- **feature:** Bar chart support responsive (#61)
- **feature:** Table - list species name in the table (#82)
- **feature:** Export species richness raw data as csv (#36)
- **feature:** Activity patterns species selector (#89)
- **feature:** Detected species by time (#20)
- **feature:** Export csv support multiple datasets(#106)
- **feature:** Each species row in table should be clickable and link to ap page (#110)
- **feature:** Export line chart as PNG (#85)
- **feature:** Function to compute shortname to describe dataset and update export filename(#107, #108)
- **feature:** Add comparison box list to Activity patterns page (#129)
- **feature:** Table pagination (#135)
- **feature:** Update the table row to be consistent row (#160)
- **feature:** Table sort by species name or class (#147)
- **feature:** Add export ellipsis button(#131)
- **feature:** Research about API to get species information (#163)
- **feature:** Activity patterns page detection frequency and occupancy rate metrics (#130)
- **feature:** Species richness page add `altitude` column to CSV file (#173)
- **feature:** Activity Patterns Map - Detection Frequency by Location (#193)
- **feature:** Activity Patterns Map - Detection by location (#90)
- **feature:** Activity Patterns Map - Occupancy by Location (#194)
- **feature:** Activity patterns Line chart - Detection and detection frequency by time (#196)
- **feature:** Activity patterns Line chart - Occupancy ratio by time (#153)
- **feature:** Activity patterns Metrics - Eliminate the symbol (%) since “frequency”and “ratio” are not percentage (#230)
- **feature:** API prototype
