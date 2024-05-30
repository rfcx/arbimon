import { masterObjectiveTypes } from '@rfcx-bio/node-common/dao/master-data/project-objective'

// Choose an image based on the first objective or take the default image
export const getImageByObjectives = (objectives?: string[]): string => {
  const defaultImage = masterObjectiveTypes.Others.imageUrl
  if (objectives === undefined || objectives.length === 0) {
    return defaultImage
  }
  return Object.values(masterObjectiveTypes).find((o) => o.slug === objectives[0])?.imageUrl ?? defaultImage
}
