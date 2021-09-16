<template>
  <div>
    <router-view />
  </div>
</template>
<script lang='ts'>
import { Vue } from 'vue-class-component'
import { Inject } from 'vue-property-decorator'

import { ROUTES_NAME } from '@/router'
import { Auth0Option, Auth0User, ProjectModels } from './models'
import { ProjectServices, VXServices } from './services'

export default class RootPage extends Vue {
  @Inject()
  readonly auth!: Auth0Option

  private projects: ProjectModels.ProjectListItem[] = []

  public async created (): Promise<void> {
    await VXServices.Auth.auth.set(this.auth)
    await VXServices.Auth.user.set(this.user)
  }

  public get loading (): boolean {
    return this.auth.loading.value
  }

  public get user (): Auth0User {
    return this.auth.user.value
  }

  async mounted (): Promise<void> {
    await this.setProjects()
    await this.setSelectedProject()
  }

  async setProjects (): Promise<void> {
    try {
      const projects = await ProjectServices.getProjects()
      await VXServices.Project.list.set(projects)
      this.projects = projects
    } catch (e) {
      console.error(e)
    }
  }

  // Set the first project as default project
  async setSelectedProject (): Promise<void> {
    const isErrorPath = this.$route.matched.some(({ name }) => name === ROUTES_NAME.error)
    if (isErrorPath) {
      void this.$router.push({
        name: ROUTES_NAME.error
      })
      return
    }

    const projectId = this.$route.params.projectId
    if (projectId) {
      const selectedProject = this.projects.find(p => p.id === projectId)
      if (!selectedProject) {
        void this.$router.push({
          name: ROUTES_NAME.error
        })
      } else {
        await VXServices.Project.selectedProject.set(selectedProject)
        void this.$router.push({
          name: ROUTES_NAME.overview,
          params: {
            projectId: selectedProject.id
          }
        })
      }
    } else if (this.projects.length > 0) {
      const defaultProject = this.projects[0]
      await VXServices.Project.selectedProject.set(defaultProject)
      void this.$router.push({
        name: ROUTES_NAME.overview,
        params: {
          projectId: defaultProject.id
        }
      })
    }
  }
}
</script>
