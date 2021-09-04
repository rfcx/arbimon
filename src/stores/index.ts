import { createDecorator, VueDecorator } from 'vue-class-component'
import Vuex, { ActionTree, GetterTree, MutationTree } from 'vuex'

import * as Models from '@/models'
import * as ACTIONS from './actions'
import * as ITEMS from './items'

export {
  ACTIONS,
  ITEMS
}

export class RootState {
  user?: Models.Auth0User
}

const rootActions: ActionTree<RootState, RootState> = {
  [ACTIONS.root.updateUser]: ({ commit }, user?: Models.Auth0User) => commit(ACTIONS.root.updateUser, user)
}

const rootMutations: MutationTree<RootState> = {
  [ACTIONS.root.updateUser]: (state, user?: Models.Auth0User) => { state.user = user }
}

const rootGetters: GetterTree<RootState, RootState> = {
  [ITEMS.root.user]: state => state.user
}

export default new Vuex.Store({
  state: new RootState(),
  mutations: rootMutations,
  actions: rootActions,
  getters: rootGetters
})

export const VX = (type: string): VueDecorator => createDecorator((options, key) => {
  options.computed = options?.computed ?? {}
  options.computed[key] = function () {
    return this.$store.getters[type]
  }
})
