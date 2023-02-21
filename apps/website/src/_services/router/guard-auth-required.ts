import { NavigationGuardWithThis } from 'vue-router'

import { useAuth0Client } from '~/auth-client'
import { useStoreOutsideSetup } from '~/store'

export const authRequiredGuard: NavigationGuardWithThis<undefined> = async (to, from, next) => {
  // Already authenticated
  const store = useStoreOutsideSetup()
  if (store.user !== undefined) return next()

  // Redirect to login
  const auth0Client = await useAuth0Client()
  await auth0Client.loginWithRedirect({ appState: { redirectPath: to.fullPath } })
}
