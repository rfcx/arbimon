import { type NavigationGuardWithThis } from 'vue-router'

import { useAuth0Client } from '~/auth-client'
import { useStoreOutsideSetup } from '~/store'

export const authRequiredGuard: NavigationGuardWithThis<undefined> = async (to, from, next) => {
  // Already authenticated
  const store = useStoreOutsideSetup()
  if (store.user !== undefined) { next(); return }

  // Redirect to login
  const auth0Client = await useAuth0Client()
  await auth0Client.loginWithRedirect({ appState: { target: to.fullPath } })
}
