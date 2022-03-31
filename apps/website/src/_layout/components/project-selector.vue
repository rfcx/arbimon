<template>
  <modal-popup title="select project">
    <div class="p-4">
      <div class="sm:(flex justify-between items-center)">
        <h1 class="text-white text-xl">
          Select Project
        </h1>
        <icon-fa-close class="text-xxs" />
      </div>

      <el-input
        v-model="searchKeyword"
        placeholder="Search project"
        size="small"
        class="mt-2"
      >
        <template #suffix>
          <div class="inline-flex items-center">
            <icon-fas-search class="text-xs" />
          </div>
        </template>
      </el-input>

      <el-tabs
        v-model="activeTab"
      >
        <el-tab-pane
          v-for="tab in Object.values(tabs)"
          :key="tab.id"
          :label="tab.label"
          :name="tab.id"
        />
      </el-tabs>

      <div class="h-72">
        <p
          v-if="projectData[activeTab].length === 0"
          class="text-subtle italic"
        >
          {{ displayProject }}
        </p>
        <div v-else>
          <p
            v-for="project in projectData[activeTab]"
            :key="project.id"
          >
            {{ project.name }}
          </p>
        </div>
      </div>

      <div class="flex justify-end">
        <el-pagination
          small
          layout="prev, pager, next"
          :total="projectData[activeTab].length"
        />
      </div>

      <div class="mt-4 flex justify-end">
        <button
          class="btn mr-2"
        >
          Cancel
        </button>
        <button
          class="btn btn-primary"
        >
          Select
        </button>
      </div>
    </div>
  </modal-popup>
</template>
<script lang="ts" setup>
import { computed, ref } from 'vue'

import { useStore } from '~/store'

const store = useStore()

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
const searchKeyword = ref('')

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

</script>
<style lang="scss" scoped>
::v-deep .el-input__inner {
  &:focus {
    border-color: #e5e7eb;
  }
}
</style>
