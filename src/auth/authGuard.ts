import { NavigationGuardNext, RouteLocationNormalized } from 'vue-router'

import { getInstance } from './auth'

export default (to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext): void => {
  const authService = getInstance()

  const verify = (): void => {
    if (authService.isAuth0Authenticated) {
      return next()
    }

    void authService.loginWithRedirect({ appState: { targetUrl: to.fullPath } })
  }

  if (!authService.isLoading) {
    return verify()
  }
}
