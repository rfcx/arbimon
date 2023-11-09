import axios, { type AxiosRequestConfig, type AxiosResponse } from 'axios'
import { load } from 'cheerio'

import { getSequentially } from '@rfcx-bio/utils/async'
import { toCsv } from '@rfcx-bio/utils/file'

import { logError } from '../_services/axios'

interface Icon {
  url: string
  width: number
  height: number
  format: string
  bytes: number
  error: null
  sha1sum: string
}

interface IconResponse {
  url: string
  icons: Icon[]
}

interface Organization {
  name: string
  domain: string
  url: string
}

const organizationDomains = ['163.com', '24acoustics.co.uk', '5thworld.farm', 'abv.bg', 'accenture.com', 'adrianibanez.info', 'africanparks.org', 'alamsehatlestari.org', 'alumni.tsukuba.ac.jp', 'alumni.unca.edu', 'alumno.usac.edu.gt', 'andersonep.com.au', 'appstate.edu', 'aquasis.org', 'arborday.org', 'arisalab.org', 'arocha.org', 'asessc.net', 'ashoka.edu.in', 'aspiration.com', 'astron.com.au', 'audubonpanama.org', 'bakerconsultants.co.uk', 'berkeley.edu', 'bg', 'bigpond.com', 'bio.its.ac.id', 'bio.uni-freiburg.de', 'bioap.com.co', 'biodiversaenlinea.com', 'biodiversaenlinea.org', 'biology.ox.ac.uk', 'biophonia.fr', 'birdlife.org.au', 'birdscanada.org', 'blueyonder.co.uk', 'boku.ac.at', 'bournemouth.ac.uk', 'bpn.com.pl', 'bristol.ac.uk', 'bu.edu', 'buffalo.edu', 'burung.org', 'bushheritage.org.au', 'calidris.org.co', 'casadafloresta.com.br', 'cataruben.org', 'cdu.edu.au', 'ceaconsulting.com', 'cefe.cnrs.fr', 'cegep-rimouski.qc.ca', 'ceh.ac.uk', 'chancesfornature.org', 'ciencias.unam.mx', 'cincinnatizoo.org', 'cnr.it', 'college.harvard.edu', 'coloradomesa.edu', 'comahue-conicet.gob.ar', 'conaf.cl', 'conservation.org', 'conservationalpha.com', 'conservewildlifenj.org', 'cornell.edu', 'correounivalle.edu.co', 'cpie-bouclesdelamarne.fr', 'crea-panama.org', 'cs.ox.ac.uk', 'cuas.at', 'deakin.edu.au', 'delawareestuary.org', 'delwp.vic.gov.au', 'developmentseed.org', 'dgfc.life', 'dickinsonstate.edu', 'digital-ecology.co.uk', 'dkk.net.au', 'duke.edu', 'dwecology.co.uk', 'e2mconsulting.com.au', 'earthacre.com', 'earthology.info', 'eclipsesoundscapes.org', 'ed.ac.uk', 'edu.unito.it', 'edu.xunta.es', 'endonatureartedu.pl', 'environment.nsw.gov.au', 'environmental.systems', 'ers.org', 'espigall.cat', 'est.ikiam.edu.ec', 'estudante.ifgoiano.edu.br', 'estudante.ufscar.br', 'estudiante.uam.es', 'eticaenlosbosques.cl', 'euagm.edu', 'evergreen.edu', 'fairatmos.com', 'famnit.upr.si', 'fastfm', 'fau.de', 'fca.unju.edu.ar', 'fcdarwin.org.ec', 'fh-kaernten.at', 'fieldmuseum.org', 'forclimate.ai', 'fougeroux.com', 'fpcr.co.uk', 'free.fr', 'freenet.de', 'freiland.at', 'friendscentral.org', 'frontierlabs.com.au', 'fundacioncalima.org', 'fws.gov', 'g.rit.edu', 'gainforest.net', 'gecinc.com', 'gepog.org', 'ghd.com', 'glasgow.ac.uk', 'gmu.edu', 'gmx.de', 'gmx.net', 'gnhabitat.org', 'gradcenter.cuny.edu', 'greatpeninsula.org', 'greencityla.org', 'greensboroscience.org', 'griffithuni.edu.au', 'h-da.de', 'habitat-nature.com', 'hawk.iit.edu', 'helsinki.fi', 'herzessenz.com', 'holtpalmer.us', 'hombreyterritorio.org', 'hswt.de', 'humboldt.org.co', 'hvhl.nl', 'icloud.com', 'icmc.usp.br', 'igc-chemnitz.de', 'ign.ku.dk', 'iisermohali.ac.in', 'iisertirupati.ac.in', 'inecol.mx', 'institutoboitata.org', 'ird.fr', 'iscparis.com', 'itaipu.gov.py', 'iup.edu', 'janegoodall.org', 'jaseroque.com', 'javeriana.edu.co', 'jocotoco.org', 'julius-kuehn.de', 'juntadeandalucia.es', 'kcl.ac.uk', 'khmerio.com', 'kiwiclan.com', 'Knights.ucf.edu', 'knlt.org', 'knu.ac.kr', 'kuleuven.be', 'kuslits.hu', 'lamave.org', 'landler.io', 'lbv.de', 'libero.it', 'libertysurf.fr', 'littlefireface.org', 'live.ca', 'live.co.uk', 'lls.nsw.gov.au', 'lu.lv', 'luckmonk.com', 'lut.fi', 'mailo.fr', 'mails.ucas.ac.cn', 'maine.edu', 'me.com', 'miami.edu', 'mila.quebec', 'mmu.ac.uk', 'mnhn.fr', 'moethennessy.com', 'msn.com', 'museum.vic.gov.au', 'my.jcu.edu.au', 'myune.edu.au', 'napier.ac.uk', 'naver.com', 'nccma.vic.gov.au', 'ncsu.edu', 'ncwildlife.org', 'ndow.org', 'ndus.edu', 'neotropicalscience.com', 'ngs.org', 'njit.edu', 'nmt.edu', 'northvillecsd.org', 'northwestsoundscapes.com', 'nottingham.edu.my', 'npneusiedlersee.at', 'nps.gov', 'nus.edu.sg', 'nust.na', 'oceanusconservation.org', 'ofb.gouv.fr', 'oshensail.com', 'ou.edu', 'pablosanz.info', 'paisatgesvius.org', 'paralanaturaleza.org', 'pb.edu.pl', 'pdx.edu', 'peoplecarbon.org', 'pima.gov', 'pmb.ox.ac.uk', 'pointblue.org', 'posgrad.inpa.gov.br', 'posgrado.ecologia.edu.mx', 'proaves.org', 'pronatura-ppy.org.mx', 'proton.me', 'protoncom', 'pulsaqua.nl', 'qq.com', 'rfcx.org', 'rice.edu', 'roatanwildlife.org', 'robotastic.com', 'rocketcom', 'samhertzsound.com', 'sandiegozoo.org', 'saveland.org', 'schoodicinstitute.org', 'seattle.gov', 'senecazoo.org', 'seor.fr', 'seznam.cz', 'sfr.fr', 'shanshui.org', 'si.edu', 'siu.edu', 'slu.se', 'songbirding.com', 'soqtapata.com', 'soton.ac.uk', 'sovon.nl', 'stud.slu.se', 'sun.ac.za', 'sust.edu', 'swansea.ac.uk', 'synature.ch', 't-online.de', 'tamucc.edu', 'tamuk.edu', 'tau.ac.il', 'terrasylvestris.org', 'thelandbankinggroup.com', 'tieroekologie.eu', 'tiscali.it', 'tmalliance.org', 'tnc.org', 'trees.org', 'tropicalstudies.org', 'troy.edu', 'ttu.edu', 'tudelft.nl', 'tum.de', 'turnerfamilyfoundation.com.au', 'uc.pt', 'ucdavis.edu', 'ucl.ac.uk', 'ucsd.edu', 'udea.edu.co', 'udec.cl', 'ufl.edu', 'ufms.br', 'ufpe.br', 'ufrn.edu.br', 'ufscar.br', 'ug.uchile.cl', 'uga.edu', 'ugm.ac.id', 'uliege.be', 'unal.edu.co', 'unca.edu', 'uncg.edu', 'unco.edu', 'uned.ac.cr', 'uned.cr', 'unesp.br', 'unh.edu', 'uni-muenster.de', 'uni.lu', 'uniandes.edu.co', 'unillanos.edu.co', 'unimelb.edu.au', 'uninorte.edu.co', 'unipampa.edu.br', 'unive.it', 'unmsm.edu.pe', 'unsw.edu.au', 'up.ac.za', 'upch.pe', 'upr.edu', 'uptc.edu.co', 'uq.net.au', 'uqtr.ca', 'usc.edu.au', 'usda.gov', 'usgs.gov', 'usp.br', 'ustc.edu.cn', 'usys.ethz.ch', 'utb.cz', 'utn.edu.ec', 'utoronto.ca', 'uvm.edu', 'uw.edu', 'uwe.ac.uk', 'uwindsor.ca', 'uwplatt.edu', 'veritree.com', 'verizon.net', 'vetagro-sup.fr', 'vogelwarte.ch', 'vtecostudies.org', 'wanadoo.fr', 'wcs.org', 'wetlandsinstitute.org', 'wildersensing.com', 'wildeyes.ca', 'wildlife.ca.gov', 'wildlifeimagingsystems.com', 'wildlifeinsights.org', 'wildresearch.com.au', 'wisc.edu', 'wur.nl', 'wwf.id', 'wwf.it', 'wwfoasi.it', 'wwfus.org', 'wyo.gov', 'ycom', 'york.ac.uk']

