import { Auth0Option, Auth0User } from '@/models'
import store, { ACTIONS, ITEMS, VX } from '@/stores'

const set = async (action: string, data: any): Promise<void> => await store.dispatch(action, data)

const get = <T>(key: string, defaultValue: T): T => store.getters[key] ?? defaultValue

export const Auth = (() => ({
  auth: (() => {
    type Auth0Type = Auth0Option | undefined
    return {
      VX () {
        return VX(ITEMS.root.auth)
      },
      get (): Auth0Type {
        return get<Auth0Type>(ITEMS.root.auth, undefined)
      },
      async set (auth: Auth0Type) {
        return await set(ACTIONS.root.updateAuth, auth)
      }
    }
  })(),

  user: (() => {
    type UserType = Auth0User | undefined
    return {
      VX () {
        return VX(ITEMS.root.user)
      },
      get (): UserType {
        return get<UserType>(ITEMS.root.user, undefined)
      },
      async set (user: UserType) {
        return await set(ACTIONS.root.updateUser, user)
      }
    }
  })()
}))()
