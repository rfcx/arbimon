<template>
  <modal-popup
    title="select project"
    @emit-close="emit('emitClose')"
  >
    <div class="p-4">
      <div class="flex justify-between items-center">
        <h1 class="text-white text-xl">
          Select Project
        </h1>
        <icon-fa-close
          class="text-xs cursor-pointer"
          @click="emit('emitClose')"
        />
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
        v-if="!searchKeyword"
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

      <div
        class="min-h-108 mt-2"
        :class="{ 'min-h-120': searchKeyword }"
      >
        <p
          v-if="displayProjectData.length === 0"
          class="text-subtle italic py-2"
        >
          {{ displayProject }}
        </p>
        <div v-else>
          <div class="grid grid-cols-17 gap-2 m-0 py-2 text-subtle">
            <span class="col-span-1" />
            <span class="col-span-8">Name</span>
            <span class="col-span-8">ID</span>
          </div>
          <div
            v-for="project in displayProjectData"
            :key="project.id"
            class="grid grid-cols-17 gap-2 items-center m-0 py-2 cursor-pointer"
            @click="setSelectedProject(project)"
          >
            <div class="col-span-1 justify-self-center">
              <icon-fa-check
                v-if="newSelectedProject?.id === project.id"
                class="text-xs"
              />
            </div>
            <span
              :title="project.name"
              class="col-span-8 truncate"
            >
              {{ project.name }}
            </span>
            <span
              :title="project.slug"
              class="col-span-8 truncate text-subtle"
            >
              {{ project.slug }}
            </span>
          </div>
        </div>
      </div>
      <div class="flex justify-end">
        <div
          v-if="total <= PAGE_SIZE"
          class="w-full h-7"
        />
        <el-pagination
          v-model:currentPage="currentPage"
          small
          layout="prev, pager, next"
          :total="total"
          :page-size="PAGE_SIZE"
          :hide-on-single-page="total <= PAGE_SIZE"
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
import { computed, defineEmits, ref, watch } from 'vue'
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

const activeTab = ref(store.user ? tabs.myProjects.id : tabs.showcaseProjects.id)

// On tab change
watch(activeTab, () => {
  currentPage.value = 1
})

// On search keyword change
watch(searchKeyword, () => {
  currentPage.value = 1
})

const displayProject = computed(() => {
  if (activeTab.value === tabs.myProjects.id && !searchKeyword.value) {
    return user.value === undefined ? 'Please login to see your project' : "You don't have any project"
  }
  return 'No projects found'
})

const projectData = computed(() => ({
  myProjects: store.projects.filter(project => project.isMyProject),
  showcaseProjects: store.projects.filter(project => !project.isMyProject)
}))

const displayProjectData = computed(() => {
  const startIdx = currentPage.value - 1

  // Have search keyword
  if (searchKeyword.value) {
    return store.projects
      .filter(({ name }) => name.toLowerCase().split(/[-_ ]+/).some(w => w.startsWith(searchKeyword.value)))
      .sort((a, b) => a.name.localeCompare(b.name))
      .slice(startIdx * PAGE_SIZE, (startIdx * PAGE_SIZE) + PAGE_SIZE)
  }

  // No search keyword
  return projectData.value[activeTab.value].slice(startIdx * PAGE_SIZE, (startIdx * PAGE_SIZE) + PAGE_SIZE)
})

const total = computed(() => {
  if (searchKeyword.value) {
    return store.projects
      .filter(({ name }) => name.toLowerCase().split(/[-_ ]+/).some(w => w.startsWith(searchKeyword.value))).length
  }
  return projectData.value[activeTab.value].length
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

::v-deep .el-tabs__nav-wrap::after {
  border-bottom: 2px solid $color-box-grey !important;
}
</style>
