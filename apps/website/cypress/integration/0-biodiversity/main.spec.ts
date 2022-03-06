// Introduction to testing:
// https://docs.cypress.io/guides/getting-started/testing-your-app

import 'cypress-wait-until'

describe('load bio api', () => {
  it ('API is healthy - with 200 status',() => {
    const apiUrl = Cypress.env('api') + '/'
    cy.request(apiUrl).its('status').should('eq', 200)
  })
})

describe('load website', () => {
  beforeEach(() => {
    cy.visit('/')
    cy.waitUntil(() => Cypress.$('#preload').length === 0)
  })

  it('loads', () => {})

  it('has sign in button', () => {
    cy.get('.btn.btn-primary').first().contains('Sign In')
  })
})
