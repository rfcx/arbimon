<template>
  <!-- Floating upload tray (Drive-style): appears whenever a queue exists,
       persists across route changes (rendered in app-root). -->
  <div
    v-if="hasQueue"
    class="fixed bottom-4 right-4 z-50 w-80 rounded-lg border border-cloud/30 bg-pitch shadow-xl text-insight text-sm"
  >
    <!-- header -->
    <button
      class="w-full flex items-center justify-between px-4 py-2 border-b border-cloud/20"
      @click="collapsed = !collapsed"
    >
      <span class="font-medium">
        <template v-if="activeCount > 0">Uploading {{ activeCount }} file{{ activeCount === 1 ? '' : 's' }}…</template>
        <template v-else-if="stats.failed + stats.rejected > 0">Uploads finished ({{ stats.failed + stats.rejected }} failed)</template>
        <template v-else>Uploads complete</template>
      </span>
      <span class="text-cloud">{{ collapsed ? '▲' : '▼' }}</span>
    </button>

    <!-- aggregate bar (always visible) -->
    <div class="px-4 pt-2">
      <div class="flex justify-between text-xs text-cloud mb-1">
        <span>{{ stats.ingested + stats.duplicate }} / {{ stats.total }} complete</span>
        <span>{{ overallPercent }}%</span>
      </div>
      <div class="h-1.5 rounded bg-cloud/20 overflow-hidden mb-2">
        <div
          class="h-full bg-frequency transition-all"
          :style="{ width: `${overallPercent}%` }"
        />
      </div>
    </div>

    <!-- expanded: active file mini-list + actions -->
    <div v-if="!collapsed">
      <ul class="max-h-48 overflow-y-auto divide-y divide-cloud/10 px-4">
        <li
          v-for="item in visibleItems"
          :key="item.id"
          class="py-1.5 flex items-center gap-x-2 text-xs"
        >
          <span class="flex-1 truncate">{{ item.filename }}</span>
          <span
            class="whitespace-nowrap"
            :class="trayStateColor(item.state)"
          >
            <template v-if="item.state === 'uploading'">{{ Math.round((item.progress ?? 0) * 100) }}%</template>
            <template v-else>{{ trayStateLabel(item.state) }}</template>
          </span>
        </li>
        <li
          v-if="items.length > visibleItems.length"
          class="py-1.5 text-xs text-cloud"
        >
          … and {{ items.length - visibleItems.length }} more
        </li>
      </ul>
      <div class="flex gap-x-2 px-4 py-2 border-t border-cloud/20">
        <button
          class="text-xs text-frequency underline hover:no-underline"
          @click="goToUploader"
        >
          Open uploader
        </button>
        <span class="flex-1" />
        <button
          v-if="activeCount > 0"
          class="text-xs text-cloud underline hover:no-underline"
          @click="engineRunning ? pause() : resume()"
        >
          {{ engineRunning ? 'Pause' : 'Resume' }}
        </button>
        <button
          v-if="activeCount === 0"
          class="text-xs text-cloud underline hover:no-underline"
          @click="clear"
        >
          Clear
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

import { type UploadItemState } from '@rfcx-bio/upload-engine'

import { activeCount, engine, engineRunning, hasQueue, items, refreshItems, stats, uploadStore } from '~/upload'

const router = useRouter()
const collapsed = ref(false)

// Show in-flight + recent items first, cap the mini-list.
const visibleItems = computed(() => {
  const order: Record<string, number> = { uploading: 0, uploaded: 1, signing: 2, signed: 3, preparing: 4, queued: 5, ready: 6, failed: 7, rejected: 8, duplicate: 9, ingested: 10, paused: 11 }
  return [...items.value]
    .sort((a, b) => (order[a.state] ?? 99) - (order[b.state] ?? 99))
    .slice(0, 6)
})

const overallPercent = computed(() =>
  stats.value.bytesTotal === 0 ? 0 : Math.round((stats.value.bytesUploaded / stats.value.bytesTotal) * 100))

const TRAY_LABELS: Partial<Record<UploadItemState, string>> = {
  queued: 'queued',
  preparing: 'preparing',
  ready: 'ready',
  signing: 'signing',
  signed: 'waiting',
  uploaded: 'processing',
  ingested: 'done',
  duplicate: 'duplicate',
  failed: 'failed',
  rejected: 'rejected',
  paused: 'paused'
}

const trayStateLabel = (state: UploadItemState): string => TRAY_LABELS[state] ?? state

const trayStateColor = (state: UploadItemState): string => {
  if (state === 'ingested') return 'text-frequency'
  if (state === 'failed' || state === 'rejected') return 'text-flamingo'
  return 'text-cloud'
}

const goToUploader = (): void => {
  void router.push('/import-recordings-new')
}

const pause = (): void => { void engine.pause() }
const resume = (): void => { engine.start() }

const clear = async (): Promise<void> => {
  await uploadStore.clearTerminal()
  await refreshItems()
}
</script>
