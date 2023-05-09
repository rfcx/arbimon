import { describe, expect, test, vi } from 'vitest'

import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'

import { getSequelize } from '@/db/connections'
import { getIucnSpecies } from '@/sync/_refactor/input-iucn/iucn-species'
import { getIucnSpeciesNarrative } from '@/sync/_refactor/input-iucn/iucn-species-narrative'
import { syncIucnSpeciesInfo } from './iucn'

vi.mock('@/sync/_refactor/input-iucn/iucn-species', () => {
  return {
    getIucnSpecies: vi.fn()
  }
})
vi.mock('@/sync/_refactor/input-iucn/iucn-species-narrative', () => {
  return {
    getIucnSpeciesNarrative: vi.fn()
  }
})
const biodiversitySequelize = getSequelize()

describe('species-info > iucn > syncIucnSpeciesInfo', () => {
  const VALID_SPECIES = [
    {
      id: 2,
      risk_rating_iucn_id: 200,
      scientific_name: 'Actitis macularius'
    },
    {
      id: 3,
      risk_rating_iucn_id: 500,
      scientific_name: 'Agelaius xanthomus'
    }
  ]

  const RISK_RATING = [
    {
      id: -1,
      code: 'NE'
    },
    {
      id: 200,
      code: 'LC'
    },
    {
      id: 300,
      code: 'NT'
    },
    {
      id: 500,
      code: 'EN'
    },
    {
      id: 600,
      code: 'CR'
    }
  ]

  const DEFAULT_IUCN_SPECIES = {
    'Actitis macularius': {
      taxonid: 22693277,
      scientific_name: 'Actitis macularius',
      kingdom: 'ANIMALIA',
      phylum: 'CHORDATA',
      class: 'AVES',
      order: 'CHARADRIIFORMES',
      family: 'SCOLOPACIDAE',
      genus: 'Actitis',
      main_common_name: 'Spotted Sandpiper',
      authority: 'Linnaeus, 1766',
      published_year: 2016,
      assessment_date: '2016-10-01',
      category: 'LC',
      criteria: null,
      population_trend: 'Decreasing',
      marine_system: true,
      freshwater_system: true,
      terrestrial_system: true,
      assessor: 'BirdLife International',
      reviewer: 'Butchart, S.H.M. & Symes, A.',
      aoo_km2: null,
      eoo_km2: '23400000',
      elevation_upper: 2000,
      elevation_lower: null,
      depth_upper: null,
      depth_lower: null,
      errata_flag: null,
      errata_reason: null,
      amended_flag: null,
      amended_reason: null,
      sourceUrl: 'https://apiv3.iucnredlist.org/api/v3/website/Actitis%20macularius',
      sourceCitation: 'IUCN 2021. IUCN Red List of Threatened Species. (Version 2021-3)'
    },
    'Agelaius xanthomus': {
      taxonid: 22724209,
      scientific_name: 'Agelaius xanthomus',
      kingdom: 'ANIMALIA',
      phylum: 'CHORDATA',
      class: 'AVES',
      order: 'PASSERIFORMES',
      family: 'ICTERIDAE',
      genus: 'Agelaius',
      main_common_name: 'Yellow-shouldered Blackbird',
      authority: '(Sclater, 1862)',
      published_year: 2020,
      assessment_date: '2020-08-27',
      category: 'EN',
      criteria: 'B2ab(iii,v)',
      population_trend: 'Decreasing',
      marine_system: false,
      freshwater_system: false,
      terrestrial_system: true,
      assessor: 'BirdLife International',
      reviewer: 'Hermes, C.',
      aoo_km2: '260',
      eoo_km2: '9000',
      elevation_upper: null,
      elevation_lower: null,
      depth_upper: null,
      depth_lower: null,
      errata_flag: null,
      errata_reason: null,
      amended_flag: null,
      amended_reason: null,
      sourceUrl: 'https://apiv3.iucnredlist.org/api/v3/website/Agelaius%20xanthomus',
      sourceCitation: 'IUCN 2021. IUCN Red List of Threatened Species. (Version 2021-3)'
    }
  }

  const DEFAULT_IUCN_SPECIES_NARRATIVE = {
    'Actitis macularius': {
      species_id: 22693277,
      taxonomicnotes: null,
      rationale: 'This species has an extremely large range, and hence does not approach the thresholds for Vulnerable under the range size criterion (Extent of Occurrence &lt;20,000 km2 combined with a declining or fluctuating range size, habitat extent/quality, or population size and a small number of locations or severe fragmentation). Despite the fact that the population trend appears to be decreasing, the decline is not believed to be sufficiently rapid to approach the thresholds for Vulnerable under the population trend criterion (&gt;30% decline over ten years or three generations). The population size is very large, and hence does not approach the thresholds for Vulnerable under the population size criterion (&lt;10,000 mature individuals with a continuing decline estimated to be &gt;10% in ten years or three generations, or with a specified population structure). For these reasons the species is evaluated as Least Concern.',
      geographicrange: null,
      population: null,
      populationtrend: 'decreasing',
      habitat: null,
      threats: null,
      conservationmeasures: null,
      usetrade: null,
      sourceUrl: 'https://apiv3.iucnredlist.org/api/v3/website/Actitis%20macularius',
      sourceCitation: 'IUCN 2021. IUCN Red List of Threatened Species. (Version 2021-3)'
    },
    'Agelaius xanthomus': {
      species_id: 22724209,
      taxonomicnotes: null,
      rationale: 'This species has a very small range, and is predicted to undergo future declines due to ongoing threats. As a result, the species is listed as Endangered.<p></p>',
      geographicrange: "<em>Agelaius xanthomus</em>&#160;is endemic to&#160;<strong>Puerto Rico (to USA)</strong>&#160;and the Mona and Monito Islands. Whilst formerly widespread on Puerto Rico, it is now primarily limited to four areas: Mona and Monito islands (race&#160;<em>monensis</em>)&#160;and three populations in eastern (Ceiba), southern (Salinas), and southwestern&#160;(Cabo Rojo and Lajas)&#160;Puerto Rico (USFWS 2011). It is also found infrequently during the non-breeding season in the subtropical wet forests of the Lares and Ciales municipalities in central Puerto Rico (USFWS 2011, J. Martínez <em>in litt</em>. 2020). The largest population is found in southwestern Puerto Rico. The south-west population declined by c.80% in 1975-1981 to a low of 300 individuals in 1982, but pre-reproductive season roost counts in 1985-1995 showed an average annual increase of 14% (USFWS 1996). In early 1998, the total population was estimated at 1,250 individuals (Jaramillo and Burke 1999)<strong></strong><strong></strong>. Surveys in 2007 found c.994 individuals in southwestern Puerto Rico (municipalities of Cabo Rojo and Lajas), an increase from 2004 (759 individuals). However, the population then declined by more than 50%, leaving fewer than 400 individuals by August 2012 (Miller <em>et al., </em>2016). Subsequently, the population was estimated through the post-breeding survey in 2012 at more than 650 individuals (Miller <em>et al. </em>2016). Post-breeding counts appear to exhibit strong year-on-year variation however, with counts at Cabo Rojo, southwestern Puerto Rico numbering just 424 individuals in November 2015 but 1056 individuals in September 2016 (USFWS 2018). It is thought that populations in the southwest typically range annually between 400-1,000 individuals (USWFS 2018, 2019, J.&#160;Martínez <em>in litt</em>. 2020). In Salinas (southeastern Puerto Rico), 113 individuals were observed during the post-breeding census of 2005, a slight increase from 2004 (97 individuals), however only 82 individuals were highlighted during the post-breeding survey of November 2012 (USFWS 2011, 2018). The Mona Island population further numbered 155 individuals in the post-breeding period of October 2012 and is thought to average 150 individuals (USFWS 2018, 2019). No systematic monitoring of the eastern population has been undertaken since 2004 however, a rapid assessment in 2018 suggested that there are at least 8-10 individuals in this population (USFWS unpubl. data). It would appear that Hurricane Maria (2017), whilst damaging significant available habitat, did not result in a population decline of this species in Cabo Rojo, the species's stronghold, as rapid counts in Pitahaya and&#160;Bahía Sucia following the hurricane illustrated typical numbers of birds, most likely due to sufficient habitat remaining intact (USWS 2018, 2019, I. Liu <em>in litt</em>. 2020). Population counts have not yet been repeated in Mona Island or Salinas to determine the species's status in these locations following Hurricane Maria.<p></p>",
      population: 'In early 1998, the total population was estimated at 1,250 individuals (Jaramillo and Burke 1999), which equates to 833 mature individuals, hence it was placed in the band 250-999 mature individuals to reflect the uncertainty and fluctuations seen in population surveys. Whilst post-breeding population estimates have been carried out for individual subpopulations in the years since, inconsistencies in the timing of surveys, some subpopulations remaining largely unsurveyed and strong interannual fluctuations within subpopulations makes the generation of a new, total population estimate difficult.&#160;The latest estimates suggest approximately 400-1,000 individuals in the southwest population, ~150 individuals on Mona Island, 80-120 individuals in Salinas and at least 8-10 individuals in the eastern population (USFWS 2011, 2018, 2019, unpubl. data). This totals ~638-1,280 individuals, which equates to ~425-853 mature individuals. This estimate falls within the same range, 250-999 mature individuals, hence the population estimate is retained in this band.',
      populationtrend: 'decreasing',
      habitat: "The Yellow-shouldered Blackbird occupies a variety of habitats, all typically along the coast where it is most common (Jaramillo and Burke 1999). Such habitats include: mud flats, salt flats, offshore red mangroves&#160;(<em>Rhizophora mangle</em>) cays, black mangrove (<em>Avicennia germinans</em>) forests, lowland dry coastal pastures, suburban areas (including buildings), coconut (<em>Cocos nucifera</em>) plantations, and coastal cliffs (Skutch 1996, Lewis <em>et al</em>. 1999, Falcon <em>et al</em>. 2000, USFWS 2018).&#160;The species was once common in coastal forests, however during the early 20th century, the majority of Puerto Rico's coastal forests were replaced by sugar cane plantations, and latterly housing or livestock pasture (USFWS 2011, 2018, J.&#160;Martínez <em>in litt</em>. 2020). Many birds now breed on offshore cays (Skutch 1996)<strong></strong>. Whilst non-migratory, some individuals of the main island population are known to move inland to inhabit subtropical wet forest during the non-breeding season to forage (USFWS 2011). Whilst typically an arboreal insectivore, the species also forages terrestrially, consuming arachnids, small molluscs, fruits, seeds and nectar from various plant species (Skutch 1996,&#160;Raffaele <em>et al</em>. 1998, Jaramillo and Burke 1999, USFWS 2011); it has also been evidenced to consume exposed or discarded human food and livestock feed (USFWS 2018). Birds gather at communal feeding-sites, with large flocks forming during the non-breeding season (Jaramillo and Burke 1999)<strong></strong><strong></strong>. Nests are often built low in mangrove trees, or in large deciduous trees in pastures near to mangroves (Skutch 1996)<strong></strong>, with several nests being built in close proximity (Jaramillo and Burke 1999)<strong></strong><strong></strong>. On Mona Island, nests are placed in crevices or on ledges on high, vertical sea-cliffs (Skutch 1996)<strong></strong>. Three clutches are usually laid per year (Skutch 1996)<strong></strong>, and the breeding season is May-September.<p></p>",
      threats: 'Historically, brood-parasitism by Shiny Cowbird <em>Molothrus bonariensis</em> has greatly reduced numbers and resulted in most birds breeding on offshore cays (Medina-Miranda <em>et al</em>. 2013, USFWS 2018). Significant reductions in cowbird parasitism have been experienced after a cowbird control program was established in 1982, however parasitism rates remain high in non-managed areas (Reitsma 1998, USFWS 2011, 2018). Additional threats are competition for nesting areas by Caribbean Martin (<em>Progne dominicensis</em>), nest-predation by the Pearly-eyed Thrasher (<em>Margarops fuscatus</em>) and elevated mortality by introduced carnivores such as Indian Mongoose (<em>Herpestes </em><span style="font-style: italic;">auropunctatus</span>). Nest infestation by two species of blood-feeding mites (<em>Ornithonyssus bursa</em> and <em>Androlaelaps casalis</em>) may lead to nest abandonment by adults and premature nest desertion by young birds (USFWS 1996). Lice (<em>Philopterus agelaii</em>, <em>Machaerilaemus</em> <em>sp.</em>, and <em>Myrsidea</em> <em>sp.</em>) may also affect nesting birds, particularly those in cavity (covered) nests and re-used nests from the previous breeding event (Cruz-Burgos <em>et al</em>. 1997).&#160;<br/><br/>Another major ongoing threat to the species is the modification and destruction of mariquita feeding, roosting, and nesting habitat through residential and tourist development, and agriculture (USFWS 2011). Increased human-related activities in areas utilised by Yellow-shouldered Blackbird also result in increased waste in such areas which is of considerable negative influence, both throughout attracting predators such as feral cats, dogs and rats, and also by changing the diet of individuals whom eat accessible foods instead of searching and foraging in natural feeding sites (USFWS 2018, J. Martínez <em>in litt</em>. 2020). Increased disturbance by recreational boaters and boat-tour operators are also of considerable detrimental influence (USFWS 2011, 2018). Boat tour operations watching wading birds at night are considered responsible for the species abandoning a major roosting area&#160;at La Parguera as the spotlights, although likely focused on other species such as egrets and night herons, disturbed the species which roosts in the same area (Medina-Miranda <em>et al</em>. 2013).<br/><br/>The species has a low genetic diversity, which may weaken its long-term ability to respond to environmental change (Liu 2015), particularly as there is evidenced to be no contemporary gene flow between the populations of Mona Island and the large populations of southwest Puerto Rico (Liu <em>et al</em>. 2018). In the aftermath of Hurricane Maria (2017), it is clear that an increased frequency and intensity of Atlantic hurricanes may have an adverse impact on this species as the climate continues to warm. Following Maria, it was clear that throughout Cabo Rojo, there was severe damage to available habitat, particularly in the black mangrove that surrounds artificial nests, which exposes the fledglings and adults to increased predation whilst potentially limiting available food sources. Despite this loss of habitat, particularly nesting palms, considerable habitat remained and it is thought that populations persisted successfully as a result, providing hope for survival under future intense hurricane scenarios (USFWS 2018,&#160;I. Liu <em>in litt</em>. 2020).',
      conservationmeasures: '<strong>Conservation Actions Underway</strong><br/>A programme installing artificial nests, monitoring reproduction and controlling populations of <em>Molothrus bonariensis</em>, rats and nest-mites has operated since 1982 (USFWS 1996)<strong><sup></sup></strong>. The Boquerón Commonwealth Forest is a stronghold for the species on the mainland (Jaramillo and Burke 1999)<strong><sup></sup></strong>. In 2006 and 2007, approximately 4,006 acres of wetland and upland habitats at the Roosevelt Roads Naval Station&#160;were protected through land transfer agreement for conservation, as part of the critical habitat for the Yellow-shouldered Blackbird (USFWS 2011). The&#160;Puerto Rico Department of Natural Environmental Resources&#160;(PRDNER) undertakes successful trapping and egg removal schemes for shiny cowbirds and as a result, parasitism by the species has declined from 100% in 1982 to &lt;3% by 1996-1999 (Miller <em>et al</em>. 2016, USFWS 2018); Hurricane Maria temporarily disrupted such measures however, effective controls were back in place by January 2018 (USFWS 2018). Recent evidence has highlighted that Cowbird egg removal from Yellow-shouldered Blackbird nests is the most effective control measure, considerably more so than direct cowbird trapping (Miller <em>et al</em>. 2016).<p></p><strong>Conservation Actions Proposed</strong><br/>Conduct post-hurricane assessments of all&#160;populations and habitat in Puerto Rico and Mona Island to determine their statues and improve survey methodology to obtain accurate estimates of&#160;<em>A. xanthomus</em>&#160;population size (USFWS 2018). Continue to protect and manage the species and its habitat, including the provision of artificial nests and control of Shiny Cowbirds (USFWS 1996)<strong></strong><strong></strong>. Continue attempts to raise reproductive success to the targeted 0.96, particularly through increased fledging success and post-fledging survival (USFWS 2018, I. Liu <em>in litt</em>. 2020); monitor nesting activity to determine nest success and predation, and fledgling survival in order to meet such targets (USFWS 2018). Designate natural critical habitat for the species (PRDNER 2009). Monitor the success of artificial nests (USFWS 1996, 2019) and possibly redesign their structure to reduce predation of nestlings and prevent premature fledging (USFWS 2018). Integrate the conservation of this species with existing education schemes (USFWS 1996)<strong></strong><strong></strong>. Further investigate possibility of translocating individuals between Mona Island and Puerto Rico to enhance genetic diversity, although initial investigations suggest this would not be an effective management action (Liu <em>et al</em>. 2018). Recovery efforts should focus on conservation of extant&#160;genetic diversity (through increases in productivity and individual population sizes) and the establishment of additional populations in historically occupied or other suitable habitat (USFWS 2019). Liu (2015) suggests that ultimately achieving effective population size for this species may be impossible and that the conservation objective should be to prevent further declines in effective population size. Thus, due to the current small size of the individual disjunct populations, attention should be given to maintaining current genetic diversity and evolutionary potential (Liu 2015, USFWS 2018, 2019). Survey the Salinas population to better understand anti-parasitic behaviour seen at the site (USFWS 2018).&#160;<p></p>',
      usetrade: null,
      sourceUrl: 'https://apiv3.iucnredlist.org/api/v3/website/Agelaius%20xanthomus',
      sourceCitation: 'IUCN 2021. IUCN Red List of Threatened Species. (Version 2021-3)'
    }
  }

  test('succeeds for valid species data', async () => {
    // Arrange
    const speciesIds = VALID_SPECIES.map(species => species.id)
    const speciesRicks = VALID_SPECIES.map(species => species.risk_rating_iucn_id)
    const speciesNameToId = Object.fromEntries(VALID_SPECIES.map(s => [s.scientific_name, { id: s.id, risk_rating_iucn_id: s.risk_rating_iucn_id }]))
    const iucnCodeToId = Object.fromEntries(RISK_RATING.map(r => [r.code, r.id]))
    // Mock services
    const longCredit1 = 'x'.repeat(1024);
    (getIucnSpecies as any).mockResolvedValueOnce({ ...DEFAULT_IUCN_SPECIES, credit: longCredit1 })
    const longCredit2 = 'x'.repeat(1024);
    (getIucnSpeciesNarrative as any).mockResolvedValueOnce({ ...DEFAULT_IUCN_SPECIES_NARRATIVE, credit: longCredit2 })

    // Act
    await syncIucnSpeciesInfo(biodiversitySequelize, speciesNameToId, iucnCodeToId).catch(err => { console.error(err.message) })
    const species = await ModelRepository.getInstance(biodiversitySequelize).TaxonSpeciesIucn.findAll({ where: { taxonSpeciesId: speciesIds } })

    // Assert
    species.forEach(actual => { expect(speciesRicks).includes(actual.riskRatingIucnId) })
  })
})
