import { createDecorator, VueDecorator } from 'vue-class-component'
import Vuex, { ActionTree, GetterTree, MutationTree } from 'vuex'

import { getProjects } from '~/api/project-service'
import { getSites } from '~/api/site-service'
import { Project, Site } from '~/api/types'
import { Auth0Option, Auth0User } from '../auth/types'
import * as ACTIONS from './actions'
import * as ITEMS from './items'

export { ACTIONS, ITEMS }
export * from './vuex-service'

const MUTATIONS = {
  root: {
    updateAuth: 'updateAuth',
    updateUser: 'updateUser',
    updateProjects: 'updateProjects',
    updateSelectedProject: 'updateSelectedProject',
    updateSites: 'updateSites'
  }
}

export class RootState {
  auth?: Auth0Option
  user?: Auth0User
  projects: Project[] = []
  selectedProject?: Project
  sites: Site[] = []
}

const rootActions: ActionTree<RootState, RootState> = {
  [ACTIONS.root.updateAuth]: ({ commit }, auth?: Auth0Option) => commit(MUTATIONS.root.updateAuth, auth),
  [ACTIONS.root.updateUser]: async ({ commit }, user?: Auth0User) => {
    commit(MUTATIONS.root.updateUser, user)

    // TODO 17 - Make this conditional on build mode (dev, staging, prod)
    // TODO 65 - Replace this with a mock service
    const projects = user ? [...await getProjects(), { id: '123', name: 'Test Project', isPublic: true, externalId: 123456 }] : []
    commit(MUTATIONS.root.updateProjects, projects)

    const selectedProject = projects.length > 0 ? projects[0] : undefined
    commit(MUTATIONS.root.updateSelectedProject, selectedProject)

    const sites = await getSites()
    commit(MUTATIONS.root.updateSites, sites)
  },
  [ACTIONS.root.updateSelectedProject]: ({ commit }, project?: Project) => commit(MUTATIONS.root.updateSelectedProject, project)
}

const rootMutations: MutationTree<RootState> = {
  [MUTATIONS.root.updateAuth]: (state, auth?: Auth0Option) => { state.auth = auth },
  [MUTATIONS.root.updateUser]: (state, user?: Auth0User) => { state.user = user },
  [MUTATIONS.root.updateProjects]: (state, projects: Project[]) => { state.projects = projects },
  [MUTATIONS.root.updateSelectedProject]: (state, project?: Project) => { state.selectedProject = project },
  [MUTATIONS.root.updateSites]: (state, sites: Site[]) => { state.sites = sites }
}

// TODO ?? - Support binding to state directly
const rootGetters: GetterTree<RootState, RootState> = {
  [ITEMS.root.auth]: state => state.auth,
  [ITEMS.root.user]: state => state.user,
  [ITEMS.root.projects]: state => state.projects,
  [ITEMS.root.selectedProject]: state => state.selectedProject,
  [ITEMS.root.sites]: state => state.sites
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
