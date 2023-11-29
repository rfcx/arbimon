import { type NavigationGuardWithThis } from 'vue-router'

import { useStoreOutsideSetup } from '~/store'
import { ROUTE_NAMES } from './route-names'

export const rfcxEmailRequired: NavigationGuardWithThis<undefined> = async (to, _from, next) => {
  const store = useStoreOutsideSetup()

  // Not logged in or not user with `rfcx.org` email will gets redirected
  if (store.user?.email == null || store.user.email === '' || !store.user.email.includes('rfcx.org')) {
    next({ name: ROUTE_NAMES.error, params: { pathMatch: to.path.split('/').slice(1) }, query: to.query, hash: to.hash })
    return
  }

  next()
}
