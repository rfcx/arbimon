import { type NavigationGuardWithThis } from 'vue-router'

import { useAuth0Client } from '~/auth-client'
import { useStoreOutsideSetup } from '~/store'

export const authRequiredGuard: NavigationGuardWithThis<undefined> = async (to, from, next) => {
  // Already authenticated
  const store = useStoreOutsideSetup()
  if (store.user !== undefined) { next(); return }

  const auth0Client = await useAuth0Client()
  let user
  try {
    user = await auth0Client.getUser()
    if (user === undefined) {
      await auth0Client.getTokenSilently()
      user = await auth0Client.getUser()
    }
  } catch (_error) {
    user = undefined
  }
  if (user !== undefined) {
    await store.updateUser(user)
    next()
    return
  }

  // Redirect to login
  await auth0Client.loginWithRedirect({ appState: { target: to.fullPath } })
}
