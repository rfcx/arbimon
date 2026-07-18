<template>
  <div class="w-80 rounded-lg border border-cloud/30 bg-pitch shadow-xl text-insight text-sm">
    <!-- header: headline + collapse toggle -->
    <button
      class="w-full flex items-center justify-between px-4 py-2"
      :class="collapsed ? '' : 'border-b border-cloud/20'"
      @click="toggleCollapsed"
    >
      <span class="flex items-center gap-x-2 font-medium min-w-0">
        <span
          v-if="source.summary.value.activeCount > 0"
          class="h-2 w-2 rounded-full bg-frequency animate-pulse shrink-0"
        />
        <span class="truncate">{{ source.summary.value.headline }}</span>
      </span>
      <span class="text-cloud shrink-0 ml-2">{{ collapsed ? '▲' : '▼' }}</span>
    </button>

    <template v-if="!collapsed">
      <!-- aggregate bar (when the source reports one) -->
      <div
        v-if="source.summary.value.progressPercent !== undefined"
        class="px-4 pt-2"
      >
        <div class="flex justify-between text-xs text-cloud mb-1">
          <span>{{ source.summary.value.doneCount }} done<template v-if="source.summary.value.failedCount > 0"> · {{ source.summary.value.failedCount }} failed</template></span>
          <span>{{ source.summary.value.progressPercent }}%</span>
        </div>
        <div class="h-1.5 rounded bg-cloud/20 overflow-hidden mb-2">
          <div
            class="h-full bg-frequency transition-all"
            :style="{ width: `${source.summary.value.progressPercent}%` }"
          />
        </div>
      </div>

      <!-- optional search box (e.g. masquerade user picker) -->
      <div
        v-if="source.searchBox !== undefined"
        class="px-4 pt-2"
      >
        <input
          type="text"
          class="w-full rounded border border-cloud/30 bg-echo px-2 py-1 text-xs text-insight placeholder-cloud/60 focus:outline-none focus:border-frequency"
          :placeholder="source.searchBox.placeholder"
          :value="source.searchBox.query.value"
          autocomplete="off"
          @input="onSearchInput"
        >
      </div>

      <!-- item list -->
      <ul class="max-h-48 overflow-y-auto divide-y divide-cloud/10 px-4">
        <li
          v-for="item in source.items.value"
          :key="item.id"
          class="py-1.5 flex items-center gap-x-2 text-xs"
        >
          <span class="flex-1 truncate">{{ item.label }}</span>
          <span
            class="whitespace-nowrap"
            :class="stateColor(item.state)"
            :title="item.detail"
          >
            <template v-if="item.progress !== undefined">{{ Math.round(item.progress * 100) }}%</template>
            <template v-else>{{ item.detail ?? item.state }}</template>
          </span>
          <button
            v-for="action in item.actions ?? []"
            :key="action.id"
            class="text-xs text-frequency underline hover:no-underline whitespace-nowrap"
            :disabled="action.disabled"
            @click="action.run()"
          >
            {{ action.label }}
          </button>
        </li>
      </ul>

      <!-- footer: page link + source actions -->
      <div class="flex gap-x-2 px-4 py-2 border-t border-cloud/20">
        <button
          v-if="pageRoute !== undefined"
          class="text-xs text-frequency underline hover:no-underline"
          @click="openPage"
        >
          {{ source.pageLabel ?? 'Open' }}
        </button>
        <span class="flex-1" />
        <button
          v-for="action in source.actions?.value ?? []"
          :key="action.id"
          class="text-xs text-cloud underline hover:no-underline"
          :disabled="action.disabled"
          @click="action.run()"
        >
          {{ action.label }}
        </button>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

import { loadCollapsed, saveCollapsed } from '~/tasks/task-center'
import { type TaskItemState, type TaskSource } from '~/tasks/types'

const props = defineProps<{
  source: TaskSource
}>()

const router = useRouter()
const collapsed = ref(loadCollapsed(props.source.id))

const toggleCollapsed = (): void => {
  collapsed.value = !collapsed.value
  saveCollapsed(props.source.id, collapsed.value)
}

const pageRoute = computed(() => props.source.pageRoute?.value)

const openPage = (): void => {
  if (pageRoute.value !== undefined) void router.push(pageRoute.value)
}

const onSearchInput = (event: Event): void => {
  props.source.searchBox?.onInput((event.target as HTMLInputElement).value)
}

const stateColor = (state: TaskItemState): string => {
  switch (state) {
    case 'done': return 'text-frequency'
    case 'failed': return 'text-flamingo'
    default: return 'text-cloud'
  }
}
</script>
