import { CoreProjectNew } from './create-project-in-core'
import { ArbimonProject } from './get-desynced-projects'

export const mapProjectArbimonToCore = (ap: ArbimonProject): CoreProjectNew => ({
  name: ap.name,
  description: ap.description,
  is_public: !ap.is_private,
  external_id: ap.project_id
})