const getPreferredIcon = (icons: Icon[]): string => {
  const preferredFormats = ['png', 'jpg', 'jpeg']
  const icon = icons.find(i => preferredFormats.includes(i.format))
  return icon ? icon.url : ''
}

const mapResult = (domain: string) => (response: AxiosResponse<IconResponse>): Organization | undefined => {
  return {
    domain,
    name: domain.split('.')[0],
    url: getPreferredIcon(response.data.icons)
  }
}

async function getLogo (domain: string): Promise<Organization | undefined> {
  const endpoint: AxiosRequestConfig = {
    method: 'GET',
    url: `https://besticon-demo.herokuapp.com/allicons.json?url=www.${domain}`
  }

  return await axios.request<IconResponse>(endpoint)
    .then(mapResult(domain))
    .catch(logError('getIucnSpeciesNarrative', domain, '(no data)'))
}

async function getName (domain: string): Promise<string> {
  try {
    const res = await axios.get(`https://www.${domain}`)
    const $ = load(res.data)
    return $('title').text() ?? ''
  } catch (e) {
    return ''
  }
}

let startIndex = 0
const patialSize = 10

while (startIndex < organizationDomains.length) {
  const endIndex = startIndex + patialSize
  const patial = organizationDomains.slice(startIndex, endIndex)
  const logoRecords = await getSequentially(patial, getLogo)
  const nameRecords = await getSequentially(patial, getName)

  const organizations = patial.map(domain => {
    const logoData = logoRecords[domain]
    const nameData = nameRecords[domain]
    return {
      domain,
      name: nameData,
      url: logoData?.url ?? ''
    }
  })

  const csv = await toCsv(organizations)
  console.info(csv)

  startIndex = endIndex
}
