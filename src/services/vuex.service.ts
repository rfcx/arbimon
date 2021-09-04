import { Auth0User } from '@/models'
import store, { ACTIONS, ITEMS, VX } from '@/stores'

// eslint-disable-next-line
const set = (action: string, data: any) => store.dispatch(action, data)

const get = <T>(key: string, defaultValue: T): T => store.getters[key] ?? defaultValue

export const User = (() => ({
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
