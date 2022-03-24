<template>
  <modal-popup
    name="projectSelectorModal"
    @emit-close="emitCloseProjectSelector"
  >
    <div class="p-4">
      <div class="py-2 border-b-2 sm:(flex justify-between items-center)">
        <div class="text-white text-2xl">
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
      <hr class="border-dashed">
      <project-list
        class="mt-3"
        title="Public Projects"
        :projects="publicProjects"
        :selected-project="newSelectedProject"
        @emit-select-project="setSelectedProject"
      />
      <div class="flex justify-end mt-3">
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
