// TEMP - Please update this file in both `common` AND `api`

// Request
export interface DashboardRichnessParams {
  projectId: string
}

export const dashboardRichnessRoute = '/:projectId/dashboard-richness'

export const dashboardRichnessUrl = (params: DashboardRichnessParams): string =>
  `/${params.projectId}/dashboard-richness` // TODO: Generate automatically from dashboardRichnessRoute

// Response
export interface DashboardRichnessResponse {
  taxonClass: string
  speciesNo: string
}
