<template>
  <!-- Dialog Success -->
  <Transition
    enter-active-class="transition opacity 400ms ease-out"
    leave-active-class="transition opacity 400ms ease-out"
    enter-from-class="opacity-0 transition opacity 700ms ease-out"
    leave-to-class="opacity-0 transition opacity 700ms ease-out"
  >
    <div
      id="targetElement"
      class="flex fixed bottom-4 justify-around items-center p-4 mb-4 rounded-lg border-1 w-fit mr-4"
      :class="{
        'text-insight bg-white dark:bg-util-gray-04 border-util-gray-02': severity === 'success',
        'bg-danger-background border-l-4 border-ibis text-pitch': severity === 'error'
      }"
      role="alert"
    >
      <icon-custom-ic-success
        v-if=" severity === 'success' "
        class="h-6 w-6 cursor-pointer item-center"
      />
      <icon-custom-alert-triangle
        v-else-if=" severity === 'error' "
        class="h-6 w-6 cursor-pointer item-center text-ibis"
      />
      <div
        class="ms-3 text-sm px-2"
      >
        <span
          class="font-medium p-2"
        > {{ title }} </span>
        <span
          class="p-1"
        > {{ message }}
        </span>
      </div><button
        id="closeButton"
        type="button"
        class="ms-auto -mx-1.5 -my-1.5 text-white rounded-lg inline-flex items-center justify-center h-8 w-8"
        data-dismiss-target="#targetElement"
        aria-label="Close"
        closable
        @click="closeAlert"
      >
        <span
          class="sr-only"
        >Close</span>
        <icon-custom-ic-close-black
          :class="{'fill-white': severity === 'success'}"
        />
      </button>
    </div>
  </Transition>
</template>

<script setup lang="ts">

import type { DismissInterface, DismissOptions, InstanceOptions } from 'flowbite'
import { Dismiss } from 'flowbite'

export type AlertDialogType = 'success' | 'error'
defineProps<{severity: AlertDialogType, title: string, message: string}>()

const closeAlert = (): void => {
  const $targetEl: HTMLElement | null = document.getElementById('targetElement')

  const $triggerEl: HTMLElement | null = document.getElementById('closeButton')

  const options: DismissOptions = {
    transition: 'transition-opacity',
    duration: 700,
    timing: 'ease-out'
  }

  const instanceOptions: InstanceOptions = {
    id: 'targetElement',
    override: true
  }

  const dismiss: DismissInterface = new Dismiss($targetEl, $triggerEl, options, instanceOptions)
   dismiss.hide()
}

</script>
