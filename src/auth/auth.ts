import { App } from '@vue/runtime-dom'

import VueAuth, { RedirectCallback } from './vueAuth'

interface Auth0PluginOptions {
  onRedirectCallback: RedirectCallback
  domain: string
  clientId: string
  audiece?: string
  [key: string]: string | RedirectCallback | undefined
}

let instance: VueAuth

export const getInstance = (): VueAuth => instance

const DEFAULT_REDIRECT_CALLBACK = (appState: unknown): void =>
  window.history.replaceState({}, document.title, window.location.origin)

export function useAuth0 ({ onRedirectCallback = DEFAULT_REDIRECT_CALLBACK, redirectUri = window.location.origin }): VueAuth {
  if (instance != null) {
    return instance
  }

  instance = new VueAuth()

  void instance.init(onRedirectCallback, redirectUri)

  return instance
}

export const Auth0Plugin = {
  install (app: App, options: Auth0PluginOptions) {
    app.config.globalProperties.$auth = useAuth0(options)
  }
}
