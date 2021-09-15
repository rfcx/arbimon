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
  auth?: Models.Auth0Option
  user?: Models.Auth0User
  projects?: Models.ProjectModels.ProjectListItem[]
  selectedProject?: Models.ProjectModels.ProjectListItem
}

const rootActions: ActionTree<RootState, RootState> = {
  [ACTIONS.root.updateAuth]: ({ commit }, auth?: Models.Auth0Option) => commit(ACTIONS.root.updateAuth, auth),
  [ACTIONS.root.updateUser]: ({ commit }, user?: Models.Auth0User) => commit(ACTIONS.root.updateUser, user),
  [ACTIONS.root.updateProjects]: ({ commit }, projects?: Models.ProjectModels.ProjectListItem[]) => commit(ACTIONS.root.updateProjects, projects),
  [ACTIONS.root.updateSelectedProject]: ({ commit }, project?: Models.ProjectModels.ProjectListItem) => commit(ACTIONS.root.updateSelectedProject, project)
}

const rootMutations: MutationTree<RootState> = {
  [ACTIONS.root.updateAuth]: (state, auth?: Models.Auth0Option) => { state.auth = auth },
  [ACTIONS.root.updateUser]: (state, user?: Models.Auth0User) => { state.user = user },
  [ACTIONS.root.updateProjects]: (state, projects?: Models.ProjectModels.ProjectListItem[]) => { state.projects = projects },
  [ACTIONS.root.updateSelectedProject]: (state, project?: Models.ProjectModels.ProjectListItem) => { state.selectedProject = project }
}

const rootGetters: GetterTree<RootState, RootState> = {
  [ITEMS.root.auth]: state => state.auth,
  [ITEMS.root.user]: state => state.user,
  [ITEMS.root.projects]: state => state.projects,
  [ITEMS.root.selectedProject]: state => state.selectedProject
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
