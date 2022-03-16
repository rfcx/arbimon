describe('load bio api', () => {
  it ('API is healthy - with 200 status',() => {
    const apiUrl = Cypress.env('api') + '/'
    cy.request(apiUrl).its('status').should('eq', 200)
  })
})