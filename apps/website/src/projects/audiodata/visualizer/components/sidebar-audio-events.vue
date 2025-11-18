<template>
  <div
    id="accordion-collapse"
    data-accordion="collapse"
    class="flex flex-col gap-y-2 px-4 py-2 bg-moss shadow"
  >
    <div id="accordion-collapse-heading-audio-events">
      <button
        type="button"
        class="flex justify-between items-center w-full py-2 gap-x-1 text-insight dark:(bg-transparent text-insight)"
        data-accordion-target="#accordion-collapse-body-audio-events"
        aria-expanded="false"
        aria-controls="accordion-collapse-body-audio-events"
      >
        <div>
          <icon-fa-chevron-right
            data-accordion-icon
            class="w-3 h-3 fa-chevron-right"
          />
          <icon-fa-chevron-down
            data-accordion-icon
            class="w-3 h-3 fa-chevron-up hidden"
          />
          <span class="ml-1">Audio Events</span>
        </div>
      </button>
    </div>
    <div
      id="accordion-collapse-body-audio-events"
      class="hidden w-[90%] flex flex-col gap-y-2 text-sm font-medium"
      aria-labelledby="accordion-collapse-heading-audio-events"
    >
      <div class="text-sm">
        <span class="font-bold flex">Detection Jobs</span>
        <span v-if="!aedClustering || aedClustering.length === 0">There are no audio events in this recording.</span>
        <section v-else>
          <div
            v-for="job in jobsView"
            :key="job.jobId"
            class="flex items-center justify-between mt-3 pl-2"
          >
            <div class="mr-2">
              <h3 class="text-sm font-medium">
                {{ job.name }}
              </h3>
              <p class="text-[0.75em] text-insight mt-1 whitespace-normal break-words">
                {{ job.parametersText }}
              </p>
            </div>

            <div
              class="cursor-pointer opacity-70 hover:opacity-100"
              @click="toggleVisible(job)"
              @click.stop
            >
              <icon-fa-eye
                v-if="eyeVisibleMap[job.jobId]"
                class="h-4 w-4"
              />
              <icon-fa-eye-slash
                v-else
                class="h-4 w-4"
              />
            </div>
          </div>
        </section>
      </div>
      <div class="text-sm mt-4">
        <span class="font-bold flex">Cluster Playlists</span>
        <span v-if="!playlist">There are no related clustering playlists to this recording.</span>
        <div
          v-else
          class="flex items-center justify-between mt-3 pl-2"
        >
          <span>{{ playlist.name }}</span>
          <div
            class="cursor-pointer opacity-70 hover:opacity-100"
            @click="togglePlaylistVisible = !togglePlaylistVisible"
            @click.stop
          >
            <icon-fa-eye
              v-if="togglePlaylistVisible"
              class="h-4 w-4"
            />
            <icon-fa-eye-slash
              v-else
              class="h-4 w-4"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed, ref } from 'vue'

import type { AedClusterResponse, PlaylistInfo, Visobject } from '@rfcx-bio/common/api-arbimon/audiodata/visualizer'

const props = defineProps<{
  visobject: Visobject
  aedClustering?: AedClusterResponse
  playlist?: PlaylistInfo
}>()

function formatParameters (params: Record<string, number>): string {
  return Object.entries(params)
    .map(([key, val]) => `${key}=${val}`)
    .join(', ')
}

interface AedJobView {
  jobId: number
  name: string
  parametersText: string
  timestamp: string
  items: {
    aed_id: number
    time_min: number
    time_max: number
    freq_min: number
    freq_max: number
    state: string
  }[]
}

function toJobsView (data: AedClusterResponse) {
  const grouped: Record<string, AedJobView> = {}

  for (const item of data) {
    const key = String(item.name)

    if (!(key in grouped)) {
      grouped[key] = {
        jobId: item.job_id,
        name: item.name,
        parametersText: formatParameters(item.parameters),
        timestamp: item.timestamp,
        items: []
      }
    }

    grouped[key].items.push({
      aed_id: item.aed_id,
      time_min: item.time_min,
      time_max: item.time_max,
      freq_min: item.freq_min,
      freq_max: item.freq_max,
      state: item.state
    })
  }

  return Object.values(grouped).sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  )
}

const jobsView = computed(() => toJobsView(props.aedClustering ?? []))
const eyeVisibleMap = ref<Record<number, boolean>>({})

function toggleVisible (job: AedJobView) {
  const current = eyeVisibleMap.value[job.jobId] ?? false
  eyeVisibleMap.value[job.jobId] = !current
  // TODO: When click on ic-eye to hander hied/show AedJob box on spectrogram
}

const togglePlaylistVisible = ref<boolean>(false)

</script>

<style lang="scss">

button[aria-expanded=true] .fa-chevron-up {
  display: inline-block;
}
button[aria-expanded=true] .fa-chevron-right {
  display: none;
}
button[aria-expanded=flase] .fa-chevron-up {
  display: none;
}
button[aria-expanded=false] .fa-chevron-right {
  display: inline-block;
}

input::placeholder::-webkit-input-placeholder {
  --tw-placeholder-opacity: 1;
  color: rgba(161, 161, 158, var(--tw-placeholder-opacity)) !important;
  font-size: 10px !important;
}
input::placeholder::-moz-placeholder {
  --tw-placeholder-opacity: 1;
  color: rgba(161, 161, 158, var(--tw-placeholder-opacity));
}
input::placeholder::-ms-input-placeholder {
  --tw-placeholder-opacity: 1;
  color: rgba(161, 161, 158, var(--tw-placeholder-opacity));
}
input::placeholder {
  --tw-placeholder-opacity: 1;
  color: rgba(161, 161, 158, var(--tw-placeholder-opacity)) !important;
}
</style>
