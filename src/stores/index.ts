import { createDecorator, VueDecorator } from 'vue-class-component'
import Vuex, { ActionTree, GetterTree, MutationTree } from 'vuex'

import * as Models from '@/models'
import { ProjectServices } from '@/services'
import * as ACTIONS from './actions'
import * as ITEMS from './items'

export { ACTIONS, ITEMS }

const MUTATIONS = {
  root: {
    updateAuth: 'updateAuth',
    updateUser: 'updateUser',
    updateProjects: 'updateProjects',
    updateSelectedProject: 'updateSelectedProject'
  }
}

export class RootState {
  auth?: Models.Auth0Option
  user?: Models.Auth0User
  projects: Models.ProjectModels.ProjectListItem[] = []
  selectedProject?: Models.ProjectModels.ProjectListItem
}

const rootActions: ActionTree<RootState, RootState> = {
  [ACTIONS.root.updateAuth]: ({ commit }, auth?: Models.Auth0Option) => commit(MUTATIONS.root.updateAuth, auth),
  [ACTIONS.root.updateUser]: async ({ commit }, user?: Models.Auth0User) => {
    commit(MUTATIONS.root.updateUser, user)

    const projects = user ? await ProjectServices.getProjects() : []
    // URGENT 44 - Remove this
    // const projects: Models.ProjectModels.ProjectListItem[] = user
    //   ? [
    //       { id: '123', name: 'Test 1', isPublic: true, externalId: 123 },
    //       { id: '456', name: 'Test 2', isPublic: false, externalId: 456 }
    //     ]
    //   : []
    commit(MUTATIONS.root.updateProjects, projects)

    const selectedProject = projects.length > 0 ? projects[0] : undefined
    commit(MUTATIONS.root.updateSelectedProject, selectedProject)
  },
  [ACTIONS.root.updateSelectedProject]: ({ commit }, project?: Models.ProjectModels.ProjectListItem) => commit(MUTATIONS.root.updateSelectedProject, project)
}

const rootMutations: MutationTree<RootState> = {
  [MUTATIONS.root.updateAuth]: (state, auth?: Models.Auth0Option) => { state.auth = auth },
  [MUTATIONS.root.updateUser]: (state, user?: Models.Auth0User) => { state.user = user },
  [MUTATIONS.root.updateProjects]: (state, projects: Models.ProjectModels.ProjectListItem[]) => { state.projects = projects },
  [MUTATIONS.root.updateSelectedProject]: (state, project?: Models.ProjectModels.ProjectListItem) => { state.selectedProject = project }
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

export const createVuexDecorator = (field: string): VueDecorator => createDecorator((options, key) => {
  options.computed = options?.computed ?? {}
  options.computed[key] = function () {
    return this.$store.getters[field]
  }
})
