<template>
  <!-- Dialog Success -->
  <Transition
    enter-active-class="transition opacity 400ms ease-out"
    leave-active-class="transition opacity 400ms ease-out"
    enter-from-class="opacity-0 transition opacity 700ms ease-out"
    leave-to-class="opacity-0 transition opacity 700ms ease-out"
  >
    <div
      v-if="showAlert && success"
      id="targetElement"
      severity="success"
      class="flex absolute bottom-4 justify-around items-center p-4 mb-4 rounded-lg text-white bg-white shadow dark:bg-moss border-1 border-util-gray-02 rounded text-sm w-fit transition-opacity duration-700 ease-out"
      role="alert"
    >
      <icon-custom-ic-success />
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
        class="ms-auto -mx-1.5 -my-1.5 text-white rounded-lg inline-flex items-center justify-center h-8 w-8 closeAlertButton"
        data-dismiss-target="#targetElement"
        aria-label="Close"
        closable
        @click="closeAlert"
      >
        <span
          class="sr-only"
        >Close</span>
        <icon-custom-ic-close-black
          class="fill-white"
        />
      </button>
    </div>

    <div
      v-else-if="showAlert && !success"
      id="targetElement"
      severity="error"
      class="flex absolute bottom-4 justify-around items-center p-4 mb-4 rounded-lg bg-rose-200 border-1 border-l-4 border-ibis rounded text-moss text-sm w-fit"
      role="alert"
    >
      <icon-custom-alert-triangle
        class="h-6 w-6 cursor-pointer item-center"
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
        class="ms-auto -mx-1.5 -my-1.5 text-white rounded-lg inline-flex items-center justify-center h-8 w-8 closeAlertButton"
        data-dismiss-target="#targetElement"
        aria-label="Close"
        closable
        @click="closeAlert"
      >
        <span
          class="sr-only"
        >Close</span>
        <icon-custom-ic-close-black />
      </button>
    </div>
  </Transition>
</template>

<script setup lang="ts">

import type { DismissInterface, DismissOptions, InstanceOptions } from 'flowbite'
import { Dismiss } from 'flowbite'

defineProps<{showAlert: boolean, success: boolean, title: string, message: string}>()

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
