import { NavigationGuardNext, NavigationGuardWithThis, RouteLocationNormalized } from 'vue-router'

import { useAuthClient } from '~/auth'

export const authRequiredGuard: NavigationGuardWithThis<undefined> = async (to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext) => {
  // Already authenticated
  const authClient = useAuthClient()
  if (await authClient.isReady() && authClient.isAuthenticated) return next()

  // Redirect to login
  next(false)
  await authClient.loginWithRedirect({ appState: { redirectPath: to.fullPath } })
}
