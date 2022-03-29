<template>
  <modal-popup
    name="projectSelectorModal"
    @emit-close="emitCloseProjectSelector"
  >
    <div>
      <div class="p-4 border-b-1 sm:(flex justify-between items-center)">
        <div class="text-white text-xl">
          Select Project
        </div>
        <div class="<sm:(mt-2)">
          <el-input
            v-model="searchKeyword"
            placeholder="Search project"
            size="small"
          >
            <template #suffix>
              <div class="inline-flex items-center">
                <icon-fas-search class="text-xs" />
              </div>
            </template>
          </el-input>
        </div>
      </div>
      <project-list
        v-if="store.user"
        class="mt-3"
        title="My Projects"
        :projects="userProjects"
        :selected-project="newSelectedProject"
        @emit-select-project="setSelectedProject"
      />
      <project-list
        class="mt-3"
        title="Public Projects"
        :projects="publicProjects"
        :selected-project="newSelectedProject"
        @emit-select-project="setSelectedProject"
      />
      <div class="flex justify-end mt-3 p-4">
        <button
          class="btn mr-2"
          @click="emitCloseProjectSelector"
        >
          Cancel
        </button>
        <button
          class="btn btn-primary ${updating ? 'opacity-50 cursor-not-allowed' : '' }"
          @click="confirmedSelectedProject()"
        >
          Select
        </button>
      </div>
    </div>
  </modal-popup>
</template>
<script src="./project-selector.ts" lang="ts"></script>
<style lang="scss" scoped>
::v-deep .el-input__inner {
  &:focus {
    border-color: #e5e7eb;
  }
}
</style>
