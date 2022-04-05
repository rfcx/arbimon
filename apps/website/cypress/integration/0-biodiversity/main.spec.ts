// Introduction to testing:
// https://docs.cypress.io/guides/getting-started/testing-your-app

import 'cypress-wait-until'

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
