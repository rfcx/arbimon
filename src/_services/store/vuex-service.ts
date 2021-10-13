// TODO ?? - Delete this file
import { Project, Site } from '@/_services/api/types'
import { Auth0Option, Auth0User } from '@/_services/auth/types'
import store, { ACTIONS, createVuexDecorator, ITEMS } from '.'

const get = <T>(key: string, defaultValue: T): T => store.getters[key] ?? defaultValue
const set = async (action: string, data: any): Promise<void> => await store.dispatch(action, data)

export const VuexAuth = (() => ({
  auth: (() => {
    type Auth0Type = Auth0Option | undefined
    return {
      bind () {
        return createVuexDecorator(ITEMS.root.auth)
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
      bind () {
        return createVuexDecorator(ITEMS.root.user)
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

export const VuexProject = (() => ({
  projects: (() => {
    type ProjectType = Project[]
    return {
      bind () {
        return createVuexDecorator(ITEMS.root.projects)
      },
      get (): ProjectType {
        return get<ProjectType>(ITEMS.root.projects, [])
      }
    }
  })(),

  selectedProject: (() => {
    type ProjectType = Project | undefined
    return {
      bind () {
        return createVuexDecorator(ITEMS.root.selectedProject)
      },
      get (): ProjectType {
        return get<ProjectType>(ITEMS.root.selectedProject, undefined)
      },
      async set (project: ProjectType) {
        return await set(ACTIONS.root.updateSelectedProject, project)
      }
    }
  })(),

  sites: (() => {
    type SiteType = Site[]
    return {
      bind () {
        return createVuexDecorator(ITEMS.root.sites)
      },
      get (): SiteType {
        return get<SiteType>(ITEMS.root.sites, [])
      }
    }
  })()
}))()
