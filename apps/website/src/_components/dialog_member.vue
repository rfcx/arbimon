<template>
  <!-- Dialog Success -->
  <Transition>
    <div
      v-if="showAlertSuccess"
      id="targetElement"
      class="flex absolute bottom-4 justify-around items-center p-4 mb-4 rounded-lg text-white bg-white shadow dark:bg-moss border-1 border-[#7F7D78] rounded text-sm w-fit "
      role="alert"
    >
      <icon-custom-ic-success />
      <div
        class="ms-3 text-sm px-2"
      >
        <span
          class="font-medium p-2"
        > Success </span><span
          data-v-b90261d1=""
          class="p-1"
        > New Project member added successfully</span>
      </div><button
        id="triggerElement"
        type="button"
        class="ms-auto -mx-1.5 -my-1.5 text-white rounded-lg inline-flex items-center justify-center h-8 w-8 closealertbutton"
        data-dismiss-target="#targetElement"
        aria-label="Close"
        closable
        @click="closeAlert"
      >
        <span
          class="sr-only"
        >Close</span><svg
          id="triggerElement"
          class="w-3 h-3"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 14 14"
        ><path
          stroke="currentColor"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
        /></svg>
      </button>
    </div>
  </Transition>

  <!-- Dialog Duplicate -->
  <Transition>
    <div
      v-if="showAlertDuplicate"
      id="targetElement"
      class="flex absolute bottom-4 justify-around items-center p-4 mb-4 rounded-lg bg-rose-200 border-1 border-l-4 border-rose-600 rounded text-moss text-sm w-fit"
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
        > Duplicate  </span><span
          class="p-1"
        > The use is already a project member</span>
      </div><button
        id="triggerElement"
        type="button"
        class="ms-auto -mx-1.5 -my-1.5 text-white rounded-lg inline-flex items-center justify-center h-8 w-8"
        data-dismiss-target="targetElement"
        aria-label="Close"
        @click="closeAlert"
      >
        <span
          class="sr-only"
        >Close</span><svg
          id="triggerElement"
          class="w-3 h-3"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 14 14"
        ><path
          stroke="black"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
        /></svg>
      </button>
    </div>
  </Transition>

  <!-- Dialog Error -->
  <Transition>
    <div
      v-if="showAlertError"
      id="targetElement"
      class="flex absolute bottom-4 justify-around items-center p-4 mb-4 rounded-lg bg-rose-200 border-1 border-l-4 border-rose-600 rounded text-moss text-sm w-fit"
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
        > Error  </span><span
          class="p-1"
        > failed to add project member</span>
      </div><button
        id="triggerElement"
        type="button"
        class="ms-auto -mx-1.5 -my-1.5 text-white rounded-lg inline-flex items-center justify-center h-8 w-8"
        data-dismiss-target="targetElement"
        aria-label="Close"
        @click="closeAlert"
      >
        <span
          class="sr-only"
        >Close</span><svg
          id="triggerElement"
          class="w-3 h-3"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 14 14"
        ><path
          stroke="black"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
        /></svg>
      </button>
    </div>
  </Transition>
</template>

<script setup lang="ts">

import type { DismissInterface, DismissOptions, InstanceOptions } from 'flowbite'
import { Dismiss } from 'flowbite'

defineProps<{ showAlertSuccess?: boolean, showAlertDuplicate?: boolean, showAlertError?: boolean}>()

const closeAlert = (): void => {
  const $targetEl: HTMLElement | null = document.getElementById('targetElement')

  const $triggerEl: HTMLElement | null = document.getElementById('triggerElement')

  const options: DismissOptions = {
    transition: 'transition-opacity',
    duration: 700,
    timing: 'ease-out',

    onHide: (context, targetEl) => {
      console.info('element has been dismissed')
      console.info(targetEl)
    }
  }

  const instanceOptions: InstanceOptions = {
    id: 'targetElement',
    override: true
  }

  const dismiss: DismissInterface = new Dismiss($targetEl, $triggerEl, options, instanceOptions)
   dismiss.hide()
}

</script>

<style lane="scss" scoped>
.v-enter-active,
.v.leave-active {
  transition: opacity 400ms ease-out;
}

.v-enter-form,
.v-leave-to {
  opacity: 0;
  transition: opacity 700ms ease-out;
}
</style>
