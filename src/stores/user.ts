import { defineStore } from 'pinia'

import { Auth0User } from '@/models'
import * as Items from './items'

class UserState {
  user?: Auth0User
}

export const useUserStore = defineStore({
  id: Items.root.user,
  state: () => new UserState(),
  getters: {
    getUser: (state) => {
      return state.user
    }
  },
  actions: {
    initUser (user?: Auth0User) {
      this.user = user
    },
    removeUser () {
      this.user = undefined
    }
  }
})
