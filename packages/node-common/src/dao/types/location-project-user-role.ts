export interface LocationProjectUserRole {
  locationProjectId: number
  userId: number
  // See arbimon role IDs
  roleId: number
  /** 0 for primary contact user in the selector.
   *  -1 for hiding the person from the stakeholder section.
   *  any positive number means he's shown on the stakeholders page (not primary contact)
   */
  ranking: number
  createdAt?: Date
  updatedAt?: Date
}
