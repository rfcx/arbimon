// TODO: fix species call seeder data into new type format

// import { ArbimonSpeciesCall } from '../../../data-ingest/species/arbimon-call'

// export const rawSpeciesCallData: Record<string, ArbimonSpeciesCall[]> = {
//   'Accipiter striatus venator': [
//     {
//       siteName: 'MA11',
//       projectName: 'Puerto Rico Island-Wide',
//       songType: 'Common Song',
//       recordedAt: '2021-04-18T11:25:02.517Z',
//       timezone: 'America/Puerto_Rico',
//       redirectUrl: 'https://arbimon.rfcx.org/project/puerto-rico-island-wide/visualizer/rec/27560659',
//       mediaWavUrl: 'https://media-api.rfcx.org/internal/assets/streams/Rq48bGCkR0NG_t20210418T112502517Z.20210418T112506208Z_fwav.wav',
//       mediaSpecUrl: 'https://media-api.rfcx.org/internal/assets/streams/Rq48bGCkR0NG_t20210418T112502517Z.20210418T112506208Z_d512.512_mtrue_fspec.png'
//     }
//   ],
//   'Actitis macularius': [
//     {
//       siteName: 'CR30',
//       projectName: 'Puerto Rico Island-Wide',
//       songType: 'Common Song',
//       recordedAt: '2021-05-03T09:55:00.770Z',
//       timezone: 'America/Puerto_Rico',
//       redirectUrl: 'https://arbimon.rfcx.org/project/puerto-rico-island-wide/visualizer/rec/28818103',
//       mediaWavUrl: 'https://media-api.rfcx.org/internal/assets/streams/Uz8Z3SJ5Twym_t20210503T095500770Z.20210503T095504770Z_fwav.wav',
//       mediaSpecUrl: 'https://media-api.rfcx.org/internal/assets/streams/Uz8Z3SJ5Twym_t20210503T095500770Z.20210503T095504770Z_d512.512_mtrue_fspec.png'
//     }
//   ],
//   'Agelaius xanthomus': [
//     {
//       siteName: 'CR12',
//       projectName: 'Puerto Rico Island-Wide',
//       songType: 'Common Song',
//       recordedAt: '2021-05-02T09:45:53.174Z',
//       timezone: 'America/Puerto_Rico',
//       redirectUrl: 'https://arbimon.rfcx.org/project/puerto-rico-island-wide/visualizer/rec/30366448',
//       mediaWavUrl: 'https://media-api.rfcx.org/internal/assets/streams/DO4Oc7KAafBq_t20210502T094553174Z.20210502T094554403Z_fwav.wav',
//       mediaSpecUrl: 'https://media-api.rfcx.org/internal/assets/streams/DO4Oc7KAafBq_t20210502T094553174Z.20210502T094554403Z_d512.512_mtrue_fspec.png'
//     },
//     {
//       siteName: 'CR12',
//       projectName: 'Puerto Rico Island-Wide',
//       songType: 'Common Song',
//       recordedAt: '2021-05-02T09:45:53.174Z',
//       timezone: 'America/Puerto_Rico',
//       redirectUrl: 'https://arbimon.rfcx.org/project/puerto-rico-island-wide/visualizer/rec/30366448',
//       mediaWavUrl: 'https://media-api.rfcx.org/internal/assets/streams/DO4Oc7KAafBq_t20210502T094553174Z.20210502T094554403Z_fwav.wav',
//       mediaSpecUrl: 'https://media-api.rfcx.org/internal/assets/streams/DO4Oc7KAafBq_t20210502T094553174Z.20210502T094554403Z_d512.512_mtrue_fspec.png'
//     }
//   ],
//   'Amazona amazonica': [
//     {
//       siteName: 'DO12',
//       projectName: 'Puerto Rico Island-Wide',
//       songType: 'Simple Call',
//       recordedAt: '2021-03-08T11:40:15.592Z',
//       timezone: 'America/Puerto_Rico',
//       redirectUrl: 'https://arbimon.rfcx.org/project/puerto-rico-island-wide/visualizer/rec/23598815',
//       mediaWavUrl: 'https://media-api.rfcx.org/internal/assets/streams/Rq9z8co6YL6I_t20210308T114015592Z.20210308T114020853Z_fwav.wav',
//       mediaSpecUrl: 'https://media-api.rfcx.org/internal/assets/streams/Rq9z8co6YL6I_t20210308T114015592Z.20210308T114020853Z_d512.512_mtrue_fspec.png'
//     }
//   ],
//   'Amazona viridigenalis': [
//     {
//       siteName: 'SAE10',
//       projectName: 'Puerto Rico Island-Wide',
//       songType: 'Common Song',
//       recordedAt: '2021-03-31T10:10:53.828Z',
//       timezone: 'America/Puerto_Rico',
//       redirectUrl: 'https://arbimon.rfcx.org/project/puerto-rico-island-wide/visualizer/rec/25966918',
//       mediaWavUrl: 'https://media-api.rfcx.org/internal/assets/streams/2pipm18yo0tv_t20210331T101053828Z.20210331T101056829Z_fwav.wav',
//       mediaSpecUrl: 'https://media-api.rfcx.org/internal/assets/streams/2pipm18yo0tv_t20210331T101053828Z.20210331T101056829Z_d512.512_mtrue_fspec.png'
//     }
//   ],
//   'Amazona vittata': [
//     {
//       siteName: 'RA21',
//       projectName: 'Puerto Rico Island-Wide',
//       songType: 'Common Song',
//       recordedAt: '2021-04-14T12:35:00.850Z',
//       timezone: 'America/Puerto_Rico',
//       redirectUrl: 'https://arbimon.rfcx.org/project/puerto-rico-island-wide/visualizer/rec/26272393',
//       mediaWavUrl: 'https://media-api.rfcx.org/internal/assets/streams/SnXZB3m2O1HC_t20210414T123500850Z.20210414T123505470Z_fwav.wav',
//       mediaSpecUrl: 'https://media-api.rfcx.org/internal/assets/streams/SnXZB3m2O1HC_t20210414T123500850Z.20210414T123505470Z_d512.512_mtrue_fspec.png'
//     }
//   ],
//   'Antrostomus noctitherus': [
//     {
//       siteName: 'GU36',
//       projectName: 'Puerto Rico Island-Wide',
//       songType: 'Common Song',
//       recordedAt: '2021-03-16T02:35:49.794Z',
//       timezone: 'America/Puerto_Rico',
//       redirectUrl: 'https://arbimon.rfcx.org/project/puerto-rico-island-wide/visualizer/rec/24868980',
//       mediaWavUrl: 'https://media-api.rfcx.org/internal/assets/streams/9Evtlqg7k69x_t20210316T023549794Z.20210316T023551317Z_fwav.wav',
//       mediaSpecUrl: 'https://media-api.rfcx.org/internal/assets/streams/9Evtlqg7k69x_t20210316T023549794Z.20210316T023551317Z_d512.512_mtrue_fspec.png'
//     },
//     {
//       siteName: 'GU36',
//       projectName: 'Puerto Rico Island-Wide',
//       songType: 'Common Song',
//       recordedAt: '2021-03-16T02:35:49.794Z',
//       timezone: 'America/Puerto_Rico',
//       redirectUrl: 'https://arbimon.rfcx.org/project/puerto-rico-island-wide/visualizer/rec/24868980',
//       mediaWavUrl: 'https://media-api.rfcx.org/internal/assets/streams/9Evtlqg7k69x_t20210316T023549794Z.20210316T023551317Z_fwav.wav',
//       mediaSpecUrl: 'https://media-api.rfcx.org/internal/assets/streams/9Evtlqg7k69x_t20210316T023549794Z.20210316T023551317Z_d512.512_mtrue_fspec.png'
//     },
//     {
//       siteName: 'GU36',
//       projectName: 'Puerto Rico Island-Wide',
//       songType: 'Common Song',
//       recordedAt: '2021-03-16T02:35:49.794Z',
//       timezone: 'America/Puerto_Rico',
//       redirectUrl: 'https://arbimon.rfcx.org/project/puerto-rico-island-wide/visualizer/rec/24868980',
//       mediaWavUrl: 'https://media-api.rfcx.org/internal/assets/streams/9Evtlqg7k69x_t20210316T023549794Z.20210316T023551317Z_fwav.wav',
//       mediaSpecUrl: 'https://media-api.rfcx.org/internal/assets/streams/9Evtlqg7k69x_t20210316T023549794Z.20210316T023551317Z_d512.512_mtrue_fspec.png'
//     }
//   ],
//   'Aramus guarauna': [
//     {
//       siteName: 'DO16',
//       projectName: 'Puerto Rico Island-Wide',
//       songType: 'Common Song',
//       recordedAt: '2021-03-04T05:30:43.032Z',
//       timezone: 'America/Puerto_Rico',
//       redirectUrl: 'https://arbimon.rfcx.org/project/puerto-rico-island-wide/visualizer/rec/23607482',
//       mediaWavUrl: 'https://media-api.rfcx.org/internal/assets/streams/pdMjTxlRIa6C_t20210304T053043032Z.20210304T053046447Z_fwav.wav',
//       mediaSpecUrl: 'https://media-api.rfcx.org/internal/assets/streams/pdMjTxlRIa6C_t20210304T053043032Z.20210304T053046447Z_d512.512_mtrue_fspec.png'
//     },
//     {
//       siteName: 'DO16',
//       projectName: 'Puerto Rico Island-Wide',
//       songType: 'Common Song',
//       recordedAt: '2021-03-04T05:30:43.032Z',
//       timezone: 'America/Puerto_Rico',
//       redirectUrl: 'https://arbimon.rfcx.org/project/puerto-rico-island-wide/visualizer/rec/23607482',
//       mediaWavUrl: 'https://media-api.rfcx.org/internal/assets/streams/pdMjTxlRIa6C_t20210304T053043032Z.20210304T053046447Z_fwav.wav',
//       mediaSpecUrl: 'https://media-api.rfcx.org/internal/assets/streams/pdMjTxlRIa6C_t20210304T053043032Z.20210304T053046447Z_d512.512_mtrue_fspec.png'
//     },
//     {
//       siteName: 'DO16',
//       projectName: 'Puerto Rico Island-Wide',
//       songType: 'Common Song',
//       recordedAt: '2021-03-04T05:30:43.032Z',
//       timezone: 'America/Puerto_Rico',
//       redirectUrl: 'https://arbimon.rfcx.org/project/puerto-rico-island-wide/visualizer/rec/23607482',
//       mediaWavUrl: 'https://media-api.rfcx.org/internal/assets/streams/pdMjTxlRIa6C_t20210304T053043032Z.20210304T053046447Z_fwav.wav',
//       mediaSpecUrl: 'https://media-api.rfcx.org/internal/assets/streams/pdMjTxlRIa6C_t20210304T053043032Z.20210304T053046447Z_d512.512_mtrue_fspec.png'
//     }
//   ],
//   'Asio flammeus': [
//     {
//       siteName: 'SU04',
//       projectName: 'Puerto Rico Island-Wide',
//       songType: 'Common Song',
//       recordedAt: '2021-03-08T05:45:33.175Z',
//       timezone: 'America/Puerto_Rico',
//       redirectUrl: 'https://arbimon.rfcx.org/project/puerto-rico-island-wide/visualizer/rec/13934692',
//       mediaWavUrl: 'https://media-api.rfcx.org/internal/assets/streams/w5bOYgeziUo5_t20210308T054533175Z.20210308T054537096Z_fwav.wav',
//       mediaSpecUrl: 'https://media-api.rfcx.org/internal/assets/streams/w5bOYgeziUo5_t20210308T054533175Z.20210308T054537096Z_d512.512_mtrue_fspec.png'
//     }
//   ],
//   'Brotogeris versicolurus': [
//     {
//       siteName: 'PA48_NEW',
//       projectName: 'Puerto Rico Island-Wide',
//       songType: 'Common Song',
//       recordedAt: '2021-04-07T18:20:33.015Z',
//       timezone: 'America/Puerto_Rico',
//       redirectUrl: 'https://arbimon.rfcx.org/project/puerto-rico-island-wide/visualizer/rec/26103351',
//       mediaWavUrl: 'https://media-api.rfcx.org/internal/assets/streams/6mb6mdlt48gv_t20210407T182033015Z.20210407T182035265Z_fwav.wav',
//       mediaSpecUrl: 'https://media-api.rfcx.org/internal/assets/streams/6mb6mdlt48gv_t20210407T182033015Z.20210407T182035265Z_d512.512_mtrue_fspec.png'
//     }
//   ],
//   'Bubulcus ibis': [
//     {
//       siteName: 'CR12',
//       projectName: 'Puerto Rico Island-Wide',
//       songType: 'Simple Call',
//       recordedAt: '2021-05-02T06:50:22.883Z',
//       timezone: 'America/Puerto_Rico',
//       redirectUrl: 'https://arbimon.rfcx.org/project/puerto-rico-island-wide/visualizer/rec/30366998',
//       mediaWavUrl: 'https://media-api.rfcx.org/internal/assets/streams/DO4Oc7KAafBq_t20210502T065022883Z.20210502T065027214Z_fwav.wav',
//       mediaSpecUrl: 'https://media-api.rfcx.org/internal/assets/streams/DO4Oc7KAafBq_t20210502T065022883Z.20210502T065027214Z_d512.512_mtrue_fspec.png'
//     }
//   ],
//   'Buteo jamaicensis': [
//     {
//       siteName: 'LU12',
//       projectName: 'Puerto Rico Island-Wide',
//       songType: 'Common Song',
//       recordedAt: '2021-03-30T21:55:45.056Z',
//       timezone: 'America/Puerto_Rico',
//       redirectUrl: 'https://arbimon.rfcx.org/project/puerto-rico-island-wide/visualizer/rec/25353134',
//       mediaWavUrl: 'https://media-api.rfcx.org/internal/assets/streams/h0bHg9b2q6M3_t20210330T215545056Z.20210330T215547577Z_fwav.wav',
//       mediaSpecUrl: 'https://media-api.rfcx.org/internal/assets/streams/h0bHg9b2q6M3_t20210330T215545056Z.20210330T215547577Z_d512.512_mtrue_fspec.png'
//     }
//   ],
//   'Buteo platypterus': [
//     {
//       siteName: 'RA29',
//       projectName: 'Puerto Rico Island-Wide',
//       songType: 'Common Song',
//       recordedAt: '2021-04-15T13:45:39.516Z',
//       timezone: 'America/Puerto_Rico',
//       redirectUrl: 'https://arbimon.rfcx.org/project/puerto-rico-island-wide/visualizer/rec/26374293',
//       mediaWavUrl: 'https://media-api.rfcx.org/internal/assets/streams/LPTFIfN8Mqg4_t20210415T134539516Z.20210415T134541376Z_fwav.wav',
//       mediaSpecUrl: 'https://media-api.rfcx.org/internal/assets/streams/LPTFIfN8Mqg4_t20210415T134539516Z.20210415T134541376Z_d512.512_mtrue_fspec.png'
//     }
//   ],
//   'Buteo platypterus brunnescens': [
//     {
//       siteName: 'RA29',
//       projectName: 'Puerto Rico Island-Wide',
//       songType: 'Common Song',
//       recordedAt: '2021-04-15T13:45:39.496Z',
//       timezone: 'America/Puerto_Rico',
//       redirectUrl: 'https://arbimon.rfcx.org/project/puerto-rico-island-wide/visualizer/rec/26374293',
//       mediaWavUrl: 'https://media-api.rfcx.org/internal/assets/streams/LPTFIfN8Mqg4_t20210415T134539496Z.20210415T134541386Z_fwav.wav',
//       mediaSpecUrl: 'https://media-api.rfcx.org/internal/assets/streams/LPTFIfN8Mqg4_t20210415T134539496Z.20210415T134541386Z_d512.512_mtrue_fspec.png'
//     }
//   ],
//   'Butorides virescens': [
//     {
//       siteName: 'CU38',
//       projectName: 'Puerto Rico Island-Wide',
//       songType: 'Simple Call',
//       recordedAt: '2021-03-24T02:10:15.152Z',
//       timezone: 'America/Puerto_Rico',
//       redirectUrl: 'https://arbimon.rfcx.org/project/puerto-rico-island-wide/visualizer/rec/24335851',
//       mediaWavUrl: 'https://media-api.rfcx.org/internal/assets/streams/tKZ8nb81JjQg_t20210324T021015152Z.20210324T021019603Z_fwav.wav',
//       mediaSpecUrl: 'https://media-api.rfcx.org/internal/assets/streams/tKZ8nb81JjQg_t20210324T021015152Z.20210324T021019603Z_d512.512_mtrue_fspec.png'
//     }
//   ],
//   'Capra hircus': [
//     {
//       siteName: 'MO_MG',
//       projectName: 'Puerto Rico Island-Wide',
//       songType: 'Common Song',
//       recordedAt: '2021-05-17T22:35:53.823Z',
//       timezone: 'America/Puerto_Rico',
//       redirectUrl: 'https://arbimon.rfcx.org/project/puerto-rico-island-wide/visualizer/rec/31308828',
//       mediaWavUrl: 'https://media-api.rfcx.org/internal/assets/streams/2dy2l48u7ksp_t20210517T223553823Z.20210517T223554717Z_fwav.wav',
//       mediaSpecUrl: 'https://media-api.rfcx.org/internal/assets/streams/2dy2l48u7ksp_t20210517T223553823Z.20210517T223554717Z_d512.512_mtrue_fspec.png'
//     }
//   ],
//   'Charadrius vociferus': [
//     {
//       siteName: 'SA28',
//       projectName: 'Puerto Rico Island-Wide',
//       songType: 'Common Song',
//       recordedAt: '2021-04-06T15:20:28.924Z',
//       timezone: 'America/Puerto_Rico',
//       redirectUrl: 'https://arbimon.rfcx.org/project/puerto-rico-island-wide/visualizer/rec/25955936',
//       mediaWavUrl: 'https://media-api.rfcx.org/internal/assets/streams/Q0B3AhaedTfI_t20210406T152028924Z.20210406T152033735Z_fwav.wav',
//       mediaSpecUrl: 'https://media-api.rfcx.org/internal/assets/streams/Q0B3AhaedTfI_t20210406T152028924Z.20210406T152033735Z_d512.512_mtrue_fspec.png'
//     }
//   ],
//   'Chordeiles gundlachii': [
//     {
//       siteName: 'CR01',
//       projectName: 'Puerto Rico Island-Wide',
//       songType: 'Common Song',
//       recordedAt: '2021-04-29T08:35:00.326Z',
//       timezone: 'America/Puerto_Rico',
//       redirectUrl: 'https://arbimon.rfcx.org/project/puerto-rico-island-wide/visualizer/rec/28729200',
//       mediaWavUrl: 'https://media-api.rfcx.org/internal/assets/streams/WN9havhHl0Ax_t20210429T083500326Z.20210429T083501287Z_fwav.wav',
//       mediaSpecUrl: 'https://media-api.rfcx.org/internal/assets/streams/WN9havhHl0Ax_t20210429T083500326Z.20210429T083501287Z_d512.512_mtrue_fspec.png'
//     },
//     {
//       siteName: 'CR01',
//       projectName: 'Puerto Rico Island-Wide',
//       songType: 'Common Song',
//       recordedAt: '2021-04-29T08:35:00.326Z',
//       timezone: 'America/Puerto_Rico',
//       redirectUrl: 'https://arbimon.rfcx.org/project/puerto-rico-island-wide/visualizer/rec/28729200',
//       mediaWavUrl: 'https://media-api.rfcx.org/internal/assets/streams/WN9havhHl0Ax_t20210429T083500326Z.20210429T083501287Z_fwav.wav',
//       mediaSpecUrl: 'https://media-api.rfcx.org/internal/assets/streams/WN9havhHl0Ax_t20210429T083500326Z.20210429T083501287Z_d512.512_mtrue_fspec.png'
//     },
//     {
//       siteName: 'CR01',
//       projectName: 'Puerto Rico Island-Wide',
//       songType: 'Common Song',
//       recordedAt: '2021-04-29T08:35:00.326Z',
//       timezone: 'America/Puerto_Rico',
//       redirectUrl: 'https://arbimon.rfcx.org/project/puerto-rico-island-wide/visualizer/rec/28729200',
//       mediaWavUrl: 'https://media-api.rfcx.org/internal/assets/streams/WN9havhHl0Ax_t20210429T083500326Z.20210429T083501287Z_fwav.wav',
//       mediaSpecUrl: 'https://media-api.rfcx.org/internal/assets/streams/WN9havhHl0Ax_t20210429T083500326Z.20210429T083501287Z_d512.512_mtrue_fspec.png'
//     },
//     {
//       siteName: 'CR01',
//       projectName: 'Puerto Rico Island-Wide',
//       songType: 'Common Song',
//       recordedAt: '2021-04-29T08:35:00.326Z',
//       timezone: 'America/Puerto_Rico',
//       redirectUrl: 'https://arbimon.rfcx.org/project/puerto-rico-island-wide/visualizer/rec/28729200',
//       mediaWavUrl: 'https://media-api.rfcx.org/internal/assets/streams/WN9havhHl0Ax_t20210429T083500326Z.20210429T083501287Z_fwav.wav',
//       mediaSpecUrl: 'https://media-api.rfcx.org/internal/assets/streams/WN9havhHl0Ax_t20210429T083500326Z.20210429T083501287Z_d512.512_mtrue_fspec.png'
//     }
//   ],
//   'Coccyzus minor': [
//     {
//       siteName: 'MO04',
//       projectName: 'Puerto Rico Island-Wide',
//       songType: 'Common Song',
//       recordedAt: '2021-05-14T16:40:39.176Z',
//       timezone: 'America/Puerto_Rico',
//       redirectUrl: 'https://arbimon.rfcx.org/project/puerto-rico-island-wide/visualizer/rec/30688228',
//       mediaWavUrl: 'https://media-api.rfcx.org/internal/assets/streams/pyvggipxazca_t20210514T164039176Z.20210514T164046817Z_fwav.wav',
//       mediaSpecUrl: 'https://media-api.rfcx.org/internal/assets/streams/pyvggipxazca_t20210514T164039176Z.20210514T164046817Z_d512.512_mtrue_fspec.png'
//     }
//   ],
//   'Coccyzus vieilloti': [
//     {
//       siteName: 'RO16',
//       projectName: 'Puerto Rico Island-Wide',
//       songType: 'Common Song',
//       recordedAt: '2021-03-08T18:50:51.188Z',
//       timezone: 'America/Puerto_Rico',
//       redirectUrl: 'https://arbimon.rfcx.org/project/puerto-rico-island-wide/visualizer/rec/31437184',
//       mediaWavUrl: 'https://media-api.rfcx.org/internal/assets/streams/ebnq6zz4onp5_t20210308T185051188Z.20210308T185059789Z_fwav.wav',
//       mediaSpecUrl: 'https://media-api.rfcx.org/internal/assets/streams/ebnq6zz4onp5_t20210308T185051188Z.20210308T185059789Z_d512.512_mtrue_fspec.png'
//     }
//   ],
//   'Coereba flaveola': [
//     {
//       siteName: 'MA03',
//       projectName: 'Puerto Rico Island-Wide',
//       songType: 'Common Song',
//       recordedAt: '2021-04-19T16:00:27.684Z',
//       timezone: 'America/Puerto_Rico',
//       redirectUrl: 'https://arbimon.rfcx.org/project/puerto-rico-island-wide/visualizer/rec/27539802',
//       mediaWavUrl: 'https://media-api.rfcx.org/internal/assets/streams/B5H7MI7YGWj4_t20210419T160027684Z.20210419T160030805Z_fwav.wav',
//       mediaSpecUrl: 'https://media-api.rfcx.org/internal/assets/streams/B5H7MI7YGWj4_t20210419T160027684Z.20210419T160030805Z_d512.512_mtrue_fspec.png'
//     }
//   ],
//   'Columbina passerina': [
//     {
//       siteName: 'CR29',
//       projectName: 'Puerto Rico Island-Wide',
//       songType: 'Common Song',
//       recordedAt: '2021-05-03T11:00:09.391Z',
//       timezone: 'America/Puerto_Rico',
//       redirectUrl: 'https://arbimon.rfcx.org/project/puerto-rico-island-wide/visualizer/rec/28717648',
//       mediaWavUrl: 'https://media-api.rfcx.org/internal/assets/streams/lurBc90SO37V_t20210503T110009391Z.20210503T110012562Z_fwav.wav',
//       mediaSpecUrl: 'https://media-api.rfcx.org/internal/assets/streams/lurBc90SO37V_t20210503T110009391Z.20210503T110012562Z_d512.512_mtrue_fspec.png'
//     }
//   ],
//   'Contopus latirostris blancoi': [
//     {
//       siteName: 'LU_48',
//       projectName: 'Puerto Rico Island-Wide',
//       songType: 'Common Song',
//       recordedAt: '2021-04-05T12:35:05.908Z',
//       timezone: 'America/Puerto_Rico',
//       redirectUrl: 'https://arbimon.rfcx.org/project/puerto-rico-island-wide/visualizer/rec/25489318',
//       mediaWavUrl: 'https://media-api.rfcx.org/internal/assets/streams/6by0dtvj349u_t20210405T123505908Z.20210405T123506973Z_fwav.wav',
//       mediaSpecUrl: 'https://media-api.rfcx.org/internal/assets/streams/6by0dtvj349u_t20210405T123505908Z.20210405T123506973Z_d512.512_mtrue_fspec.png'
//     }
//   ],
//   'Crotophaga ani': [
//     {
//       siteName: 'CU38',
//       projectName: 'Puerto Rico Island-Wide',
//       songType: 'Simple Call',
//       recordedAt: '2021-03-17T20:20:41.882Z',
//       timezone: 'America/Puerto_Rico',
//       redirectUrl: 'https://arbimon.rfcx.org/project/puerto-rico-island-wide/visualizer/rec/24322373',
//       mediaWavUrl: 'https://media-api.rfcx.org/internal/assets/streams/tKZ8nb81JjQg_t20210317T202041882Z.20210317T202043199Z_fwav.wav',
//       mediaSpecUrl: 'https://media-api.rfcx.org/internal/assets/streams/tKZ8nb81JjQg_t20210317T202041882Z.20210317T202043199Z_d512.512_mtrue_fspec.png'
//     },
//     {
//       siteName: 'CU38',
//       projectName: 'Puerto Rico Island-Wide',
//       songType: 'Simple Call',
//       recordedAt: '2021-03-17T20:20:41.882Z',
//       timezone: 'America/Puerto_Rico',
//       redirectUrl: 'https://arbimon.rfcx.org/project/puerto-rico-island-wide/visualizer/rec/24322373',
//       mediaWavUrl: 'https://media-api.rfcx.org/internal/assets/streams/tKZ8nb81JjQg_t20210317T202041882Z.20210317T202043199Z_fwav.wav',
//       mediaSpecUrl: 'https://media-api.rfcx.org/internal/assets/streams/tKZ8nb81JjQg_t20210317T202041882Z.20210317T202043199Z_d512.512_mtrue_fspec.png'
//     },
//     {
//       siteName: 'CU38',
//       projectName: 'Puerto Rico Island-Wide',
//       songType: 'Simple Call',
//       recordedAt: '2021-03-17T20:20:41.882Z',
//       timezone: 'America/Puerto_Rico',
//       redirectUrl: 'https://arbimon.rfcx.org/project/puerto-rico-island-wide/visualizer/rec/24322373',
//       mediaWavUrl: 'https://media-api.rfcx.org/internal/assets/streams/tKZ8nb81JjQg_t20210317T202041882Z.20210317T202043199Z_fwav.wav',
//       mediaSpecUrl: 'https://media-api.rfcx.org/internal/assets/streams/tKZ8nb81JjQg_t20210317T202041882Z.20210317T202043199Z_d512.512_mtrue_fspec.png'
//     },
//     {
//       siteName: 'CU38',
//       projectName: 'Puerto Rico Island-Wide',
//       songType: 'Simple Call',
//       recordedAt: '2021-03-17T20:20:41.882Z',
//       timezone: 'America/Puerto_Rico',
//       redirectUrl: 'https://arbimon.rfcx.org/project/puerto-rico-island-wide/visualizer/rec/24322373',
//       mediaWavUrl: 'https://media-api.rfcx.org/internal/assets/streams/tKZ8nb81JjQg_t20210317T202041882Z.20210317T202043199Z_fwav.wav',
//       mediaSpecUrl: 'https://media-api.rfcx.org/internal/assets/streams/tKZ8nb81JjQg_t20210317T202041882Z.20210317T202043199Z_d512.512_mtrue_fspec.png'
//     },
//     {
//       siteName: 'CU38',
//       projectName: 'Puerto Rico Island-Wide',
//       songType: 'Simple Call',
//       recordedAt: '2021-03-17T20:20:41.882Z',
//       timezone: 'America/Puerto_Rico',
//       redirectUrl: 'https://arbimon.rfcx.org/project/puerto-rico-island-wide/visualizer/rec/24322373',
//       mediaWavUrl: 'https://media-api.rfcx.org/internal/assets/streams/tKZ8nb81JjQg_t20210317T202041882Z.20210317T202043199Z_fwav.wav',
//       mediaSpecUrl: 'https://media-api.rfcx.org/internal/assets/streams/tKZ8nb81JjQg_t20210317T202041882Z.20210317T202043199Z_d512.512_mtrue_fspec.png'
//     }
//   ],
//   'Elaenia martinica': [
//     {
//       siteName: 'GU19',
//       projectName: 'Puerto Rico Island-Wide',
//       songType: 'Common Song',
//       recordedAt: '2021-03-24T10:40:23.883Z',
//       timezone: 'America/Puerto_Rico',
//       redirectUrl: 'https://arbimon.rfcx.org/project/puerto-rico-island-wide/visualizer/rec/24873768',
//       mediaWavUrl: 'https://media-api.rfcx.org/internal/assets/streams/6DPJFwyOeknw_t20210324T104023883Z.20210324T104025084Z_fwav.wav',
//       mediaSpecUrl: 'https://media-api.rfcx.org/internal/assets/streams/6DPJFwyOeknw_t20210324T104023883Z.20210324T104025084Z_d512.512_mtrue_fspec.png'
//     }
//   ],
//   'Eleutherodactylus antillensis': [
//     {
//       siteName: 'PA53',
//       projectName: 'Puerto Rico Island-Wide',
//       songType: 'Common Song',
//       recordedAt: '2021-04-08T04:50:12.055Z',
//       timezone: 'America/Puerto_Rico',
//       redirectUrl: 'https://arbimon.rfcx.org/project/puerto-rico-island-wide/visualizer/rec/25726190',
//       mediaWavUrl: 'https://media-api.rfcx.org/internal/assets/streams/0dq24zlwzx0p_t20210408T045012055Z.20210408T045012352Z_fwav.wav',
//       mediaSpecUrl: 'https://media-api.rfcx.org/internal/assets/streams/0dq24zlwzx0p_t20210408T045012055Z.20210408T045012352Z_d512.512_mtrue_fspec.png'
//     },
//     {
//       siteName: 'PA53',
//       projectName: 'Puerto Rico Island-Wide',
//       songType: 'Common Song',
//       recordedAt: '2021-04-08T04:50:12.055Z',
//       timezone: 'America/Puerto_Rico',
//       redirectUrl: 'https://arbimon.rfcx.org/project/puerto-rico-island-wide/visualizer/rec/25726190',
//       mediaWavUrl: 'https://media-api.rfcx.org/internal/assets/streams/0dq24zlwzx0p_t20210408T045012055Z.20210408T045012352Z_fwav.wav',
//       mediaSpecUrl: 'https://media-api.rfcx.org/internal/assets/streams/0dq24zlwzx0p_t20210408T045012055Z.20210408T045012352Z_d512.512_mtrue_fspec.png'
//     },
//     {
//       siteName: 'PA53',
//       projectName: 'Puerto Rico Island-Wide',
//       songType: 'Common Song',
//       recordedAt: '2021-04-08T04:50:12.055Z',
//       timezone: 'America/Puerto_Rico',
//       redirectUrl: 'https://arbimon.rfcx.org/project/puerto-rico-island-wide/visualizer/rec/25726190',
//       mediaWavUrl: 'https://media-api.rfcx.org/internal/assets/streams/0dq24zlwzx0p_t20210408T045012055Z.20210408T045012352Z_fwav.wav',
//       mediaSpecUrl: 'https://media-api.rfcx.org/internal/assets/streams/0dq24zlwzx0p_t20210408T045012055Z.20210408T045012352Z_d512.512_mtrue_fspec.png'
//     }
//   ],
//   'Eleutherodactylus brittoni': [
//     {
//       siteName: 'LU_46',
//       projectName: 'Puerto Rico Island-Wide',
//       songType: 'Common Song',
//       recordedAt: '2021-03-31T08:20:23.922Z',
//       timezone: 'America/Puerto_Rico',
//       redirectUrl: 'https://arbimon.rfcx.org/project/puerto-rico-island-wide/visualizer/rec/25471110',
//       mediaWavUrl: 'https://media-api.rfcx.org/internal/assets/streams/jmi7nefeln7g_t20210331T082023922Z.20210331T082024665Z_fwav.wav',
//       mediaSpecUrl: 'https://media-api.rfcx.org/internal/assets/streams/jmi7nefeln7g_t20210331T082023922Z.20210331T082024665Z_d512.512_mtrue_fspec.png'
//     }
//   ],
//   'Eleutherodactylus cochranae': [
//     {
//       siteName: 'DO12',
//       projectName: 'Puerto Rico Island-Wide',
//       songType: 'Common Song',
//       recordedAt: '2021-03-09T00:00:30.749Z',
//       timezone: 'America/Puerto_Rico',
//       redirectUrl: 'https://arbimon.rfcx.org/project/puerto-rico-island-wide/visualizer/rec/23599676',
//       mediaWavUrl: 'https://media-api.rfcx.org/internal/assets/streams/Rq9z8co6YL6I_t20210309T000030749Z.20210309T000031680Z_fwav.wav',
//       mediaSpecUrl: 'https://media-api.rfcx.org/internal/assets/streams/Rq9z8co6YL6I_t20210309T000030749Z.20210309T000031680Z_d512.512_mtrue_fspec.png'
//     }
//   ],
//   'Eleutherodactylus cooki': [
//     {
//       siteName: 'PA11_NEW',
//       projectName: 'Puerto Rico Island-Wide',
//       songType: 'Common Song',
//       recordedAt: '2021-04-02T01:30:27.439Z',
//       timezone: 'America/Puerto_Rico',
//       redirectUrl: 'https://arbimon.rfcx.org/project/puerto-rico-island-wide/visualizer/rec/25486167',
//       mediaWavUrl: 'https://media-api.rfcx.org/internal/assets/streams/xqowq452cl9n_t20210402T013027439Z.20210402T013029222Z_fwav.wav',
//       mediaSpecUrl: 'https://media-api.rfcx.org/internal/assets/streams/xqowq452cl9n_t20210402T013027439Z.20210402T013029222Z_d512.512_mtrue_fspec.png'
//     },
//     {
//       siteName: 'PA11_NEW',
//       projectName: 'Puerto Rico Island-Wide',
//       songType: 'Common Song',
//       recordedAt: '2021-04-02T01:30:27.439Z',
//       timezone: 'America/Puerto_Rico',
//       redirectUrl: 'https://arbimon.rfcx.org/project/puerto-rico-island-wide/visualizer/rec/25486167',
//       mediaWavUrl: 'https://media-api.rfcx.org/internal/assets/streams/xqowq452cl9n_t20210402T013027439Z.20210402T013029222Z_fwav.wav',
//       mediaSpecUrl: 'https://media-api.rfcx.org/internal/assets/streams/xqowq452cl9n_t20210402T013027439Z.20210402T013029222Z_d512.512_mtrue_fspec.png'
//     },
//     {
//       siteName: 'PA11_NEW',
//       projectName: 'Puerto Rico Island-Wide',
//       songType: 'Common Song',
//       recordedAt: '2021-04-02T01:30:27.439Z',
//       timezone: 'America/Puerto_Rico',
//       redirectUrl: 'https://arbimon.rfcx.org/project/puerto-rico-island-wide/visualizer/rec/25486167',
//       mediaWavUrl: 'https://media-api.rfcx.org/internal/assets/streams/xqowq452cl9n_t20210402T013027439Z.20210402T013029222Z_fwav.wav',
//       mediaSpecUrl: 'https://media-api.rfcx.org/internal/assets/streams/xqowq452cl9n_t20210402T013027439Z.20210402T013029222Z_d512.512_mtrue_fspec.png'
//     },
//     {
//       siteName: 'PA11_NEW',
//       projectName: 'Puerto Rico Island-Wide',
//       songType: 'Common Song',
//       recordedAt: '2021-04-02T01:30:27.439Z',
//       timezone: 'America/Puerto_Rico',
//       redirectUrl: 'https://arbimon.rfcx.org/project/puerto-rico-island-wide/visualizer/rec/25486167',
//       mediaWavUrl: 'https://media-api.rfcx.org/internal/assets/streams/xqowq452cl9n_t20210402T013027439Z.20210402T013029222Z_fwav.wav',
//       mediaSpecUrl: 'https://media-api.rfcx.org/internal/assets/streams/xqowq452cl9n_t20210402T013027439Z.20210402T013029222Z_d512.512_mtrue_fspec.png'
//     },
//     {
//       siteName: 'PA11_NEW',
//       projectName: 'Puerto Rico Island-Wide',
//       songType: 'Common Song',
//       recordedAt: '2021-04-02T01:30:27.439Z',
//       timezone: 'America/Puerto_Rico',
//       redirectUrl: 'https://arbimon.rfcx.org/project/puerto-rico-island-wide/visualizer/rec/25486167',
//       mediaWavUrl: 'https://media-api.rfcx.org/internal/assets/streams/xqowq452cl9n_t20210402T013027439Z.20210402T013029222Z_fwav.wav',
//       mediaSpecUrl: 'https://media-api.rfcx.org/internal/assets/streams/xqowq452cl9n_t20210402T013027439Z.20210402T013029222Z_d512.512_mtrue_fspec.png'
//     }
//   ],
//   'Eleutherodactylus coqui': [
//     {
//       siteName: 'PA28',
//       projectName: 'Puerto Rico Island-Wide',
//       songType: 'Common Song',
//       recordedAt: '2021-04-02T06:25:36.298Z',
//       timezone: 'America/Puerto_Rico',
//       redirectUrl: 'https://arbimon.rfcx.org/project/puerto-rico-island-wide/visualizer/rec/25541953',
//       mediaWavUrl: 'https://media-api.rfcx.org/internal/assets/streams/hi8M2OfKQRfV_t20210402T062536298Z.20210402T062536944Z_fwav.wav',
//       mediaSpecUrl: 'https://media-api.rfcx.org/internal/assets/streams/hi8M2OfKQRfV_t20210402T062536298Z.20210402T062536944Z_d512.512_mtrue_fspec.png'
//     }
//   ],
//   'Eleutherodactylus gryllus': [
//     {
//       siteName: 'LU24',
//       projectName: 'Puerto Rico Island-Wide',
//       songType: 'Common Song',
//       recordedAt: '2021-03-31T22:55:11.991Z',
//       timezone: 'America/Puerto_Rico',
//       redirectUrl: 'https://arbimon.rfcx.org/project/puerto-rico-island-wide/visualizer/rec/25458726',
//       mediaWavUrl: 'https://media-api.rfcx.org/internal/assets/streams/LNXvylzVbChX_t20210331T225511991Z.20210331T225516362Z_fwav.wav',
//       mediaSpecUrl: 'https://media-api.rfcx.org/internal/assets/streams/LNXvylzVbChX_t20210331T225511991Z.20210331T225516362Z_d512.512_mtrue_fspec.png'
//     }
//   ],
//   'Eleutherodactylus hedricki': [
//     {
//       siteName: 'LU_47',
//       projectName: 'Puerto Rico Island-Wide',
//       songType: 'Common Song',
//       recordedAt: '2021-03-31T00:00:55.379Z',
//       timezone: 'America/Puerto_Rico',
//       redirectUrl: 'https://arbimon.rfcx.org/project/puerto-rico-island-wide/visualizer/rec/25461129',
//       mediaWavUrl: 'https://media-api.rfcx.org/internal/assets/streams/jusxxxp5fcmv_t20210331T000055379Z.20210331T000059769Z_fwav.wav',
//       mediaSpecUrl: 'https://media-api.rfcx.org/internal/assets/streams/jusxxxp5fcmv_t20210331T000055379Z.20210331T000059769Z_d512.512_mtrue_fspec.png'
//     }
//   ],
//   'Eleutherodactylus juanariveroi': [
//     {
//       siteName: 'DO16',
//       projectName: 'Puerto Rico Island-Wide',
//       songType: 'Common Song',
//       recordedAt: '2021-03-08T08:05:09.440Z',
//       timezone: 'America/Puerto_Rico',
//       redirectUrl: 'https://arbimon.rfcx.org/project/puerto-rico-island-wide/visualizer/rec/23644933',
//       mediaWavUrl: 'https://media-api.rfcx.org/internal/assets/streams/pdMjTxlRIa6C_t20210308T080509440Z.20210308T080510528Z_fwav.wav',
//       mediaSpecUrl: 'https://media-api.rfcx.org/internal/assets/streams/pdMjTxlRIa6C_t20210308T080509440Z.20210308T080510528Z_d512.512_mtrue_fspec.png'
//     }
//   ],
//   'Eleutherodactylus locustus': [
//     {
//       siteName: 'LU24',
//       projectName: 'Puerto Rico Island-Wide',
//       songType: 'Common Song',
//       recordedAt: '2021-04-04T02:55:51.968Z',
//       timezone: 'America/Puerto_Rico',
//       redirectUrl: 'https://arbimon.rfcx.org/project/puerto-rico-island-wide/visualizer/rec/25458659',
//       mediaWavUrl: 'https://media-api.rfcx.org/internal/assets/streams/LNXvylzVbChX_t20210404T025551968Z.20210404T025555949Z_fwav.wav',
//       mediaSpecUrl: 'https://media-api.rfcx.org/internal/assets/streams/LNXvylzVbChX_t20210404T025551968Z.20210404T025555949Z_d512.512_mtrue_fspec.png'
//     }
//   ],
//   'Eleutherodactylus monensis': [
//     {
//       siteName: 'MO06',
//       projectName: 'Puerto Rico Island-Wide',
//       songType: 'Common Song',
//       recordedAt: '2021-05-18T07:05:42.964Z',
//       timezone: 'America/Puerto_Rico',
//       redirectUrl: 'https://arbimon.rfcx.org/project/puerto-rico-island-wide/visualizer/rec/30712595',
//       mediaWavUrl: 'https://media-api.rfcx.org/internal/assets/streams/qxnbao85u98s_t20210518T070542964Z.20210518T070544025Z_fwav.wav',
//       mediaSpecUrl: 'https://media-api.rfcx.org/internal/assets/streams/qxnbao85u98s_t20210518T070542964Z.20210518T070544025Z_d512.512_mtrue_fspec.png'
//     },
//     {
//       siteName: 'MO_MA',
//       projectName: 'Puerto Rico Island-Wide',
//       songType: 'Common Song',
//       recordedAt: '2021-05-12T22:10:09.991Z',
//       timezone: 'America/Puerto_Rico',
//       redirectUrl: 'https://arbimon.rfcx.org/project/puerto-rico-island-wide/visualizer/rec/30255909',
//       mediaWavUrl: 'https://media-api.rfcx.org/internal/assets/streams/e18055t8aeiq_t20210512T221009991Z.20210512T221010516Z_fwav.wav',
//       mediaSpecUrl: 'https://media-api.rfcx.org/internal/assets/streams/e18055t8aeiq_t20210512T221009991Z.20210512T221010516Z_d512.512_mtrue_fspec.png'
//     }
//   ],
//   'Eleutherodactylus portoricensis': [
//     {
//       siteName: 'LU_48',
//       projectName: 'Puerto Rico Island-Wide',
//       songType: 'Common Song',
//       recordedAt: '2021-04-05T09:40:08.461Z',
//       timezone: 'America/Puerto_Rico',
//       redirectUrl: 'https://arbimon.rfcx.org/project/puerto-rico-island-wide/visualizer/rec/25485940',
//       mediaWavUrl: 'https://media-api.rfcx.org/internal/assets/streams/6by0dtvj349u_t20210405T094008461Z.20210405T094014942Z_fwav.wav',
//       mediaSpecUrl: 'https://media-api.rfcx.org/internal/assets/streams/6by0dtvj349u_t20210405T094008461Z.20210405T094014942Z_d512.512_mtrue_fspec.png'
//     }
//   ],
//   'Eleutherodactylus richmondi': [
//     {
//       siteName: 'PA37',
//       projectName: 'Puerto Rico Island-Wide',
//       songType: 'Common Song',
//       recordedAt: '2021-04-08T23:05:31.215Z',
//       timezone: 'America/Puerto_Rico',
//       redirectUrl: 'https://arbimon.rfcx.org/project/puerto-rico-island-wide/visualizer/rec/26078179',
//       mediaWavUrl: 'https://media-api.rfcx.org/internal/assets/streams/18QZItvSQvri_t20210408T230531215Z.20210408T230531685Z_fwav.wav',
//       mediaSpecUrl: 'https://media-api.rfcx.org/internal/assets/streams/18QZItvSQvri_t20210408T230531215Z.20210408T230531685Z_d512.512_mtrue_fspec.png'
//     }
//   ],
//   'Eleutherodactylus unicolor': [
//     {
//       siteName: 'PA40_NEW',
//       projectName: 'Puerto Rico Island-Wide',
//       songType: 'Common Song',
//       recordedAt: '2021-04-08T02:45:24.884Z',
//       timezone: 'America/Puerto_Rico',
//       redirectUrl: 'https://arbimon.rfcx.org/project/puerto-rico-island-wide/visualizer/rec/26077415',
//       mediaWavUrl: 'https://media-api.rfcx.org/internal/assets/streams/ltprw4fjvmyq_t20210408T024524884Z.20210408T024525684Z_fwav.wav',
//       mediaSpecUrl: 'https://media-api.rfcx.org/internal/assets/streams/ltprw4fjvmyq_t20210408T024524884Z.20210408T024525684Z_d512.512_mtrue_fspec.png'
//     }
//   ],
//   'Eleutherodactylus wightmanae': [
//     {
//       siteName: 'MA04',
//       projectName: 'Puerto Rico Island-Wide',
//       songType: 'Common Song',
//       recordedAt: '2021-04-14T09:35:33.538Z',
//       timezone: 'America/Puerto_Rico',
//       redirectUrl: 'https://arbimon.rfcx.org/project/puerto-rico-island-wide/visualizer/rec/27548812',
//       mediaWavUrl: 'https://media-api.rfcx.org/internal/assets/streams/1mJ5HrClbhpp_t20210414T093533538Z.20210414T093534567Z_fwav.wav',
//       mediaSpecUrl: 'https://media-api.rfcx.org/internal/assets/streams/1mJ5HrClbhpp_t20210414T093533538Z.20210414T093534567Z_d512.512_mtrue_fspec.png'
//     }
//   ],
//   'Equus ferus caballus': [
//     {
//       siteName: 'AR_eG',
//       projectName: 'Puerto Rico Island-Wide',
//       songType: 'Common Song',
//       recordedAt: '2021-04-27T21:30:25.681Z',
//       timezone: 'America/Puerto_Rico',
//       redirectUrl: 'https://arbimon.rfcx.org/project/puerto-rico-island-wide/visualizer/rec/28348411',
//       mediaWavUrl: 'https://media-api.rfcx.org/internal/assets/streams/oorl4j4101cd_t20210427T213025681Z.20210427T213027614Z_fwav.wav',
//       mediaSpecUrl: 'https://media-api.rfcx.org/internal/assets/streams/oorl4j4101cd_t20210427T213025681Z.20210427T213027614Z_d512.512_mtrue_fspec.png'
//     }
//   ],
//   'Euphonia musica': [
//     {
//       siteName: 'SU16',
//       projectName: 'Puerto Rico Island-Wide',
//       songType: 'Common Song',
//       recordedAt: '2021-03-07T21:05:37.072Z',
//       timezone: 'America/Puerto_Rico',
//       redirectUrl: 'https://arbimon.rfcx.org/project/puerto-rico-island-wide/visualizer/rec/13973423',
//       mediaWavUrl: 'https://media-api.rfcx.org/internal/assets/streams/6e4HD0NqxlfM_t20210307T210537072Z.20210307T210544414Z_fwav.wav',
//       mediaSpecUrl: 'https://media-api.rfcx.org/internal/assets/streams/6e4HD0NqxlfM_t20210307T210537072Z.20210307T210544414Z_d512.512_mtrue_fspec.png'
//     }
//   ],
//   'Falco sparverius': [
//     {
//       siteName: 'TNe04',
//       projectName: 'Puerto Rico Island-Wide',
//       songType: 'Common Song',
//       recordedAt: '2021-03-23T12:20:30.705Z',
//       timezone: 'America/Puerto_Rico',
//       redirectUrl: 'https://arbimon.rfcx.org/project/puerto-rico-island-wide/visualizer/rec/25649656',
//       mediaWavUrl: 'https://media-api.rfcx.org/internal/assets/streams/d9zhdohowr7m_t20210323T122030705Z.20210323T122032575Z_fwav.wav',
//       mediaSpecUrl: 'https://media-api.rfcx.org/internal/assets/streams/d9zhdohowr7m_t20210323T122030705Z.20210323T122032575Z_d512.512_mtrue_fspec.png'
//     }
//   ],
//   'Fulica caribaea': [
//     {
//       siteName: 'PA45',
//       projectName: 'Puerto Rico Island-Wide',
//       songType: 'Common Song',
//       recordedAt: '2021-04-07T05:00:22.953Z',
//       timezone: 'America/Puerto_Rico',
//       redirectUrl: 'https://arbimon.rfcx.org/project/puerto-rico-island-wide/visualizer/rec/25581991',
//       mediaWavUrl: 'https://media-api.rfcx.org/internal/assets/streams/SentGrxBxPIs_t20210407T050022953Z.20210407T050026814Z_fwav.wav',
//       mediaSpecUrl: 'https://media-api.rfcx.org/internal/assets/streams/SentGrxBxPIs_t20210407T050022953Z.20210407T050026814Z_d512.512_mtrue_fspec.png'
//     }
//   ],
//   'Gallinula galeata': [
//     {
//       siteName: 'AR_29m',
//       projectName: 'Puerto Rico Island-Wide',
//       songType: 'Common Song',
//       recordedAt: '2021-05-04T11:00:47.777Z',
//       timezone: 'America/Puerto_Rico',
//       redirectUrl: 'https://arbimon.rfcx.org/project/puerto-rico-island-wide/visualizer/rec/28353936',
//       mediaWavUrl: 'https://media-api.rfcx.org/internal/assets/streams/xgsa7dx5q5sj_t20210504T110047777Z.20210504T110051618Z_fwav.wav',
//       mediaSpecUrl: 'https://media-api.rfcx.org/internal/assets/streams/xgsa7dx5q5sj_t20210504T110047777Z.20210504T110051618Z_d512.512_mtrue_fspec.png'
//     }
//   ],
//   'Gallus gallus domesticus': [
//     {
//       siteName: 'VI15_NEW',
//       projectName: 'Puerto Rico Island-Wide',
//       songType: 'Common Song',
//       recordedAt: '2021-04-16T08:50:51.048Z',
//       timezone: 'America/Puerto_Rico',
//       redirectUrl: 'https://arbimon.rfcx.org/project/puerto-rico-island-wide/visualizer/rec/27817192',
//       mediaWavUrl: 'https://media-api.rfcx.org/internal/assets/streams/2218q4o5zwpj_t20210416T085051048Z.20210416T085053038Z_fwav.wav',
//       mediaSpecUrl: 'https://media-api.rfcx.org/internal/assets/streams/2218q4o5zwpj_t20210416T085051048Z.20210416T085053038Z_d512.512_mtrue_fspec.png'
//     }
//   ],
//   'Geotrygon montana': [
//     {
//       siteName: 'RA28',
//       projectName: 'Puerto Rico Island-Wide',
//       songType: 'Common Song',
//       recordedAt: '2021-04-13T12:50:10.407Z',
//       timezone: 'America/Puerto_Rico',
//       redirectUrl: 'https://arbimon.rfcx.org/project/puerto-rico-island-wide/visualizer/rec/26356104',
//       mediaWavUrl: 'https://media-api.rfcx.org/internal/assets/streams/BVhZeV3BetQY_t20210413T125010407Z.20210413T125012423Z_fwav.wav',
//       mediaSpecUrl: 'https://media-api.rfcx.org/internal/assets/streams/BVhZeV3BetQY_t20210413T125010407Z.20210413T125012423Z_d512.512_mtrue_fspec.png'
//     },
//     {
//       siteName: 'RA28',
//       projectName: 'Puerto Rico Island-Wide',
//       songType: 'Common Song',
//       recordedAt: '2021-04-13T12:50:10.407Z',
//       timezone: 'America/Puerto_Rico',
//       redirectUrl: 'https://arbimon.rfcx.org/project/puerto-rico-island-wide/visualizer/rec/26356104',
//       mediaWavUrl: 'https://media-api.rfcx.org/internal/assets/streams/BVhZeV3BetQY_t20210413T125010407Z.20210413T125012423Z_fwav.wav',
//       mediaSpecUrl: 'https://media-api.rfcx.org/internal/assets/streams/BVhZeV3BetQY_t20210413T125010407Z.20210413T125012423Z_d512.512_mtrue_fspec.png'
//     },
//     {
//       siteName: 'RA28',
//       projectName: 'Puerto Rico Island-Wide',
//       songType: 'Common Song',
//       recordedAt: '2021-04-13T13:10:13.298Z',
//       timezone: 'America/Puerto_Rico',
//       redirectUrl: 'https://arbimon.rfcx.org/project/puerto-rico-island-wide/visualizer/rec/26355203',
//       mediaWavUrl: 'https://media-api.rfcx.org/internal/assets/streams/BVhZeV3BetQY_t20210413T131013298Z.20210413T131018163Z_fwav.wav',
//       mediaSpecUrl: 'https://media-api.rfcx.org/internal/assets/streams/BVhZeV3BetQY_t20210413T131013298Z.20210413T131018163Z_d512.512_mtrue_fspec.png'
//     }
//   ],
//   'Himantopus mexicanus': [
//     {
//       siteName: 'CR02',
//       projectName: 'Puerto Rico Island-Wide',
//       songType: 'Simple Call',
//       recordedAt: '2021-05-03T05:45:36.386Z',
//       timezone: 'America/Puerto_Rico',
//       redirectUrl: 'https://arbimon.rfcx.org/project/puerto-rico-island-wide/visualizer/rec/28732395',
//       mediaWavUrl: 'https://media-api.rfcx.org/internal/assets/streams/Vq4L8FklmztV_t20210503T054536386Z.20210503T054545457Z_fwav.wav',
//       mediaSpecUrl: 'https://media-api.rfcx.org/internal/assets/streams/Vq4L8FklmztV_t20210503T054536386Z.20210503T054545457Z_d512.512_mtrue_fspec.png'
//     }
//   ],
//   'Icterus icterus': [
//     {
//       siteName: 'CR10',
//       projectName: 'Puerto Rico Island-Wide',
//       songType: 'Common Song',
//       recordedAt: '2021-05-01T09:40:52.931Z',
//       timezone: 'America/Puerto_Rico',
//       redirectUrl: 'https://arbimon.rfcx.org/project/puerto-rico-island-wide/visualizer/rec/28720908',
//       mediaWavUrl: 'https://media-api.rfcx.org/internal/assets/streams/hTA9TYWAg8Ow_t20210501T094052931Z.20210501T094054352Z_fwav.wav',
//       mediaSpecUrl: 'https://media-api.rfcx.org/internal/assets/streams/hTA9TYWAg8Ow_t20210501T094052931Z.20210501T094054352Z_d512.512_mtrue_fspec.png'
//     },
//     {
//       siteName: 'CR10',
//       projectName: 'Puerto Rico Island-Wide',
//       songType: 'Common Song',
//       recordedAt: '2021-05-01T09:40:52.931Z',
//       timezone: 'America/Puerto_Rico',
//       redirectUrl: 'https://arbimon.rfcx.org/project/puerto-rico-island-wide/visualizer/rec/28720908',
//       mediaWavUrl: 'https://media-api.rfcx.org/internal/assets/streams/hTA9TYWAg8Ow_t20210501T094052931Z.20210501T094054352Z_fwav.wav',
//       mediaSpecUrl: 'https://media-api.rfcx.org/internal/assets/streams/hTA9TYWAg8Ow_t20210501T094052931Z.20210501T094054352Z_d512.512_mtrue_fspec.png'
//     },
//     {
//       siteName: 'CR18',
//       projectName: 'Puerto Rico Island-Wide',
//       songType: 'Common Song',
//       recordedAt: '2021-05-02T13:00:08.841Z',
//       timezone: 'America/Puerto_Rico',
//       redirectUrl: 'https://arbimon.rfcx.org/project/puerto-rico-island-wide/visualizer/rec/30472797',
//       mediaWavUrl: 'https://media-api.rfcx.org/internal/assets/streams/SGpk3G4BuSK8_t20210502T130008841Z.20210502T130014640Z_fwav.wav',
//       mediaSpecUrl: 'https://media-api.rfcx.org/internal/assets/streams/SGpk3G4BuSK8_t20210502T130008841Z.20210502T130014640Z_d512.512_mtrue_fspec.png'
//     }
//   ],
//   'Icterus portoricensis': [
//     {
//       siteName: 'TO18',
//       projectName: 'Puerto Rico Island-Wide',
//       songType: 'Common Song',
//       recordedAt: '2021-03-23T14:15:22.634Z',
//       timezone: 'America/Puerto_Rico',
//       redirectUrl: 'https://arbimon.rfcx.org/project/puerto-rico-island-wide/visualizer/rec/24940164',
//       mediaWavUrl: 'https://media-api.rfcx.org/internal/assets/streams/qGMHd3ukiyk5_t20210323T141522634Z.20210323T141525299Z_fwav.wav',
//       mediaSpecUrl: 'https://media-api.rfcx.org/internal/assets/streams/qGMHd3ukiyk5_t20210323T141522634Z.20210323T141525299Z_d512.512_mtrue_fspec.png'
//     }
//   ],
//   'Larus atricilla': [
//     {
//       siteName: 'MO08',
//       projectName: 'Puerto Rico Island-Wide',
//       songType: 'Common Song',
//       recordedAt: '2021-05-17T20:55:54.809Z',
//       timezone: 'America/Puerto_Rico',
//       redirectUrl: 'https://arbimon.rfcx.org/project/puerto-rico-island-wide/visualizer/rec/30722461',
//       mediaWavUrl: 'https://media-api.rfcx.org/internal/assets/streams/6shq44n6q8rr_t20210517T205554809Z.20210517T205559779Z_fwav.wav',
//       mediaSpecUrl: 'https://media-api.rfcx.org/internal/assets/streams/6shq44n6q8rr_t20210517T205554809Z.20210517T205559779Z_d512.512_mtrue_fspec.png'
//     }
//   ],
//   'Leptodactylus albilabris': [
//     {
//       siteName: 'RO10_repeated',
//       projectName: 'Puerto Rico Island-Wide',
//       songType: 'Common Song',
//       recordedAt: '2021-05-05T18:55:51.443Z',
//       timezone: 'America/Puerto_Rico',
//       redirectUrl: 'https://arbimon.rfcx.org/project/puerto-rico-island-wide/visualizer/rec/29630911',
//       mediaWavUrl: 'https://media-api.rfcx.org/internal/assets/streams/0r5kgVEqoCxI_t20210505T185551443Z.20210505T185554319Z_fwav.wav',
//       mediaSpecUrl: 'https://media-api.rfcx.org/internal/assets/streams/0r5kgVEqoCxI_t20210505T185551443Z.20210505T185554319Z_d512.512_mtrue_fspec.png'
//     }
//   ],
//   'Lithobates catesbeianus': [
//     {
//       siteName: 'SA34',
//       projectName: 'Puerto Rico Island-Wide',
//       songType: 'Common Song',
//       recordedAt: '2021-04-06T05:15:36.025Z',
//       timezone: 'America/Puerto_Rico',
//       redirectUrl: 'https://arbimon.rfcx.org/project/puerto-rico-island-wide/visualizer/rec/26167411',
//       mediaWavUrl: 'https://media-api.rfcx.org/internal/assets/streams/CH8KYPyrp7CS_t20210406T051536025Z.20210406T051537239Z_fwav.wav',
//       mediaSpecUrl: 'https://media-api.rfcx.org/internal/assets/streams/CH8KYPyrp7CS_t20210406T051536025Z.20210406T051537239Z_d512.512_mtrue_fspec.png'
//     }
//   ],
//   'Margarops fuscatus': [
//     {
//       siteName: 'MA12',
//       projectName: 'Puerto Rico Island-Wide',
//       songType: 'Common Song',
//       recordedAt: '2021-04-18T14:55:21.343Z',
//       timezone: 'America/Puerto_Rico',
//       redirectUrl: 'https://arbimon.rfcx.org/project/puerto-rico-island-wide/visualizer/rec/27567415',
//       mediaWavUrl: 'https://media-api.rfcx.org/internal/assets/streams/36yUsjbFHpbS_t20210418T145521343Z.20210418T145525138Z_fwav.wav',
//       mediaSpecUrl: 'https://media-api.rfcx.org/internal/assets/streams/36yUsjbFHpbS_t20210418T145521343Z.20210418T145525138Z_d512.512_mtrue_fspec.png'
//     },
//     {
//       siteName: 'VI39',
//       projectName: 'Puerto Rico Island-Wide',
//       songType: 'Common Song',
//       recordedAt: '2021-04-18T22:30:05.196Z',
//       timezone: 'America/Puerto_Rico',
//       redirectUrl: 'https://arbimon.rfcx.org/project/puerto-rico-island-wide/visualizer/rec/27202856',
//       mediaWavUrl: 'https://media-api.rfcx.org/internal/assets/streams/UwQJz0Ad6v5z_t20210418T223005196Z.20210418T223009766Z_fwav.wav',
//       mediaSpecUrl: 'https://media-api.rfcx.org/internal/assets/streams/UwQJz0Ad6v5z_t20210418T223005196Z.20210418T223009766Z_d512.512_mtrue_fspec.png'
//     },
//     {
//       siteName: 'VI39',
//       projectName: 'Puerto Rico Island-Wide',
//       songType: 'Common Song',
//       recordedAt: '2021-04-18T22:30:05.196Z',
//       timezone: 'America/Puerto_Rico',
//       redirectUrl: 'https://arbimon.rfcx.org/project/puerto-rico-island-wide/visualizer/rec/27202856',
//       mediaWavUrl: 'https://media-api.rfcx.org/internal/assets/streams/UwQJz0Ad6v5z_t20210418T223005196Z.20210418T223009766Z_fwav.wav',
//       mediaSpecUrl: 'https://media-api.rfcx.org/internal/assets/streams/UwQJz0Ad6v5z_t20210418T223005196Z.20210418T223009766Z_d512.512_mtrue_fspec.png'
//     },
//     {
//       siteName: 'MO_KC',
//       projectName: 'Puerto Rico Island-Wide',
//       songType: 'Common Song',
//       recordedAt: '2021-05-18T22:25:00.672Z',
//       timezone: 'America/Puerto_Rico',
//       redirectUrl: 'https://arbimon.rfcx.org/project/puerto-rico-island-wide/visualizer/rec/31208752',
//       mediaWavUrl: 'https://media-api.rfcx.org/internal/assets/streams/67vt51u7jx47_t20210518T222500672Z.20210518T222504538Z_fwav.wav',
//       mediaSpecUrl: 'https://media-api.rfcx.org/internal/assets/streams/67vt51u7jx47_t20210518T222500672Z.20210518T222504538Z_d512.512_mtrue_fspec.png'
//     },
//     {
//       siteName: 'MA12',
//       projectName: 'Puerto Rico Island-Wide',
//       songType: 'Common Song',
//       recordedAt: '2021-04-18T14:55:35.098Z',
//       timezone: 'America/Puerto_Rico',
//       redirectUrl: 'https://arbimon.rfcx.org/project/puerto-rico-island-wide/visualizer/rec/27567415',
//       mediaWavUrl: 'https://media-api.rfcx.org/internal/assets/streams/36yUsjbFHpbS_t20210418T145535098Z.20210418T145539006Z_fwav.wav',
//       mediaSpecUrl: 'https://media-api.rfcx.org/internal/assets/streams/36yUsjbFHpbS_t20210418T145535098Z.20210418T145539006Z_d512.512_mtrue_fspec.png'
//     },
//     {
//       siteName: 'CR09',
//       projectName: 'Puerto Rico Island-Wide',
//       songType: 'Common Song',
//       recordedAt: '2021-05-03T14:15:20.711Z',
//       timezone: 'America/Puerto_Rico',
//       redirectUrl: 'https://arbimon.rfcx.org/project/puerto-rico-island-wide/visualizer/rec/28767066',
//       mediaWavUrl: 'https://media-api.rfcx.org/internal/assets/streams/mCW47hcb19kE_t20210503T141520711Z.20210503T141524577Z_fwav.wav',
//       mediaSpecUrl: 'https://media-api.rfcx.org/internal/assets/streams/mCW47hcb19kE_t20210503T141520711Z.20210503T141524577Z_d512.512_mtrue_fspec.png'
//     },
//     {
//       siteName: 'VI06',
//       projectName: 'Puerto Rico Island-Wide',
//       songType: 'Simple Call',
//       recordedAt: '2021-04-20T11:55:53.911Z',
//       timezone: 'America/Puerto_Rico',
//       redirectUrl: 'https://arbimon.rfcx.org/project/puerto-rico-island-wide/visualizer/rec/27761060',
//       mediaWavUrl: 'https://media-api.rfcx.org/internal/assets/streams/6Wu4rZss6mtE_t20210420T115553911Z.20210420T115554987Z_fwav.wav',
//       mediaSpecUrl: 'https://media-api.rfcx.org/internal/assets/streams/6Wu4rZss6mtE_t20210420T115553911Z.20210420T115554987Z_d512.512_mtrue_fspec.png'
//     }
//   ],
//   'Megaceryle alcyon': [
//     {
//       siteName: 'PO05_2',
//       projectName: 'Puerto Rico Island-Wide',
//       songType: 'Common Song',
//       recordedAt: '2021-03-08T19:10:39.356Z',
//       timezone: 'America/Puerto_Rico',
//       redirectUrl: 'https://arbimon.rfcx.org/project/puerto-rico-island-wide/visualizer/rec/13897853',
//       mediaWavUrl: 'https://media-api.rfcx.org/internal/assets/streams/qur86alqdlpt_t20210308T191039356Z.20210308T191042667Z_fwav.wav',
//       mediaSpecUrl: 'https://media-api.rfcx.org/internal/assets/streams/qur86alqdlpt_t20210308T191039356Z.20210308T191042667Z_d512.512_mtrue_fspec.png'
//     }
//   ],
//   'Megascops nudipes': [
//     {
//       siteName: 'PA24_NEW',
//       projectName: 'Puerto Rico Island-Wide',
//       songType: 'Alternative Song',
//       recordedAt: '2021-04-08T03:50:40.768Z',
//       timezone: 'America/Puerto_Rico',
//       redirectUrl: 'https://arbimon.rfcx.org/project/puerto-rico-island-wide/visualizer/rec/26035280',
//       mediaWavUrl: 'https://media-api.rfcx.org/internal/assets/streams/yqtor6h9o0vr_t20210408T035040768Z.20210408T035043915Z_fwav.wav',
//       mediaSpecUrl: 'https://media-api.rfcx.org/internal/assets/streams/yqtor6h9o0vr_t20210408T035040768Z.20210408T035043915Z_d512.512_mtrue_fspec.png'
//     },
//     {
//       siteName: 'PA24_NEW',
//       projectName: 'Puerto Rico Island-Wide',
//       songType: 'Alternative Song',
//       recordedAt: '2021-04-08T03:50:40.768Z',
//       timezone: 'America/Puerto_Rico',
//       redirectUrl: 'https://arbimon.rfcx.org/project/puerto-rico-island-wide/visualizer/rec/26035280',
//       mediaWavUrl: 'https://media-api.rfcx.org/internal/assets/streams/yqtor6h9o0vr_t20210408T035040768Z.20210408T035043915Z_fwav.wav',
//       mediaSpecUrl: 'https://media-api.rfcx.org/internal/assets/streams/yqtor6h9o0vr_t20210408T035040768Z.20210408T035043915Z_d512.512_mtrue_fspec.png'
//     },
//     {
//       siteName: 'PA24_NEW',
//       projectName: 'Puerto Rico Island-Wide',
//       songType: 'Alternative Song',
//       recordedAt: '2021-04-08T03:50:40.768Z',
//       timezone: 'America/Puerto_Rico',
//       redirectUrl: 'https://arbimon.rfcx.org/project/puerto-rico-island-wide/visualizer/rec/26035280',
//       mediaWavUrl: 'https://media-api.rfcx.org/internal/assets/streams/yqtor6h9o0vr_t20210408T035040768Z.20210408T035043915Z_fwav.wav',
//       mediaSpecUrl: 'https://media-api.rfcx.org/internal/assets/streams/yqtor6h9o0vr_t20210408T035040768Z.20210408T035043915Z_d512.512_mtrue_fspec.png'
//     },
//     {
//       siteName: 'PA24_NEW',
//       projectName: 'Puerto Rico Island-Wide',
//       songType: 'Alternative Song',
//       recordedAt: '2021-04-08T03:50:40.768Z',
//       timezone: 'America/Puerto_Rico',
//       redirectUrl: 'https://arbimon.rfcx.org/project/puerto-rico-island-wide/visualizer/rec/26035280',
//       mediaWavUrl: 'https://media-api.rfcx.org/internal/assets/streams/yqtor6h9o0vr_t20210408T035040768Z.20210408T035043915Z_fwav.wav',
//       mediaSpecUrl: 'https://media-api.rfcx.org/internal/assets/streams/yqtor6h9o0vr_t20210408T035040768Z.20210408T035043915Z_d512.512_mtrue_fspec.png'
//     }
//   ],
//   'Melanerpes portoricensis': [
//     {
//       siteName: 'PA40_NEW',
//       projectName: 'Puerto Rico Island-Wide',
//       songType: 'Common Song',
//       recordedAt: '2021-04-12T14:15:29.444Z',
//       timezone: 'America/Puerto_Rico',
//       redirectUrl: 'https://arbimon.rfcx.org/project/puerto-rico-island-wide/visualizer/rec/26084416',
//       mediaWavUrl: 'https://media-api.rfcx.org/internal/assets/streams/ltprw4fjvmyq_t20210412T141529444Z.20210412T141536516Z_fwav.wav',
//       mediaSpecUrl: 'https://media-api.rfcx.org/internal/assets/streams/ltprw4fjvmyq_t20210412T141529444Z.20210412T141536516Z_d512.512_mtrue_fspec.png'
//     }
//   ],
//   'Melanospiza bicolor': [
//     {
//       siteName: 'GUI05',
//       projectName: 'Puerto Rico Island-Wide',
//       songType: 'Common Song',
//       recordedAt: '2021-03-07T10:30:27.244Z',
//       timezone: 'America/Puerto_Rico',
//       redirectUrl: 'https://arbimon.rfcx.org/project/puerto-rico-island-wide/visualizer/rec/23876820',
//       mediaWavUrl: 'https://media-api.rfcx.org/internal/assets/streams/a3ve3YStjM1x_t20210307T103027244Z.20210307T103029994Z_fwav.wav',
//       mediaSpecUrl: 'https://media-api.rfcx.org/internal/assets/streams/a3ve3YStjM1x_t20210307T103027244Z.20210307T103029994Z_d512.512_mtrue_fspec.png'
//     }
//   ],
//   'Melopyrrha portoricensis': [
//     {
//       siteName: 'GUI04',
//       projectName: 'Puerto Rico Island-Wide',
//       songType: 'Common Song',
//       recordedAt: '2021-03-08T13:05:20.853Z',
//       timezone: 'America/Puerto_Rico',
//       redirectUrl: 'https://arbimon.rfcx.org/project/puerto-rico-island-wide/visualizer/rec/23974021',
//       mediaWavUrl: 'https://media-api.rfcx.org/internal/assets/streams/VImn5gQhYBhb_t20210308T130520853Z.20210308T130523737Z_fwav.wav',
//       mediaSpecUrl: 'https://media-api.rfcx.org/internal/assets/streams/VImn5gQhYBhb_t20210308T130520853Z.20210308T130523737Z_d512.512_mtrue_fspec.png'
//     }
//   ],
//   'Mimus polyglottos': [
//     {
//       siteName: 'MO19',
//       projectName: 'Puerto Rico Island-Wide',
//       songType: 'Common Song',
//       recordedAt: '2021-05-14T22:10:34.099Z',
//       timezone: 'America/Puerto_Rico',
//       redirectUrl: 'https://arbimon.rfcx.org/project/puerto-rico-island-wide/visualizer/rec/30930595',
//       mediaWavUrl: 'https://media-api.rfcx.org/internal/assets/streams/rgr967d3lc5k_t20210514T221034099Z.20210514T221051666Z_fwav.wav',
//       mediaSpecUrl: 'https://media-api.rfcx.org/internal/assets/streams/rgr967d3lc5k_t20210514T221034099Z.20210514T221051666Z_d512.512_mtrue_fspec.png'
//     }
//   ],
//   'Molothrus bonariensis': [
//     {
//       siteName: 'SA03',
//       projectName: 'Puerto Rico Island-Wide',
//       songType: 'Common Song',
//       recordedAt: '2021-04-02T19:10:03.437Z',
//       timezone: 'America/Puerto_Rico',
//       redirectUrl: 'https://arbimon.rfcx.org/project/puerto-rico-island-wide/visualizer/rec/25358947',
//       mediaWavUrl: 'https://media-api.rfcx.org/internal/assets/streams/BuyvsZ4mo8lB_t20210402T191003437Z.20210402T191006337Z_fwav.wav',
//       mediaSpecUrl: 'https://media-api.rfcx.org/internal/assets/streams/BuyvsZ4mo8lB_t20210402T191003437Z.20210402T191006337Z_d512.512_mtrue_fspec.png'
//     },
//     {
//       siteName: 'LU_27',
//       projectName: 'Puerto Rico Island-Wide',
//       songType: 'Common Song',
//       recordedAt: '2021-04-03T13:15:35.463Z',
//       timezone: 'America/Puerto_Rico',
//       redirectUrl: 'https://arbimon.rfcx.org/project/puerto-rico-island-wide/visualizer/rec/25375268',
//       mediaWavUrl: 'https://media-api.rfcx.org/internal/assets/streams/qm7ezp2c4qbl_t20210403T131535463Z.20210403T131538325Z_fwav.wav',
//       mediaSpecUrl: 'https://media-api.rfcx.org/internal/assets/streams/qm7ezp2c4qbl_t20210403T131535463Z.20210403T131538325Z_d512.512_mtrue_fspec.png'
//     },
//     {
//       siteName: 'LU_27',
//       projectName: 'Puerto Rico Island-Wide',
//       songType: 'Common Song',
//       recordedAt: '2021-04-03T13:15:35.463Z',
//       timezone: 'America/Puerto_Rico',
//       redirectUrl: 'https://arbimon.rfcx.org/project/puerto-rico-island-wide/visualizer/rec/25375268',
//       mediaWavUrl: 'https://media-api.rfcx.org/internal/assets/streams/qm7ezp2c4qbl_t20210403T131535463Z.20210403T131538325Z_fwav.wav',
//       mediaSpecUrl: 'https://media-api.rfcx.org/internal/assets/streams/qm7ezp2c4qbl_t20210403T131535463Z.20210403T131538325Z_d512.512_mtrue_fspec.png'
//     },
//     {
//       siteName: 'POEXTRA13',
//       projectName: 'Puerto Rico Island-Wide',
//       songType: 'Common Song',
//       recordedAt: '2021-03-09T16:35:38.456Z',
//       timezone: 'America/Puerto_Rico',
//       redirectUrl: 'https://arbimon.rfcx.org/project/puerto-rico-island-wide/visualizer/rec/23934740',
//       mediaWavUrl: 'https://media-api.rfcx.org/internal/assets/streams/7h7op2shntao_t20210309T163538456Z.20210309T163542747Z_fwav.wav',
//       mediaSpecUrl: 'https://media-api.rfcx.org/internal/assets/streams/7h7op2shntao_t20210309T163538456Z.20210309T163542747Z_d512.512_mtrue_fspec.png'
//     }
//   ],
//   'Myiarchus antillarum': [
//     {
//       siteName: 'CR29',
//       projectName: 'Puerto Rico Island-Wide',
//       songType: 'Common Song',
//       recordedAt: '2021-05-03T08:40:52.666Z',
//       timezone: 'America/Puerto_Rico',
//       redirectUrl: 'https://arbimon.rfcx.org/project/puerto-rico-island-wide/visualizer/rec/28714499',
//       mediaWavUrl: 'https://media-api.rfcx.org/internal/assets/streams/lurBc90SO37V_t20210503T084052666Z.20210503T084054133Z_fwav.wav',
//       mediaSpecUrl: 'https://media-api.rfcx.org/internal/assets/streams/lurBc90SO37V_t20210503T084052666Z.20210503T084054133Z_d512.512_mtrue_fspec.png'
//     }
//   ],
//   'Myiopsitta monachus': [
//     {
//       siteName: 'AR30',
//       projectName: 'Puerto Rico Island-Wide',
//       songType: 'Simple Call',
//       recordedAt: '2021-04-27T12:25:25.675Z',
//       timezone: 'America/Puerto_Rico',
//       redirectUrl: 'https://arbimon.rfcx.org/project/puerto-rico-island-wide/visualizer/rec/28364287',
//       mediaWavUrl: 'https://media-api.rfcx.org/internal/assets/streams/tsU4AMTbFo0p_t20210427T122525675Z.20210427T122539909Z_fwav.wav',
//       mediaSpecUrl: 'https://media-api.rfcx.org/internal/assets/streams/tsU4AMTbFo0p_t20210427T122525675Z.20210427T122539909Z_d512.512_mtrue_fspec.png'
//     }
//   ],
//   'Nesospingus speculiferus': [
//     {
//       siteName: 'LU_47',
//       projectName: 'Puerto Rico Island-Wide',
//       songType: 'Simple Call',
//       recordedAt: '2021-04-05T12:15:46.083Z',
//       timezone: 'America/Puerto_Rico',
//       redirectUrl: 'https://arbimon.rfcx.org/project/puerto-rico-island-wide/visualizer/rec/25471223',
//       mediaWavUrl: 'https://media-api.rfcx.org/internal/assets/streams/jusxxxp5fcmv_t20210405T121546083Z.20210405T121546867Z_fwav.wav',
//       mediaSpecUrl: 'https://media-api.rfcx.org/internal/assets/streams/jusxxxp5fcmv_t20210405T121546083Z.20210405T121546867Z_d512.512_mtrue_fspec.png'
//     },
//     {
//       siteName: 'PA40_NEW',
//       projectName: 'Puerto Rico Island-Wide',
//       songType: 'Common Song',
//       recordedAt: '2021-04-12T12:05:56.464Z',
//       timezone: 'America/Puerto_Rico',
//       redirectUrl: 'https://arbimon.rfcx.org/project/puerto-rico-island-wide/visualizer/rec/26084186',
//       mediaWavUrl: 'https://media-api.rfcx.org/internal/assets/streams/ltprw4fjvmyq_t20210412T120556464Z.20210412T120558733Z_fwav.wav',
//       mediaSpecUrl: 'https://media-api.rfcx.org/internal/assets/streams/ltprw4fjvmyq_t20210412T120556464Z.20210412T120558733Z_d512.512_mtrue_fspec.png'
//     },
//     {
//       siteName: 'LU_50',
//       projectName: 'Puerto Rico Island-Wide',
//       songType: 'Common Song',
//       recordedAt: '2021-04-04T10:15:14.026Z',
//       timezone: 'America/Puerto_Rico',
//       redirectUrl: 'https://arbimon.rfcx.org/project/puerto-rico-island-wide/visualizer/rec/25511374',
//       mediaWavUrl: 'https://media-api.rfcx.org/internal/assets/streams/26bu9mc9lbct_t20210404T101514026Z.20210404T101515751Z_fwav.wav',
//       mediaSpecUrl: 'https://media-api.rfcx.org/internal/assets/streams/26bu9mc9lbct_t20210404T101514026Z.20210404T101515751Z_d512.512_mtrue_fspec.png'
//     }
//   ],
//   'Osteopilus septentrionalis': [
//     {
//       siteName: 'CR50',
//       projectName: 'Puerto Rico Island-Wide',
//       songType: 'Common Song',
//       recordedAt: '2021-05-04T06:10:15.902Z',
//       timezone: 'America/Puerto_Rico',
//       redirectUrl: 'https://arbimon.rfcx.org/project/puerto-rico-island-wide/visualizer/rec/28770338',
//       mediaWavUrl: 'https://media-api.rfcx.org/internal/assets/streams/OnralGaiviCo_t20210504T061015902Z.20210504T061021043Z_fwav.wav',
//       mediaSpecUrl: 'https://media-api.rfcx.org/internal/assets/streams/OnralGaiviCo_t20210504T061015902Z.20210504T061021043Z_d512.512_mtrue_fspec.png'
//     }
//   ],
//   'Parkesia noveboracensis': [
//     {
//       siteName: 'GU34',
//       projectName: 'Puerto Rico Island-Wide',
//       songType: 'Simple Call',
//       recordedAt: '2021-03-16T21:45:05.570Z',
//       timezone: 'America/Puerto_Rico',
//       redirectUrl: 'https://arbimon.rfcx.org/project/puerto-rico-island-wide/visualizer/rec/24854428',
//       mediaWavUrl: 'https://media-api.rfcx.org/internal/assets/streams/IqkLFBEDJTzH_t20210316T214505570Z.20210316T214508051Z_fwav.wav',
//       mediaSpecUrl: 'https://media-api.rfcx.org/internal/assets/streams/IqkLFBEDJTzH_t20210316T214505570Z.20210316T214508051Z_d512.512_mtrue_fspec.png'
//     }
//   ],
//   'Passer domesticus': [
//     {
//       siteName: 'SAE11',
//       projectName: 'Puerto Rico Island-Wide',
//       songType: 'Common Song',
//       recordedAt: '2021-05-12T09:50:06.381Z',
//       timezone: 'America/Puerto_Rico',
//       redirectUrl: 'https://arbimon.rfcx.org/project/puerto-rico-island-wide/visualizer/rec/30080560',
//       mediaWavUrl: 'https://media-api.rfcx.org/internal/assets/streams/21p9sh6zsfro_t20210512T095006381Z.20210512T095008581Z_fwav.wav',
//       mediaSpecUrl: 'https://media-api.rfcx.org/internal/assets/streams/21p9sh6zsfro_t20210512T095006381Z.20210512T095008581Z_d512.512_mtrue_fspec.png'
//     }
//   ],
//   'Patagioenas leucocephala': [
//     {
//       siteName: 'DO33',
//       projectName: 'Puerto Rico Island-Wide',
//       songType: 'Common Song',
//       recordedAt: '2021-03-03T14:25:42.823Z',
//       timezone: 'America/Puerto_Rico',
//       redirectUrl: 'https://arbimon.rfcx.org/project/puerto-rico-island-wide/visualizer/rec/24680249',
//       mediaWavUrl: 'https://media-api.rfcx.org/internal/assets/streams/W7YLLek7TEuY_t20210303T142542823Z.20210303T142544566Z_fwav.wav',
//       mediaSpecUrl: 'https://media-api.rfcx.org/internal/assets/streams/W7YLLek7TEuY_t20210303T142542823Z.20210303T142544566Z_d512.512_mtrue_fspec.png'
//     }
//   ],
//   'Patagioenas squamosa': [
//     {
//       siteName: 'CR09',
//       projectName: 'Puerto Rico Island-Wide',
//       songType: 'Common Song',
//       recordedAt: '2021-05-03T10:45:39.604Z',
//       timezone: 'America/Puerto_Rico',
//       redirectUrl: 'https://arbimon.rfcx.org/project/puerto-rico-island-wide/visualizer/rec/28759596',
//       mediaWavUrl: 'https://media-api.rfcx.org/internal/assets/streams/mCW47hcb19kE_t20210503T104539604Z.20210503T104542252Z_fwav.wav',
//       mediaSpecUrl: 'https://media-api.rfcx.org/internal/assets/streams/mCW47hcb19kE_t20210503T104539604Z.20210503T104542252Z_d512.512_mtrue_fspec.png'
//     }
//   ],
//   'Peltophryne lemur': [
//     {
//       siteName: 'Rec_examples',
//       projectName: 'Puerto Rico Island-Wide',
//       songType: 'Common Song',
//       recordedAt: '2021-04-07T01:00:05.334Z',
//       timezone: 'America/Puerto_Rico',
//       redirectUrl: 'https://arbimon.rfcx.org/project/puerto-rico-island-wide/visualizer/rec/25062215',
//       mediaWavUrl: 'https://media-api.rfcx.org/internal/assets/streams/pw6fzadj7orc_t20210407T010005334Z.20210407T010007156Z_fwav.wav',
//       mediaSpecUrl: 'https://media-api.rfcx.org/internal/assets/streams/pw6fzadj7orc_t20210407T010005334Z.20210407T010007156Z_d512.512_mtrue_fspec.png'
//     },
//     {
//       siteName: 'Rec_examples',
//       projectName: 'Puerto Rico Island-Wide',
//       songType: 'Common Song',
//       recordedAt: '2021-04-07T01:00:05.334Z',
//       timezone: 'America/Puerto_Rico',
//       redirectUrl: 'https://arbimon.rfcx.org/project/puerto-rico-island-wide/visualizer/rec/25062215',
//       mediaWavUrl: 'https://media-api.rfcx.org/internal/assets/streams/pw6fzadj7orc_t20210407T010005334Z.20210407T010007156Z_fwav.wav',
//       mediaSpecUrl: 'https://media-api.rfcx.org/internal/assets/streams/pw6fzadj7orc_t20210407T010005334Z.20210407T010007156Z_d512.512_mtrue_fspec.png'
//     },
//     {
//       siteName: 'Rec_examples',
//       projectName: 'Puerto Rico Island-Wide',
//       songType: 'Common Song',
//       recordedAt: '2021-04-07T01:00:05.334Z',
//       timezone: 'America/Puerto_Rico',
//       redirectUrl: 'https://arbimon.rfcx.org/project/puerto-rico-island-wide/visualizer/rec/25062215',
//       mediaWavUrl: 'https://media-api.rfcx.org/internal/assets/streams/pw6fzadj7orc_t20210407T010005334Z.20210407T010007156Z_fwav.wav',
//       mediaSpecUrl: 'https://media-api.rfcx.org/internal/assets/streams/pw6fzadj7orc_t20210407T010005334Z.20210407T010007156Z_d512.512_mtrue_fspec.png'
//     }
//   ],
//   'Pluvialis squatarola': [
//     {
//       siteName: 'CR13',
//       projectName: 'Puerto Rico Island-Wide',
//       songType: 'Simple Call',
//       recordedAt: '2021-05-02T10:10:43.447Z',
//       timezone: 'America/Puerto_Rico',
//       redirectUrl: 'https://arbimon.rfcx.org/project/puerto-rico-island-wide/visualizer/rec/30445555',
//       mediaWavUrl: 'https://media-api.rfcx.org/internal/assets/streams/D7otJV26vYjL_t20210502T101043447Z.20210502T101044427Z_fwav.wav',
//       mediaSpecUrl: 'https://media-api.rfcx.org/internal/assets/streams/D7otJV26vYjL_t20210502T101043447Z.20210502T101044427Z_d512.512_mtrue_fspec.png'
//     }
//   ],
//   'Porphyrio martinica': [
//     {
//       siteName: 'PO05_2',
//       projectName: 'Puerto Rico Island-Wide',
//       songType: 'Common Song',
//       recordedAt: '2021-03-02T11:20:22.543Z',
//       timezone: 'America/Puerto_Rico',
//       redirectUrl: 'https://arbimon.rfcx.org/project/puerto-rico-island-wide/visualizer/rec/13889688',
//       mediaWavUrl: 'https://media-api.rfcx.org/internal/assets/streams/qur86alqdlpt_t20210302T112022543Z.20210302T112027984Z_fwav.wav',
//       mediaSpecUrl: 'https://media-api.rfcx.org/internal/assets/streams/qur86alqdlpt_t20210302T112022543Z.20210302T112027984Z_d512.512_mtrue_fspec.png'
//     }
//   ],
//   'Progne dominicensis': [
//     {
//       siteName: 'PA31',
//       projectName: 'Puerto Rico Island-Wide',
//       songType: 'Common Song',
//       recordedAt: '2021-04-01T11:05:08.988Z',
//       timezone: 'America/Puerto_Rico',
//       redirectUrl: 'https://arbimon.rfcx.org/project/puerto-rico-island-wide/visualizer/rec/25559979',
//       mediaWavUrl: 'https://media-api.rfcx.org/internal/assets/streams/G9orYITUbnQZ_t20210401T110508988Z.20210401T110509634Z_fwav.wav',
//       mediaSpecUrl: 'https://media-api.rfcx.org/internal/assets/streams/G9orYITUbnQZ_t20210401T110508988Z.20210401T110509634Z_d512.512_mtrue_fspec.png'
//     }
//   ],
//   'Quiscalus niger': [
//     {
//       siteName: 'GUE02',
//       projectName: 'Puerto Rico Island-Wide',
//       songType: 'Simple Call',
//       recordedAt: '2021-03-18T10:40:28.108Z',
//       timezone: 'America/Puerto_Rico',
//       redirectUrl: 'https://arbimon.rfcx.org/project/puerto-rico-island-wide/visualizer/rec/25157514',
//       mediaWavUrl: 'https://media-api.rfcx.org/internal/assets/streams/oipvm95xkzm2_t20210318T104028108Z.20210318T104039504Z_fwav.wav',
//       mediaSpecUrl: 'https://media-api.rfcx.org/internal/assets/streams/oipvm95xkzm2_t20210318T104028108Z.20210318T104039504Z_d512.512_mtrue_fspec.png'
//     }
//   ],
//   'Rallus crepitans': [
//     {
//       siteName: 'RO_new_C',
//       projectName: 'Puerto Rico Island-Wide',
//       songType: 'Common Song',
//       recordedAt: '2021-03-05T21:45:42.937Z',
//       timezone: 'America/Puerto_Rico',
//       redirectUrl: 'https://arbimon.rfcx.org/project/puerto-rico-island-wide/visualizer/rec/23996131',
//       mediaWavUrl: 'https://media-api.rfcx.org/internal/assets/streams/y9akeir4o23i_t20210305T214542937Z.20210305T214550248Z_fwav.wav',
//       mediaSpecUrl: 'https://media-api.rfcx.org/internal/assets/streams/y9akeir4o23i_t20210305T214542937Z.20210305T214550248Z_d512.512_mtrue_fspec.png'
//     }
//   ],
//   'Rhinella marina': [
//     {
//       siteName: 'RO14',
//       projectName: 'Puerto Rico Island-Wide',
//       songType: 'Common Song',
//       recordedAt: '2021-03-04T05:40:23.012Z',
//       timezone: 'America/Puerto_Rico',
//       redirectUrl: 'https://arbimon.rfcx.org/project/puerto-rico-island-wide/visualizer/rec/31429874',
//       mediaWavUrl: 'https://media-api.rfcx.org/internal/assets/streams/8pltfgqld1lp_t20210304T054023012Z.20210304T054024614Z_fwav.wav',
//       mediaSpecUrl: 'https://media-api.rfcx.org/internal/assets/streams/8pltfgqld1lp_t20210304T054023012Z.20210304T054024614Z_d512.512_mtrue_fspec.png'
//     },
//     {
//       siteName: 'RO14',
//       projectName: 'Puerto Rico Island-Wide',
//       songType: 'Common Song',
//       recordedAt: '2021-03-04T05:40:23.012Z',
//       timezone: 'America/Puerto_Rico',
//       redirectUrl: 'https://arbimon.rfcx.org/project/puerto-rico-island-wide/visualizer/rec/31429874',
//       mediaWavUrl: 'https://media-api.rfcx.org/internal/assets/streams/8pltfgqld1lp_t20210304T054023012Z.20210304T054024614Z_fwav.wav',
//       mediaSpecUrl: 'https://media-api.rfcx.org/internal/assets/streams/8pltfgqld1lp_t20210304T054023012Z.20210304T054024614Z_d512.512_mtrue_fspec.png'
//     },
//     {
//       siteName: 'RO14',
//       projectName: 'Puerto Rico Island-Wide',
//       songType: 'Common Song',
//       recordedAt: '2021-03-04T05:40:23.012Z',
//       timezone: 'America/Puerto_Rico',
//       redirectUrl: 'https://arbimon.rfcx.org/project/puerto-rico-island-wide/visualizer/rec/31429874',
//       mediaWavUrl: 'https://media-api.rfcx.org/internal/assets/streams/8pltfgqld1lp_t20210304T054023012Z.20210304T054024614Z_fwav.wav',
//       mediaSpecUrl: 'https://media-api.rfcx.org/internal/assets/streams/8pltfgqld1lp_t20210304T054023012Z.20210304T054024614Z_d512.512_mtrue_fspec.png'
//     }
//   ],
//   'Setophaga adelaidae': [
//     {
//       siteName: 'GU32',
//       projectName: 'Puerto Rico Island-Wide',
//       songType: 'Common Song',
//       recordedAt: '2021-03-16T19:50:21.801Z',
//       timezone: 'America/Puerto_Rico',
//       redirectUrl: 'https://arbimon.rfcx.org/project/puerto-rico-island-wide/visualizer/rec/24839377',
//       mediaWavUrl: 'https://media-api.rfcx.org/internal/assets/streams/stJ0YMsXTP9v_t20210316T195021801Z.20210316T195025200Z_fwav.wav',
//       mediaSpecUrl: 'https://media-api.rfcx.org/internal/assets/streams/stJ0YMsXTP9v_t20210316T195021801Z.20210316T195025200Z_d512.512_mtrue_fspec.png'
//     },
//     {
//       siteName: 'GU32',
//       projectName: 'Puerto Rico Island-Wide',
//       songType: 'Common Song',
//       recordedAt: '2021-03-16T19:50:21.801Z',
//       timezone: 'America/Puerto_Rico',
//       redirectUrl: 'https://arbimon.rfcx.org/project/puerto-rico-island-wide/visualizer/rec/24839377',
//       mediaWavUrl: 'https://media-api.rfcx.org/internal/assets/streams/stJ0YMsXTP9v_t20210316T195021801Z.20210316T195025200Z_fwav.wav',
//       mediaSpecUrl: 'https://media-api.rfcx.org/internal/assets/streams/stJ0YMsXTP9v_t20210316T195021801Z.20210316T195025200Z_d512.512_mtrue_fspec.png'
//     },
//     {
//       siteName: 'GU32',
//       projectName: 'Puerto Rico Island-Wide',
//       songType: 'Common Song',
//       recordedAt: '2021-03-16T19:50:21.801Z',
//       timezone: 'America/Puerto_Rico',
//       redirectUrl: 'https://arbimon.rfcx.org/project/puerto-rico-island-wide/visualizer/rec/24839377',
//       mediaWavUrl: 'https://media-api.rfcx.org/internal/assets/streams/stJ0YMsXTP9v_t20210316T195021801Z.20210316T195025200Z_fwav.wav',
//       mediaSpecUrl: 'https://media-api.rfcx.org/internal/assets/streams/stJ0YMsXTP9v_t20210316T195021801Z.20210316T195025200Z_d512.512_mtrue_fspec.png'
//     }
//   ],
//   'Setophaga americana': [
//     {
//       siteName: 'DO40',
//       projectName: 'Puerto Rico Island-Wide',
//       songType: 'Common Song',
//       recordedAt: '2021-03-07T17:25:01.575Z',
//       timezone: 'America/Puerto_Rico',
//       redirectUrl: 'https://arbimon.rfcx.org/project/puerto-rico-island-wide/visualizer/rec/13972187',
//       mediaWavUrl: 'https://media-api.rfcx.org/internal/assets/streams/WLcD4QTZXP4k_t20210307T172501575Z.20210307T172503667Z_fwav.wav',
//       mediaSpecUrl: 'https://media-api.rfcx.org/internal/assets/streams/WLcD4QTZXP4k_t20210307T172501575Z.20210307T172503667Z_d512.512_mtrue_fspec.png'
//     }
//   ],
//   'Setophaga angelae': [
//     {
//       siteName: 'MA_eh',
//       projectName: 'Puerto Rico Island-Wide',
//       songType: 'Common Song',
//       recordedAt: '2021-04-15T15:25:05.560Z',
//       timezone: 'America/Puerto_Rico',
//       redirectUrl: 'https://arbimon.rfcx.org/project/puerto-rico-island-wide/visualizer/rec/30690266',
//       mediaWavUrl: 'https://media-api.rfcx.org/internal/assets/streams/b9k6a8kb1ub1_t20210415T152505560Z.20210415T152508781Z_fwav.wav',
//       mediaSpecUrl: 'https://media-api.rfcx.org/internal/assets/streams/b9k6a8kb1ub1_t20210415T152505560Z.20210415T152508781Z_d512.512_mtrue_fspec.png'
//     }
//   ],
//   'Setophaga caerulescens': [
//     {
//       siteName: 'RI03',
//       projectName: 'Puerto Rico Island-Wide',
//       songType: 'Common Song',
//       recordedAt: '2021-03-18T12:15:34.085Z',
//       timezone: 'America/Puerto_Rico',
//       redirectUrl: 'https://arbimon.rfcx.org/project/puerto-rico-island-wide/visualizer/rec/24073366',
//       mediaWavUrl: 'https://media-api.rfcx.org/internal/assets/streams/atL5f7DiLTS2_t20210318T121534085Z.20210318T121535670Z_fwav.wav',
//       mediaSpecUrl: 'https://media-api.rfcx.org/internal/assets/streams/atL5f7DiLTS2_t20210318T121534085Z.20210318T121535670Z_d512.512_mtrue_fspec.png'
//     }
//   ],
//   'Setophaga discolor': [
//     {
//       siteName: 'GU09',
//       projectName: 'Puerto Rico Island-Wide',
//       songType: 'Common Song',
//       recordedAt: '2021-03-24T11:50:12.952Z',
//       timezone: 'America/Puerto_Rico',
//       redirectUrl: 'https://arbimon.rfcx.org/project/puerto-rico-island-wide/visualizer/rec/24832744',
//       mediaWavUrl: 'https://media-api.rfcx.org/internal/assets/streams/Z6OjGcRE2cQo_t20210324T115012952Z.20210324T115014329Z_fwav.wav',
//       mediaSpecUrl: 'https://media-api.rfcx.org/internal/assets/streams/Z6OjGcRE2cQo_t20210324T115012952Z.20210324T115014329Z_d512.512_mtrue_fspec.png'
//     }
//   ],
//   'Setophaga petechia': [
//     {
//       siteName: 'CR01',
//       projectName: 'Puerto Rico Island-Wide',
//       songType: 'Common Song',
//       recordedAt: '2021-04-29T11:05:45.160Z',
//       timezone: 'America/Puerto_Rico',
//       redirectUrl: 'https://arbimon.rfcx.org/project/puerto-rico-island-wide/visualizer/rec/28714252',
//       mediaWavUrl: 'https://media-api.rfcx.org/internal/assets/streams/WN9havhHl0Ax_t20210429T110545160Z.20210429T110546815Z_fwav.wav',
//       mediaSpecUrl: 'https://media-api.rfcx.org/internal/assets/streams/WN9havhHl0Ax_t20210429T110545160Z.20210429T110546815Z_d512.512_mtrue_fspec.png'
//     },
//     {
//       siteName: 'CR30',
//       projectName: 'Puerto Rico Island-Wide',
//       songType: 'Common Song',
//       recordedAt: '2021-04-28T14:30:15.572Z',
//       timezone: 'America/Puerto_Rico',
//       redirectUrl: 'https://arbimon.rfcx.org/project/puerto-rico-island-wide/visualizer/rec/28825833',
//       mediaWavUrl: 'https://media-api.rfcx.org/internal/assets/streams/Uz8Z3SJ5Twym_t20210428T143015572Z.20210428T143017582Z_fwav.wav',
//       mediaSpecUrl: 'https://media-api.rfcx.org/internal/assets/streams/Uz8Z3SJ5Twym_t20210428T143015572Z.20210428T143017582Z_d512.512_mtrue_fspec.png'
//     }
//   ],
//   'Spindalis portoricensis': [
//     {
//       siteName: 'DO16',
//       projectName: 'Puerto Rico Island-Wide',
//       songType: 'Simple Call',
//       recordedAt: '2021-03-04T21:00:18.218Z',
//       timezone: 'America/Puerto_Rico',
//       redirectUrl: 'https://arbimon.rfcx.org/project/puerto-rico-island-wide/visualizer/rec/23608640',
//       mediaWavUrl: 'https://media-api.rfcx.org/internal/assets/streams/pdMjTxlRIa6C_t20210304T210018218Z.20210304T210022549Z_fwav.wav',
//       mediaSpecUrl: 'https://media-api.rfcx.org/internal/assets/streams/pdMjTxlRIa6C_t20210304T210018218Z.20210304T210022549Z_d512.512_mtrue_fspec.png'
//     },
//     {
//       siteName: 'PA40_NEW',
//       projectName: 'Puerto Rico Island-Wide',
//       songType: 'Common Song',
//       recordedAt: '2021-04-12T14:05:02.490Z',
//       timezone: 'America/Puerto_Rico',
//       redirectUrl: 'https://arbimon.rfcx.org/project/puerto-rico-island-wide/visualizer/rec/26085043',
//       mediaWavUrl: 'https://media-api.rfcx.org/internal/assets/streams/ltprw4fjvmyq_t20210412T140502490Z.20210412T140509162Z_fwav.wav',
//       mediaSpecUrl: 'https://media-api.rfcx.org/internal/assets/streams/ltprw4fjvmyq_t20210412T140502490Z.20210412T140509162Z_d512.512_mtrue_fspec.png'
//     }
//   ],
//   'Streptopelia decaocto': [
//     {
//       siteName: 'CU47',
//       projectName: 'Puerto Rico Island-Wide',
//       songType: 'Common Song',
//       recordedAt: '2021-03-25T14:00:29.174Z',
//       timezone: 'America/Puerto_Rico',
//       redirectUrl: 'https://arbimon.rfcx.org/project/puerto-rico-island-wide/visualizer/rec/25259414',
//       mediaWavUrl: 'https://media-api.rfcx.org/internal/assets/streams/BK44qRFAdx82_t20210325T140029174Z.20210325T140033965Z_fwav.wav',
//       mediaSpecUrl: 'https://media-api.rfcx.org/internal/assets/streams/BK44qRFAdx82_t20210325T140029174Z.20210325T140033965Z_d512.512_mtrue_fspec.png'
//     }
//   ],
//   'Sula sula': [
//     {
//       siteName: 'MO40',
//       projectName: 'Puerto Rico Island-Wide',
//       songType: 'Common Song',
//       recordedAt: '2021-05-14T10:25:35.525Z',
//       timezone: 'America/Puerto_Rico',
//       redirectUrl: 'https://arbimon.rfcx.org/project/puerto-rico-island-wide/visualizer/rec/30665283',
//       mediaWavUrl: 'https://media-api.rfcx.org/internal/assets/streams/gwg6ut8tp5fx_t20210514T102535525Z.20210514T102537946Z_fwav.wav',
//       mediaSpecUrl: 'https://media-api.rfcx.org/internal/assets/streams/gwg6ut8tp5fx_t20210514T102535525Z.20210514T102537946Z_d512.512_mtrue_fspec.png'
//     }
//   ],
//   'Thalasseus maximus': [
//     {
//       siteName: 'CR41',
//       projectName: 'Puerto Rico Island-Wide',
//       songType: 'Common Song',
//       recordedAt: '2021-04-29T13:05:42.197Z',
//       timezone: 'America/Puerto_Rico',
//       redirectUrl: 'https://arbimon.rfcx.org/project/puerto-rico-island-wide/visualizer/rec/28742849',
//       mediaWavUrl: 'https://media-api.rfcx.org/internal/assets/streams/l0uUffLc4RCX_t20210429T130542197Z.20210429T130544147Z_fwav.wav',
//       mediaSpecUrl: 'https://media-api.rfcx.org/internal/assets/streams/l0uUffLc4RCX_t20210429T130542197Z.20210429T130544147Z_d512.512_mtrue_fspec.png'
//     }
//   ],
//   'Tiaris olivaceus': [
//     {
//       siteName: 'DO16',
//       projectName: 'Puerto Rico Island-Wide',
//       songType: 'Common Song',
//       recordedAt: '2021-03-04T12:30:25.284Z',
//       timezone: 'America/Puerto_Rico',
//       redirectUrl: 'https://arbimon.rfcx.org/project/puerto-rico-island-wide/visualizer/rec/23608025',
//       mediaWavUrl: 'https://media-api.rfcx.org/internal/assets/streams/pdMjTxlRIa6C_t20210304T123025284Z.20210304T123027044Z_fwav.wav',
//       mediaSpecUrl: 'https://media-api.rfcx.org/internal/assets/streams/pdMjTxlRIa6C_t20210304T123025284Z.20210304T123027044Z_d512.512_mtrue_fspec.png'
//     }
//   ],
//   'Todus mexicanus': [
//     {
//       siteName: 'RI14',
//       projectName: 'Puerto Rico Island-Wide',
//       songType: 'Common Song',
//       recordedAt: '2021-03-23T12:25:30.015Z',
//       timezone: 'America/Puerto_Rico',
//       redirectUrl: 'https://arbimon.rfcx.org/project/puerto-rico-island-wide/visualizer/rec/24210384',
//       mediaWavUrl: 'https://media-api.rfcx.org/internal/assets/streams/z0IYAkBondFb_t20210323T122530015Z.20210323T122532215Z_fwav.wav',
//       mediaSpecUrl: 'https://media-api.rfcx.org/internal/assets/streams/z0IYAkBondFb_t20210323T122530015Z.20210323T122532215Z_d512.512_mtrue_fspec.png'
//     }
//   ],
//   'Tringa melanoleuca': [
//     {
//       siteName: 'CR02',
//       projectName: 'Puerto Rico Island-Wide',
//       songType: 'Common Song',
//       recordedAt: '2021-04-28T02:50:38.676Z',
//       timezone: 'America/Puerto_Rico',
//       redirectUrl: 'https://arbimon.rfcx.org/project/puerto-rico-island-wide/visualizer/rec/28719603',
//       mediaWavUrl: 'https://media-api.rfcx.org/internal/assets/streams/Vq4L8FklmztV_t20210428T025038676Z.20210428T025042807Z_fwav.wav',
//       mediaSpecUrl: 'https://media-api.rfcx.org/internal/assets/streams/Vq4L8FklmztV_t20210428T025038676Z.20210428T025042807Z_d512.512_mtrue_fspec.png'
//     }
//   ],
//   'Tringa semipalmata': [
//     {
//       siteName: 'SA23',
//       projectName: 'Puerto Rico Island-Wide',
//       songType: 'Common Song',
//       recordedAt: '2021-04-06T11:50:54.739Z',
//       timezone: 'America/Puerto_Rico',
//       redirectUrl: 'https://arbimon.rfcx.org/project/puerto-rico-island-wide/visualizer/rec/25944171',
//       mediaWavUrl: 'https://media-api.rfcx.org/internal/assets/streams/mCgqhKP6baGd_t20210406T115054739Z.20210406T115058459Z_fwav.wav',
//       mediaSpecUrl: 'https://media-api.rfcx.org/internal/assets/streams/mCgqhKP6baGd_t20210406T115054739Z.20210406T115058459Z_d512.512_mtrue_fspec.png'
//     }
//   ],
//   'Turdus plumbeus': [
//     {
//       siteName: 'LU01',
//       projectName: 'Puerto Rico Island-Wide',
//       songType: 'Simple Call',
//       recordedAt: '2021-03-30T16:15:11.206Z',
//       timezone: 'America/Puerto_Rico',
//       redirectUrl: 'https://arbimon.rfcx.org/project/puerto-rico-island-wide/visualizer/rec/25132794',
//       mediaWavUrl: 'https://media-api.rfcx.org/internal/assets/streams/BpeZMsJr4UPO_t20210330T161511206Z.20210330T161513227Z_fwav.wav',
//       mediaSpecUrl: 'https://media-api.rfcx.org/internal/assets/streams/BpeZMsJr4UPO_t20210330T161511206Z.20210330T161513227Z_d512.512_mtrue_fspec.png'
//     },
//     {
//       siteName: 'LU04',
//       projectName: 'Puerto Rico Island-Wide',
//       songType: 'Common Song',
//       recordedAt: '2021-04-06T10:05:25.854Z',
//       timezone: 'America/Puerto_Rico',
//       redirectUrl: 'https://arbimon.rfcx.org/project/puerto-rico-island-wide/visualizer/rec/25154165',
//       mediaWavUrl: 'https://media-api.rfcx.org/internal/assets/streams/6ybRiQE8HGmd_t20210406T100525854Z.20210406T100528261Z_fwav.wav',
//       mediaSpecUrl: 'https://media-api.rfcx.org/internal/assets/streams/6ybRiQE8HGmd_t20210406T100525854Z.20210406T100528261Z_d512.512_mtrue_fspec.png'
//     }
//   ],
//   'Tyrannus caudifasciatus': [
//     {
//       siteName: 'BA13',
//       projectName: 'Puerto Rico Island-Wide',
//       songType: 'Common Song',
//       recordedAt: '2021-04-28T11:40:32.375Z',
//       timezone: 'America/Puerto_Rico',
//       redirectUrl: 'https://arbimon.rfcx.org/project/puerto-rico-island-wide/visualizer/rec/28202973',
//       mediaWavUrl: 'https://media-api.rfcx.org/internal/assets/streams/0dm1ht7aLUPX_t20210428T114032375Z.20210428T114035525Z_fwav.wav',
//       mediaSpecUrl: 'https://media-api.rfcx.org/internal/assets/streams/0dm1ht7aLUPX_t20210428T114032375Z.20210428T114035525Z_d512.512_mtrue_fspec.png'
//     }
//   ],
//   'Tyrannus dominicensis': [
//     {
//       siteName: 'CU24',
//       projectName: 'Puerto Rico Island-Wide',
//       songType: 'Common Song',
//       recordedAt: '2021-03-24T10:05:43.827Z',
//       timezone: 'America/Puerto_Rico',
//       redirectUrl: 'https://arbimon.rfcx.org/project/puerto-rico-island-wide/visualizer/rec/24602680',
//       mediaWavUrl: 'https://media-api.rfcx.org/internal/assets/streams/uNhkJLYFMAvb_t20210324T100543827Z.20210324T100545167Z_fwav.wav',
//       mediaSpecUrl: 'https://media-api.rfcx.org/internal/assets/streams/uNhkJLYFMAvb_t20210324T100543827Z.20210324T100545167Z_d512.512_mtrue_fspec.png'
//     }
//   ],
//   'Vireo altiloquus': [
//     {
//       siteName: 'PA02',
//       projectName: 'Puerto Rico Island-Wide',
//       songType: 'Common Song',
//       recordedAt: '2021-04-07T16:50:32.975Z',
//       timezone: 'America/Puerto_Rico',
//       redirectUrl: 'https://arbimon.rfcx.org/project/puerto-rico-island-wide/visualizer/rec/25562084',
//       mediaWavUrl: 'https://media-api.rfcx.org/internal/assets/streams/8EQWSVm4ig8h_t20210407T165032975Z.20210407T165034305Z_fwav.wav',
//       mediaSpecUrl: 'https://media-api.rfcx.org/internal/assets/streams/8EQWSVm4ig8h_t20210407T165032975Z.20210407T165034305Z_d512.512_mtrue_fspec.png'
//     }
//   ],
//   'Vireo latimeri': [
//     {
//       siteName: 'GUI08',
//       projectName: 'Puerto Rico Island-Wide',
//       songType: 'Common Song',
//       recordedAt: '2021-03-02T16:15:01.563Z',
//       timezone: 'America/Puerto_Rico',
//       redirectUrl: 'https://arbimon.rfcx.org/project/puerto-rico-island-wide/visualizer/rec/13948928',
//       mediaWavUrl: 'https://media-api.rfcx.org/internal/assets/streams/kTLndDBWryEZ_t20210302T161501563Z.20210302T161502853Z_fwav.wav',
//       mediaSpecUrl: 'https://media-api.rfcx.org/internal/assets/streams/kTLndDBWryEZ_t20210302T161501563Z.20210302T161502853Z_d512.512_mtrue_fspec.png'
//     }
//   ],
//   'Zenaida asiatica': [
//     {
//       siteName: 'RO37_NEW',
//       projectName: 'Puerto Rico Island-Wide',
//       songType: 'Common Song',
//       recordedAt: '2021-03-10T13:15:43.437Z',
//       timezone: 'America/Puerto_Rico',
//       redirectUrl: 'https://arbimon.rfcx.org/project/puerto-rico-island-wide/visualizer/rec/14108164',
//       mediaWavUrl: 'https://media-api.rfcx.org/internal/assets/streams/f082fnghvqrz_t20210310T131543437Z.20210310T131549558Z_fwav.wav',
//       mediaSpecUrl: 'https://media-api.rfcx.org/internal/assets/streams/f082fnghvqrz_t20210310T131543437Z.20210310T131549558Z_d512.512_mtrue_fspec.png'
//     }
//   ],
//   'Zenaida aurita': [
//     {
//       siteName: 'RI17_dupRI14',
//       projectName: 'Puerto Rico Island-Wide',
//       songType: 'Common Song',
//       recordedAt: '2021-03-17T10:35:52.668Z',
//       timezone: 'America/Puerto_Rico',
//       redirectUrl: 'https://arbimon.rfcx.org/project/puerto-rico-island-wide/visualizer/rec/24269783',
//       mediaWavUrl: 'https://media-api.rfcx.org/internal/assets/streams/QKD4SRSn4hTI_t20210317T103552668Z.20210317T103557309Z_fwav.wav',
//       mediaSpecUrl: 'https://media-api.rfcx.org/internal/assets/streams/QKD4SRSn4hTI_t20210317T103552668Z.20210317T103557309Z_d512.512_mtrue_fspec.png'
//     }
//   ]
// }
