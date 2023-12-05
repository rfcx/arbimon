import { masterOjectiveTypes, objectiveTypes } from '@rfcx-bio/common/dao/master-data/project-objective'
import { type ProjectObjective } from '@rfcx-bio/common/dao/types'

export const getIndex = (length: number): number => {
  return length > 1 ? Math.floor(Math.random() * length) : 0
}

export const getImageByObjectives = (inputObjectives: string[]): string => {
  const index = getIndex(inputObjectives.length)
  const image = objectiveTypes.find((objective: ProjectObjective) => objective.slug === inputObjectives[index])?.imageUrl ?? masterOjectiveTypes.Others.imageUrl
  return image
}
