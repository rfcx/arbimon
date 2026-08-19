<template>
  <!-- APP-WIDE task drawer. Rendered by app-root so it exists on EVERY route;
       the sidebar only owns the trigger (see ~/tasks/task-drawer for why).

       Left-anchored and offset by the collapsed sidebar rail (`left-13`) so it
       reads as sliding out of the nav where a nav exists, and simply as a left
       panel where one does not (/my-projects, /account-settings). It is
       deliberately NOT nested in the sidebar's transform context: the rail
       animates its own width on hover, which would drag the panel with it. -->
  <transition
    enter-active-class="transition-transform duration-200 ease-out"
    enter-from-class="-translate-x-full"
    leave-active-class="transition-transform duration-150 ease-in"
    leave-to-class="-translate-x-full"
  >
    <aside
      v-if="taskDrawerOpen"
      ref="panel"
      class="fixed top-0 bottom-0 left-13 z-45 w-96 max-w-[90vw] overflow-y-auto border-r border-util-gray-03 bg-echo shadow-2xl p-3"
      aria-label="Tasks"
    >
      <div class="flex items-center justify-between mb-3">
        <h2 class="text-insight font-medium">
          Tasks
        </h2>
        <button
          class="text-cloud/60 hover:text-insight"
          title="Close"
          aria-label="Close tasks"
          @click="closeTaskDrawer"
        >
          <svg
            viewBox="0 0 16 16"
            class="w-4 h-4 fill-none stroke-current"
            stroke-width="1.8"
          ><path
            d="M4 4l8 8M12 4l-8 8"
            stroke-linecap="round"
          /></svg>
        </button>
      </div>

      <!-- The EXISTING tray components, docked. Every registered TaskSource
           renders here, so a new source needs no change to this file. -->
      <task-tray-stack docked />

      <p
        v-if="taskActiveCount === 0"
        class="text-sm text-cloud/50 mt-2"
      >
        No active tasks. Uploads and analyses in progress will appear here.
      </p>
    </aside>
  </transition>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'

import { closeTaskDrawer, taskActiveCount, taskDrawerOpen } from '~/tasks/task-drawer'
import TaskTrayStack from './task-tray-stack.vue'

const panel = ref<HTMLElement>()

/**
 * Close on outside click ONLY (never on mouseleave) — the same rule the
 * profile menu follows: a panel that vanishes when the pointer strays is
 * finicky and loses the user on the way to a control inside it.
 *
 * The nav trigger is excluded so its own toggle handler can run; otherwise
 * this listener would close the drawer and the button would immediately
 * reopen it (or vice versa) on a single click.
 */
const onPointerDown = (event: MouseEvent): void => {
  if (!taskDrawerOpen.value) return
  const target = event.target as HTMLElement | null
  if (target === null) return
  if (panel.value?.contains(target) === true) return
  if (target.closest('[data-task-drawer-trigger]') !== null) return
  closeTaskDrawer()
}

onMounted(() => document.addEventListener('pointerdown', onPointerDown))
onUnmounted(() => document.removeEventListener('pointerdown', onPointerDown))
</script>
