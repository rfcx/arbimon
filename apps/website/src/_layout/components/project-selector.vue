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

      <p
        v-for="project in projectData[activeTab]"
        :key="project.id"
      >
        {{ project.name }}
      </p>

      <el-pagination
        layout="prev, pager, next"
        :total="50"
      />
    </div>
  </modal-popup>
</template>
<script lang="ts" setup>
import { computed, ref } from 'vue'

import { useStore } from '~/store'

const store = useStore()

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

const projectData = computed(() => ({
  myProjects: store.projects.filter(project => project.isMyProject),
  showcaseProjects: store.projects.filter(project => !project.isMyProject)
}))

const searchKeyword = ref('')
</script>
<style lang="scss" scoped>
::v-deep .el-input__inner {
  &:focus {
    border-color: #e5e7eb;
  }
}
</style>
