<template>
  <modal-popup name="projectSelectorModal">
    <div class="p-4">
      <!-- TODO: implement search box -->
      <div class="text-white text-xl pb-2">
        Select Project
      </div>
      <div class="divide-y divide-gray-500">
        <div
          v-for="(project, idx) in store.projects"
          :key="'project-list-' + idx"
          class="flex justify-between text-white cursor-pointer hover:bg-steel-grey-dark py-2"
          @click="setSelectedProject(project)"
        >
          {{ project.name }}
          <!-- TODO ??? - Replace old icons -->
          <i
            v-if="isSelectedProject(project)"
            class="icon-check"
          />
        </div>
      </div>
      <div class="flex justify-end mt-2">
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
