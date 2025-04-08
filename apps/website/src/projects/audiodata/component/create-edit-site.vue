<template>
  <div class="border-1 bg-echo border-util-gray-03 p-3 rounded-lg">
    <div>
      <div>Site name:</div>
      <div>
        <input
          v-model="siteName"
          placeholder="Site name"
          class="text-white w-full form-control bg-moss border-gray-600 rounded-lg h-34px mt-2"
          type="text"
        >
      </div>
      <div>
        <div class="items-center mt-4">
          <input
            id="exclude-site-checkbox"
            type="checkbox"
            class="w-5 h-5 border-2 rounded dark:bg-echo focus:ring-frequency border-white dark:focus:ring-frequency dark:ring-offset-gray-800 disabled:opacity-70 disabled:cursor-not-allowed"
            :disabled="isDisabled"
            :checked="checked"
            @click="tempHidden()"
          >
          <label
            class="font-light ml-2 cursor-pointer text-secondary"
            @click="tempHidden()"
          >Exclude this site from Arbimon Insights</label>
          <icon-custom-ic-info
            class="inline-block h-4 w-4 cursor-pointer ml-1"
          />
        </div>
      </div>
    </div>
    <div class="mt-5">
      <div> Location:</div>
      <div class="input-group my-2 flex flex-row">
        <div
          class="input-group-addon text-center edit-site-label bg-moss border-gray-600 rounded-lg rounded-r-none w-16"
          ng-disabled="temp.hidden === true"
        >
          Lat
        </div>
        <input
          id="lonInput"
          class="bg-moss border-gray-600 rounded-lg rounded-l-none border-l-0 w-full"
          style="height: 34px"
          name="lat"
          type="text"
          ng-model="temp.lat"
          placeholder="Latitude"
          pattern="^-?\d+\.?\d*(\s*)$"
          ng-disabled="temp.hidden === true"
          ng-required="temp.hidden !== true"
        >
      </div>
      <div class="input-group my-2 flex flex-row">
        <div
          class="input-group-addon text-center edit-site-label bg-moss border-gray-600 rounded-lg rounded-r-none w-16"
          ng-disabled="temp.hidden === true"
        >
          <p>Lon</p>
        </div>
        <input
          id="lonInput"
          class="bg-moss border-gray-600 rounded-lg rounded-l-none border-l-0 w-full"
          style="height: 34px"
          name="lon"
          type="text"
          ng-model="temp.lon"
          placeholder="Longitude"
          pattern="^-?\d+\.?\d*(\s*)$"
          ng-disabled="temp.hidden === true"
          ng-required="temp.hidden !== true"
        >
      </div>
      <div class="input-group my-2 flex flex-row">
        <div
          class="input-group-addon text-center edit-site-label bg-moss border-gray-600 rounded-lg rounded-r-none w-16"
          ng-disabled="temp.hidden === true"
        >
          El
        </div>
        <input
          id="lonInput"
          class="bg-moss border-gray-600 rounded-lg rounded-l-none border-l-0 w-full"
          style="height: 34px"
          name="alt"
          type="text"
          ng-model="temp.alt"
          placeholder="Elevation (optional)"
          pattern="^-?\d+\.?\d*(\s*)$"
          ng-disabled="temp.hidden === true"
          ng-required="temp.hidden !== true"
        >
      </div>
    </div>
    <div class="flex flex-row justify-between mt-5">
      <button
        class="btn btn-secondary btn-rounded-full btn-small"
        type="button"
        ng-click="close()"
      >
        Cancel
      </button>
      <button class="btn btn-primary btn-rounded-full btn-small">
        Save
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const siteName = ref('')
const isDisabled = ref(false)
const checked = ref(false)

const tempHidden = () => {
  console.info('tempHidden')
}

// import { Modal } from 'flowbite'
// import { type Ref, ref, watch } from 'vue'

// import type { ProjectMember } from '@rfcx-bio/common/api-bio/project/project-members'

// const props = defineProps<{user: ProjectMember, disabledDeleteButton: boolean, isDeleting?: boolean, isError?: boolean, isSuccess?: boolean}>()
// defineEmits<{(e: 'emitDeleteProjectMember', email: string): void}>()

// const modal = ref() as Ref<Modal | null>

// watch(() => props.isSuccess, (val) => {
//   if (val === true) closeModal()
// })

// const openModalToDeleteProjectMember = (): void => {
//   modal.value = new Modal(document.getElementById('project-member-delete-modal' + props.user.userId), {
//     placement: 'top-center',
//     backdrop: 'dynamic',
//     backdropClasses: 'bg-pitch bg-opacity-50 dark:bg-opacity-80 fixed inset-0 z-40',
//     closable: true
//   })
//   modal.value.show()
// }

</script>

<style lang="scss">
.input-group {
  position: relative;
  display: table;
  border-collapse: separate;
}

.text-item {
  color: #fff;
}

.input-group-addon {
    padding: 6px 12px;
    font-size: 14px;
    font-weight: normal;
    line-height: 1;
    color: #FFFEFC;
    text-align: center;
    background-color: #060508;
    border: 1px solid #F9F6F2;
    border-radius: 4px;
}
</style>
