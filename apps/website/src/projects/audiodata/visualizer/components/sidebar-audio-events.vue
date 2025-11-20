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
        <span v-if="!jobsView || jobsView.length === 0">There are no audio events in this recording.</span>
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
                class="h-4 w-4 text-util-gray-02"
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

import type { PlaylistInfo, Visobject } from '@rfcx-bio/common/api-arbimon/audiodata/visualizer'

import type { AedJob } from './visualizer-sidebar.vue'

const props = defineProps<{
  visobject: Visobject
  aedJobs?: Record<string, AedJob>
  playlist?: PlaylistInfo
}>()

const emit = defineEmits<{(e: 'emitActiveAedLayer'): void, (e: 'emitActiveAedBoxes', visibleJobs: Record<number, boolean>, job: AedJob): void }>()

const jobsView = computed(() => props.aedJobs
  ? Object.values(props.aedJobs).sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  )
: [])
const eyeVisibleMap = ref<Record<number, boolean>>({})

const toggleVisible = (job: AedJob) => {
  // remove default/selected job from the audio events details page
  localStorage.setItem('analysis.audioEventJob', '')
  const current = eyeVisibleMap.value[job.jobId] ?? false
  eyeVisibleMap.value[job.jobId] = !current
  // add opacity to selected aed job
  job.items.forEach(item => { item.opacity = eyeVisibleMap.value[job.jobId] === false ? 0 : 1 })
  emit('emitActiveAedLayer')
  emit('emitActiveAedBoxes', eyeVisibleMap.value, job)
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
