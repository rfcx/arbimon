// TODO: Update after connect to /projects endpoint

/* eslint-disable camelcase */
export interface RawProjectListItem {
  id: string
  name: string
  is_public: boolean
  external_id: number
}
/* eslint-enable camelcase */

export interface ProjectListItem {
  id?: string
  name?: string
  isPublic?: boolean
  externalId?: number
}
