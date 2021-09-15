import { Auth0Option, Auth0User, ProjectModels } from '@/models'
import store, { ACTIONS, ITEMS, VX } from '@/stores'

const set = async (action: string, data: any): Promise<void> => await store.dispatch(action, data)

const get = <T>(key: string, defaultValue: T): T => store.getters[key] ?? defaultValue

// ===================== Auth =====================

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

// ===================== Project =====================

export const Project = (() => ({
  list: (() => {
    type ProjectType = ProjectModels.ProjectListItem[]
    return {
      VX () {
        return VX(ITEMS.root.projects)
      },
      get (): ProjectType {
        return get<ProjectType>(ITEMS.root.projects, [])
      },
      async set (projects: ProjectType) {
        return await set(ACTIONS.root.updateProjects, projects)
      }
    }
  })(),

  selectedProject: (() => {
    type ProjectType = ProjectModels.ProjectListItem | undefined
    return {
      VX () {
        return VX(ITEMS.root.selectedProject)
      },
      get (): ProjectType {
        return get<ProjectType>(ITEMS.root.selectedProject, undefined)
      },
      async set (project: ProjectType) {
        return await set(ACTIONS.root.updateSelectedProject, project)
      }
    }
  })()
}))()
