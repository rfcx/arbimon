import { masterObjectiveTypes } from '@rfcx-bio/node-common/dao/master-data/project-objective'

// Choose an image based on the first objective or take the default image
export const getImageByObjectives = (objectives?: string[]): string => {
  const defaultImage = masterObjectiveTypes.Others.imageUrl
  if (objectives === undefined || objectives.length === 0) {
    return defaultImage
  }
  return Object.values(masterObjectiveTypes).find((o) => o.slug === objectives[0])?.imageUrl ?? defaultImage
}

/**
 * Resolve the image to render for a project, falling back to the objective-based
 * default when the project has no stored image (e.g. legacy projects that have
 * no profile row, or a profile row with an empty `image`). Without this, the UI
 * renders a blank placeholder box for such projects.
 *
 * `storedImage` is the raw value from `location_project_profile.image` (a
 * storage path, an absolute URL, a `static://` reference, or empty/undefined).
 */
export const resolveProjectImage = (storedImage: string | null | undefined, objectives?: string[]): string => {
  if (storedImage !== undefined && storedImage !== null && storedImage !== '') {
    return storedImage
  }
  return getImageByObjectives(objectives)
}
