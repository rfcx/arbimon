/// <reference types="cypress" />

// This function is called when a project is opened or re-opened (e.g. due to
// the project's config changing)

import * as dotenv from 'dotenv'
dotenv.config()

/**
 * @type {Cypress.PluginConfig}
 */
export default (on: Cypress.PluginEvents, config: Cypress.PluginConfigOptions) => {
  // `on` is used to hook into various events Cypress emits
  // `config` is the resolved Cypress config
  config.env.api = process.env.VITE_BIO_API_BASE_URL
  return config
}
