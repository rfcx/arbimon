import { NavigationGuardWithThis } from 'vue-router'

import { useAuthClient } from '~/auth'

export const authRequiredGuard: NavigationGuardWithThis<undefined> = async (to, from, next) => {
  // Already authenticated
  const authClient = useAuthClient()
  if (authClient.isAuthenticated) return next()

  // ! Not require login for public access
  next()

  // Redirect to login
  // next(false)
  // await authClient.loginWithRedirect({ appState: { redirectPath: to.fullPath } })
}
