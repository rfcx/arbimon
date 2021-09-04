import { NavigationGuardNext, RouteLocationNormalized } from 'vue-router'

import { VXServices } from '@/services'
import VueAuth from './vueAuth'

const DEFAULT_REDIRECT_CALLBACK = (appState: unknown): void =>
  window.history.replaceState({}, document.title, window.location.origin)

export default async (to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext): Promise<void> => {
  const storedUser = VXServices.User.user.get()
  const vueAuth = new VueAuth()

  await vueAuth.init(DEFAULT_REDIRECT_CALLBACK, window.location.origin)
  await VXServices.User.user.set(vueAuth.user)

  if (!storedUser) {
    return await vueAuth.loginWithRedirect({ appState: { targetUrl: to.fullPath } })
  }

  next()
}
