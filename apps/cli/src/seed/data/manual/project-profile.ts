import { ProjectProfile } from '@rfcx-bio/common/dao/types'

const profileBci: Omit<ProjectProfile, 'projectId'> = {
  readme: '',
  summary: 'This is a project of Marconi Campos-Cerqueira. The objective is to record anurans, birds, and bats during the transition between the dry and wet seasons.'
}

const profileFake: Omit<ProjectProfile, 'projectId'> = {
  readme: 'This is the readme for our test project',
  summary: 'This is a test project!'
}

const profileMadre: Omit<ProjectProfile, 'projectId'> = {
  readme: '',
  summary: 'In this project, we will use recordings from the Guardians to create training data for a western Amazon CNN'
}

const profilePuertoRico: Omit<ProjectProfile, 'projectId'> = {
  readme: `
## Background

One of the greatest challenges of ecology is the prediction of species diversity. Traditional methods to assess species diversity often focus on direct observations of a small range of taxonomic groups and on limited spatial and temporal scales. In contrast, passive acoustic monitoring (PAM) can greatly improve our ability to predict species diversity because we can detect the presence of a wide range of animal taxa (e.g., anurans, birds, insects and mammals). In addition, our current methods for mapping species distributions are insufficient. The ability to deploy multiple acoustic sensors across landscapes in a short period of time enables simultaneous recording, which allows researchers to accurately map species distributions. Furthermore, acoustic data collected over a large spatial scale can be used to answer broader questions regarding the effects of environmental change on species henology and distribution.

Given the high number of endemic species in Puerto Rico and the high vulnerability of these species to natural (e.g., hurricanes) and human impacts (e.g., climate change), it is essential that researchers and stakeholders take advantage of novel methods to accurately estimate the population status and species distributions of Puerto Rican fauna. Moreover, obtaining current baseline information on the distribution of Species of Greatest Conservation Need (SGCN) that have been identified in Puerto Rico State Wildlife Action Plan (SWAP) is a critical step for the development of proactive climate adaptation strategies. In addition, monitoring of SGCN is one of the Eight Critical Elements identified in the Wildlife ction Plans for each state or territory.

## Need

_Create a population baseline for bird and anuran species distributions across Puerto Rico_

Puerto Rico has a diverse bird and anuran community, including many endemic, endangered and data deficient species. While species lists exist for these groups and the distributions of a few species have been studied, state and federal agencies do not have species distribution maps for most species and the population status of many species are unknown. These baseline maps are urgently needed given the rapidly changing environment in Puerto Rico, with urban expansion in some areas, forest recovery in others, and climate change affecting whole island.

Puerto Rico has a long history of scientific research, but most of this research has been conducted in El Yunque and little is known about species distributions and population status in the many other habitats around the island. For example, as recently as 2005 a new species of coqui was discovered in Sabana Seca (Rios-López and Thomas, 2007). To conduct effective management and conservation plans, managers and scientists need a complete picture of the distributions of the species they are working with. Fortunately, technological advances (e.g., acoustic monitoring and cloud computing) have made it possible to do extensive and frequent monitoring of multiple species and provide results in near real-time at a easonable cost.

## Purpose

The purpose of this project is to create detailed species distribution maps for birds and anurans across Puerto Rico and its associated islands. Emphasis will be given on the species dentified as of Greatest Conservation Need (Puerto Rico SWAP 2015).

## Funding

This projected had been funded by [PR DRNA](https://www.drna.pr.gov) (2021-000060) and [USFWS](https://www.fws.gov) (F20AC11127)

## Stakeholders

- [Departamento de Recursos Naturales y Ambientales de Puerto Rico](https://www.drna.pr.gov)
- [U.S. Fish and Wildlife Service](https://www.fws.gov)
- [Para la Naturaleza](https://www.paralanaturaleza.org/en/)
- [Rainforest Connection (marconi@rfcx.org)](https://rfcx.org/)
  `,
  summary: 'Acoustic monitoring and occupancy maps for bird and anuran species across Puerto Rico: A baseline for SWAP and other agencies’ conservation and planning activities'
}

export const mockProjectProfilesBySlug: Record<string, Omit<ProjectProfile, 'projectId'>> = {
  'bci-panama-2018': profileBci,
  'fake-arbimon-project-for-bio': profileFake,
  'puerto-rico': profilePuertoRico,
  'puerto-rico-island-wide': profilePuertoRico,
  'rfcx-guardians-madre-de-dios-peru': profileMadre
}
