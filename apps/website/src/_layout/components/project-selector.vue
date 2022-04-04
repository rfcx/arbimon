<template>
  <modal-popup
    title="select project"
    @emit-close="emit('emitClose')"
  >
    <div class="p-4">
      <div class="flex justify-between items-center mt-2">
        <h1 class="text-white text-xl">
          Select Project
        </h1>
        <icon-fa-close class="text-xxs" />
      </div>

      <el-input
        v-model="searchKeyword"
        placeholder="Search project"
        size="small"
        class="mt-4"
      >
        <template #suffix>
          <div class="inline-flex items-center">
            <icon-fas-search class="text-xs" />
          </div>
        </template>
      </el-input>

      <el-tabs
        v-model="activeTab"
        class="mt-2"
      >
        <el-tab-pane
          v-for="tab in Object.values(tabs)"
          :key="tab.id"
          :label="tab.label"
          :name="tab.id"
        />
      </el-tabs>

      <div class="min-h-72 mt-2">
        <p
          v-if="projectData[activeTab].length === 0"
          class="text-subtle italic"
        >
          {{ displayProject }}
        </p>
        <div v-else>
          <!-- <div class="grid grid-cols-11 gap-2 m-0 py-2">
            <div class="col-span-1" />
            <div class="col-span-5">
              Name
            </div>
            <div>
              ID
            </div>
          </div> -->
          <div
            v-for="project in displayProjectData"
            :key="project.id"
            class="grid grid-cols-11 gap-2 items-center m-0 py-2 cursor-pointer"
            @click="setSelectedProject(project)"
          >
            <span class="col-span-1 justify-self-center">
              <icon-fa-check
                v-if="newSelectedProject?.id === project.id"
                class="text-xs"
              />
            </span>
            <div
              :title="project.name"
              class="col-span-5 truncate"
            >
              {{ project.name }}
            </div>
            <div
              :title="project.slug"
              class="col-span-5 text-subtle truncate"
            >
              {{ project.slug }}
            </div>
          </div>
        </div>
      </div>
      {{ currentPage }}
      <div class="flex justify-end">
        <el-pagination
          v-model:currentPage="currentPage"
          small
          layout="prev, pager, next"
          :total="projectData[activeTab].length"
          :page-size="PAGE_SIZE"
        />
      </div>

      <div class="mt-4 flex justify-end">
        <button
          class="btn mr-2"
          @click="emit('emitClose')"
        >
          Cancel
        </button>
        <button
          class="btn btn-primary"
          @click="confirmSelectedProject()"
        >
          Select
        </button>
      </div>
    </div>
  </modal-popup>
</template>
<script lang="ts" setup>
import { computed, defineEmits, ref } from 'vue'
import { RouteParamsRaw, useRoute, useRouter } from 'vue-router'

import { LocationProjectForUser } from '@rfcx-bio/common/api-bio/common/projects'

import { ROUTE_NAMES } from '~/router/route-names'
import { useStore } from '~/store'

interface Emits {
  (ev: 'emitClose'): void
}

const emit = defineEmits<Emits>()

const PAGE_SIZE = 10

const route = useRoute()
const router = useRouter()
const store = useStore()
const searchKeyword = ref('')
const currentPage = ref(1)

const newSelectedProject = ref<LocationProjectForUser | null>(store.selectedProject ?? null)
const user = computed(() => {
  return store.user
})

const tabs = <const>{
  myProjects: {
    id: 'myProjects',
    label: 'My projects'
  },
  showcaseProjects: {
    id: 'showcaseProjects',
    label: 'Showcase projects'
  }
}

const activeTab = ref(tabs.myProjects.id)

const displayProject = computed(() => {
  if (activeTab.value === tabs.myProjects.id) {
    return user.value === undefined ? 'Please login to see your project.' : "You don't have any project."
  }
  return 'No project found.'
})

const projectData = computed(() => ({
  myProjects: store.projects.filter(project => project.isMyProject),
  showcaseProjects: store.projects.filter(project => !project.isMyProject)
}))

const displayProjectData = computed(() => {
  const startIdx = currentPage.value - 1
  return projectData.value[activeTab.value].slice(startIdx * PAGE_SIZE, (startIdx * PAGE_SIZE) + PAGE_SIZE)
})

const setSelectedProject = (project: LocationProjectForUser) => {
  newSelectedProject.value = project
}

const confirmSelectedProject = async () => {
  if (newSelectedProject.value) {
      await store.updateSelectedProject(newSelectedProject.value)
    const params: RouteParamsRaw = { projectSlug: newSelectedProject.value.slug }
    if (route.name === ROUTE_NAMES.activityPatterns) {
      await router.push({ params: { ...params, speciesSlug: undefined } })
    } else {
      await router.push({ params })
    }
  }
  emit('emitClose')
}

</script>
<style lang="scss" scoped>

@import "@/variables.scss";
::v-deep .el-input__inner {
  &:focus {
    border-color: #e5e7eb;
  }
}

::v-deep .el-tabs__header {
  margin: 0px;
}

.el-tabs__nav-wrap {
  border: 1px solid $color-mirage-grey-light;
}
</style>
