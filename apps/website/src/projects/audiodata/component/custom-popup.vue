<template>
  <div
    v-if="visible"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
  >
    <div class="bg-moss rounded-xl shadow-lg max-w-md w-full p-6">
      <div class="flex flex-col">
        <div class="flex items-start justify-between">
          <div class="rounded-full bg-util-gray-01 p-3">
            <icon-fa-trash
              class="text-ibis"
            />
          </div>
          <button
            type="button"
            data-modal-toggle="project-delete-modal"
            title="Cancel"
            @click="$emit('cancel')"
          >
            <icon-custom-fi-close-thin class="h-6 w-6 cursor-pointer text-insight" />
          </button>
        </div>
        <h2 class="text-2xl mb-4 font-header mt-6">
          {{ title }}
        </h2>
        <p class="mb-2 text-base font-medium">
          {{ message }}
        </p>
        <ul
          v-if="list && list.length"
          class="mb-2 ml-4 text-left list-inside space-y-1"
        >
          <li
            v-for="(item, index) in list"
            :key="index"
          >
            {{ item }}
          </li>
        </ul>

        <p
          v-if="note"
          class="text-base font-medium italic mb-4"
        >
          {{ note }}
        </p>

        <div class="flex flex-row justify-center items-center mt-8 gap-x-4">
          <button
            class="px-4 py-2 btn btn-secondary btn-medium w-full"
            @click="$emit('cancel')"
          >
            {{ btnCancelText }}
          </button>
          <button
            class="px-4 py-2 btn btn-medium w-full"
            :class="isForDeletePopup ? 'btn-red text-white' : 'btn-primary'"
            @click="$emit('ok')"
          >
            {{ btnOkText }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  message: string
  btnOkText?: string
  btnCancelText?: string
  visible: boolean
  isForDeletePopup: boolean
  list?: string[]
  note?: string
}>()

defineEmits<{(e: 'ok'): void, (e: 'cancel'): void}>()
</script>

<style lang="scss">
 .btn-red {
    color: #FFFEFC;
    background-color: #CC1E3D;
    border-color: #CC1E3D;
  }
</style>
