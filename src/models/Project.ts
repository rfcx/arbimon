// TODO: Update after connect to /projects endpoint

export interface RawProjectListItem {
  id: string
  name: string
  is_public: boolean
  external_id: number
}

export interface ProjectListItem {
  id?: string
  name?: string
  isPublic?: boolean
  externalId?: number
}
