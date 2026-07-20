<template>
  <div class="flex flex-col gap-2 px-4 py-2 bg-moss shado text-sm font-medium">
    <!-- Transport row: Play/Pause | timeline | Volume(gain) + Frequency-filter
         (2026-07-20 operator layout: play toggles pause — no separate stop;
         gain + freq-filter controls sit right of the shortened timeline;
         prev/next moved to the row below) -->
    <div class="flex items-center gap-x-2 w-full">
      <!-- Play / Pause toggle -->
      <button
        class="flex items-center justify-center p-1 w-7 h-7 shrink-0 rounded-[4px] bg-util-gray-03 hover:bg-util-gray-04 transition"
        :title="isPlaying ? 'Pause' : 'Play'"
        @click="togglePlay"
      >
        <icon-custom-fi-play-solid
          v-if="!isPlaying"
          class="text-frequency h-4"
        />
        <icon-custom-fi-pause-solid
          v-else
          class="text-frequency h-4"
        />
      </button>
      <!-- Progress bar -->
      <input
        v-model="currentTime"
        type="range"
        min="0"
        :max="duration"
        step="0.1"
        class="flex-1 min-w-0 h-1 accent-frequency appearance-none custom-slider"
        @input="seekAudio"
      >
      <!-- Volume control -->
      <OnClickOutside
        class="relative shrink-0"
        @trigger="isGainOpen = false"
      >
        <button
          ref="gainButton"
          class="flex items-center justify-center p-1 w-7 h-7 rounded-[4px] bg-util-gray-03 hover:bg-util-gray-04 transition"
          title="Recording volume"
          @click="toggleGainPopover"
        >
          <icon-custom-fi-volume class="text-frequency text-[10px] h-5" />
        </button>
        <!-- position:fixed so the sidebar's overflow-y-scroll cannot crop the
             popover (was clipped at the sidebar edge; found live 2026-07-20).
             Anchored to the volume button at open time, clamped in-viewport. -->
        <div
          v-show="isGainOpen"
          class="flex flex-col gap-y-2 fixed bg-echo rounded-md p-3 z-50 w-80 shadow-lg border border-util-gray-03"
          :style="gainPopoverStyle"
        >
          <!-- Continuous gain dial (log scale x1..x50) -->
          <div class="flex flex-row w-full items-center gap-x-2">
            <icon-custom-fi-volume class="text-insight text-[10px] h-5 shrink-0" />
            <input
              v-model.number="gainSliderPos"
              type="range"
              min="0"
              max="100"
              step="1"
              class="flex-1 accent-frequency appearance-none cursor-pointer custom-gain"
              @input="onDial"
            >
            <span class="text-frequency text-sm w-11 text-right shrink-0">x{{ displayGain }}</span>
          </div>
          <!-- Preset chips (quick-set points on the dial) -->
          <div class="flex flex-row items-center text-insight gap-x-1">
            Gain
            <span
              v-for="(gain, ind) in gainLevels"
              :key="'level_' + gain"
              class="flex items-center text-frequency text-sm justify-center p-1 w-6 cursor-pointer rounded-[4px] bg-transparent hover:bg-util-gray-04 transition"
              :class="{'bg-util-gray-04': selectedGain === gain }"
              @click="setGain(ind)"
            >
              x{{ gain }}
            </span>
          </div>
          <!-- Soft limiter toggle: prevents harsh clipping at high gain -->
          <label class="flex flex-row items-center gap-x-2 text-insight cursor-pointer select-none">
            <input
              v-model="limiterOn"
              type="checkbox"
              class="accent-frequency w-3.5 h-3.5"
              @change="applyLimiter"
            >
            <span class="whitespace-nowrap">Soft limiter (no distortion at high gain)</span>
          </label>
        </div>
      </OnClickOutside>
      <!-- Frequency-filter button ONLY (color + download stay on the row below) -->
      <SidebarControls
        class="shrink-0"
        only="freq"
        :visobject="visobject"
        @emit-color-spectrogram="$emit('updateColorSpectrogram', $event)"
        @emit-freq-filter="$emit('updateFreqFilter', $event)"
      />
    </div>

    <!-- Controls row: color + download, RIGHT-justified under Gain + Filter
         (2026-07-20 operator layout: Prev/Next removed).
         Single row: playback timecode LEFT (under Play); then cursor coords +
         color-toggle + download grouped RIGHT (coords under the timeline,
         stacked left of the color button). -->
    <div class="flex flex-row justify-between items-center w-full">
      <!-- Playback timecode, left (under Play) -->
      <div class="flex flex-row gap-x-1 items-center shrink-0">
        <icon-custom-fi-play class="text-insight text-sm h-5" />
        <span>{{ formatTime(currentTime) }}</span>
        s
      </div>
      <!-- Cursor coords + color/download, right -->
      <div class="flex flex-row items-center gap-x-3">
        <div class="flex flex-row gap-x-1 items-center">
          <icon-custom-fi-navigation class="text-insight text-sm h-5" />
          <span>{{ props.pointer.sec.toFixed(2) }}</span>
          s,
          <span>{{ (props.pointer.hz / 1000).toFixed(1) }} kHz</span>
        </div>
        <SidebarControls
          class="shrink-0"
          only="rest"
          :visobject="visobject"
          @emit-color-spectrogram="$emit('updateColorSpectrogram', $event)"
          @emit-freq-filter="$emit('updateFreqFilter', $event)"
        />
      </div>
    </div>

    <!-- Realtime playback equalizer (moved out of the gain popup 2026-07-20).
         Full column width, 64px tall; transparent bg (blends with the moss
         panel) + hairline border; animates while audio plays. -->
    <canvas
      ref="spectrumCanvas"
      width="272"
      height="64"
      class="w-full h-16 rounded-sm bg-transparent border border-util-gray-04"
    />
  </div>
</template>

<script setup lang="ts">
import { OnClickOutside } from '@vueuse/components'
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

import type { Visobject } from '@rfcx-bio/common/api-arbimon/audiodata/visualizer'

import { type FreqFilter } from '../types'
import SidebarControls from './sidebar-controls.vue'
import { type Pointer } from './visualizer-spectrogram.vue'

const props = defineProps<{
  visobject: Visobject
  freqFilter?: FreqFilter
  pointer: Pointer
}>()

const emit = defineEmits<{(event: 'emitCurrentTime', currentTime: number): void,
  (e: 'updateColorSpectrogram', value: string): void,
  (e: 'updateFreqFilter', value: FreqFilter): void
}>()

const VITE_ARBIMON_LEGACY_BASE_URL = import.meta.env.VITE_ARBIMON_LEGACY_BASE_URL

const audio = ref<HTMLAudioElement>()
const isPlaying = ref(false)
const currentTime = ref(0)
const duration = ref(0)
const isGainOpen = ref(false)

// Popover anchoring: rendered position:fixed (so the sidebar's
// overflow-y-scroll cannot crop it) and anchored to the volume button at
// open time, clamped into the viewport.
const gainButton = ref<HTMLButtonElement>()
const gainPopoverStyle = ref<Record<string, string>>({})
const toggleGainPopover = () => {
  if (!isGainOpen.value && gainButton.value !== undefined) {
    const r = gainButton.value.getBoundingClientRect()
    const POP_W = 320 // w-80
    const left = Math.max(8, Math.min(r.left - 60, window.innerWidth - POP_W - 8))
    gainPopoverStyle.value = { left: `${left}px`, bottom: `${Math.max(8, window.innerHeight - r.top + 6)}px` }
  }
  isGainOpen.value = !isGainOpen.value
}
const gainLevels = [1, 2, 5, 10, 15, 20, 25, 30, 50]
// Default to x1 (no gain). gainLevels[0] === 1; index 8 (x50) was applying a
// 50x gain to playback by default.
const currentIndex = ref(0)

// ---- Continuous gain dial (2026-07-20 operator: dial instead of steps) ----
// Slider position 0..100 maps to gain x1..x50 on a LOG scale (perceptually
// even: half the dial ≈ x7). Preset chips jump the dial to their value.
const GAIN_MIN = 1
const GAIN_MAX = 50
const gainSliderPos = ref(0)
const posToGain = (p: number): number => GAIN_MIN * Math.pow(GAIN_MAX / GAIN_MIN, p / 100)
const gainToPos = (g: number): number => 100 * Math.log(g / GAIN_MIN) / Math.log(GAIN_MAX / GAIN_MIN)
const dialGain = ref(1)
const displayGain = computed(() => dialGain.value < 10 ? dialGain.value.toFixed(1).replace(/\.0$/, '') : Math.round(dialGain.value).toString())

// selectedGain = the ACTIVE gain (dial-driven; chips snap the dial)
const selectedGain = computed(() => dialGain.value)

// Soft limiter (on by default): keeps high-gain boosts from hard-clipping.
const limiterOn = ref(true)

// ---- Client-side gain (WebAudio) ------------------------------------
// Gain is applied through a GainNode on the SAME playing audio element, so
// changing it is instant and playback is CONTINUOUS (2026-07-20 operator
// request). The previous implementation re-fetched the file with ?gain=N
// server-side, which (a) restarted playback from 0 on every change and
// (b) was silently dropped whenever a frequency filter was active (the URL
// already carried ?maxFreq=..., and gain was appended as a second '?').
let audioCtx: AudioContext | undefined
let gainNode: GainNode | undefined
let limiterNode: DynamicsCompressorNode | undefined
let analyserNode: AnalyserNode | undefined
let mediaSource: MediaElementAudioSourceNode | undefined

const spectrumCanvas = ref<HTMLCanvasElement>()
let spectrumRaf = 0

const applyGain = () => {
  if (audioCtx === undefined || gainNode === undefined) return
  // setTargetAtTime = a short smoothing ramp (no click/pop on change)
  gainNode.gain.setTargetAtTime(selectedGain.value, audioCtx.currentTime, 0.03)
}

// Limiter bypass is implemented by ramping the compressor into a transparent
// configuration (threshold 0 dB / ratio 1) rather than re-patching the graph
// — avoids clicks and keeps the analyser fed from one place.
const applyLimiter = () => {
  if (audioCtx === undefined || limiterNode === undefined) return
  const t = audioCtx.currentTime
  if (limiterOn.value) {
    // -6 dBFS threshold, soft knee, 20:1 slope, fast attack / gentle release
    limiterNode.threshold.setTargetAtTime(-6, t, 0.05)
    limiterNode.knee.setTargetAtTime(6, t, 0.05)
    limiterNode.ratio.setTargetAtTime(20, t, 0.05)
    limiterNode.attack.setTargetAtTime(0.002, t, 0.05)
    limiterNode.release.setTargetAtTime(0.15, t, 0.05)
  } else {
    // 1:1 ratio / 0 knee = transparent bypass
    limiterNode.threshold.setTargetAtTime(0, t, 0.05)
    limiterNode.knee.setTargetAtTime(0, t, 0.05)
    limiterNode.ratio.setTargetAtTime(1, t, 0.05)
  }
}

// ---- Realtime spectrum (normalized) --------------------------------------
// Post-gain/post-limiter analyser → bar spectrum on the popover canvas.
// Normalized per frame: bars scale to the current frame's peak bin, so quiet
// recordings still show structure. Draws only while the popover is open AND
// audio is playing (rAF stops otherwise — zero cost when closed).
const drawSpectrum = () => {
  spectrumRaf = 0
  const canvas = spectrumCanvas.value
  const ctx2d = canvas?.getContext('2d') ?? null
  // Keep the rAF loop alive while playing even if the WebAudio graph isn't
  // wired yet (first frames can precede lazy analyser init) or the analyser
  // is momentarily absent — otherwise the loop dies and never restarts.
  if (canvas === undefined || analyserNode === undefined || ctx2d === null) {
    if (isPlaying.value) { spectrumRaf = requestAnimationFrame(drawSpectrum) }
    return
  }
  const bins = new Uint8Array(analyserNode.frequencyBinCount)
  analyserNode.getByteFrequencyData(bins)
  const W = canvas.width; const H = canvas.height
  ctx2d.clearRect(0, 0, W, H)
  // log-spaced bars so lows don't dominate the width
  const BARS = 48
  let peak = 1
  const vals: number[] = []
  for (let i = 0; i < BARS; i++) {
    const lo = Math.floor(Math.pow(bins.length, i / BARS))
    const hi = Math.max(lo + 1, Math.floor(Math.pow(bins.length, (i + 1) / BARS)))
    let v = 0
    for (let j = lo; j < hi && j < bins.length; j++) v = Math.max(v, bins[j])
    vals.push(v)
    if (v > peak) peak = v
  }
  const barW = W / BARS
  for (let i = 0; i < BARS; i++) {
    const h = (vals[i] / peak) * (H - 2) // normalized to frame peak
    // Muted monochrome gray (2026-07-20 operator: less vibrant than the
    // green accent). Faded via a lower alpha range so it reads as subtle.
    ctx2d.fillStyle = '#9a9a94'
    ctx2d.globalAlpha = 0.18 + 0.42 * (vals[i] / peak)
    ctx2d.fillRect(i * barW + 1, H - h, barW - 2, h)
  }
  ctx2d.globalAlpha = 1
  // The equalizer now lives inline (not in the popup), so it animates
  // whenever audio is playing — no longer gated on the gain popover.
  if (isPlaying.value) { spectrumRaf = requestAnimationFrame(drawSpectrum) }
}

const kickSpectrum = () => {
  if (spectrumRaf === 0 && isPlaying.value) {
    spectrumRaf = requestAnimationFrame(drawSpectrum)
  }
}

watch(() => isPlaying.value, () => { kickSpectrum() })

const wireGainGraph = () => {
  if (audio.value === undefined) return
  try {
    if (audioCtx === undefined) {
      audioCtx = new AudioContext()
      gainNode = audioCtx.createGain()
      limiterNode = audioCtx.createDynamicsCompressor()
      analyserNode = audioCtx.createAnalyser()
      analyserNode.fftSize = 1024
      analyserNode.smoothingTimeConstant = 0.75
      // source → gain → limiter → analyser → speakers
      gainNode.connect(limiterNode)
      limiterNode.connect(analyserNode)
      analyserNode.connect(audioCtx.destination)
      applyLimiter()
    }
    // one MediaElementSource per <audio> element; rebuild when audio changes
    mediaSource?.disconnect()
    mediaSource = audioCtx.createMediaElementSource(audio.value)
    if (gainNode !== undefined) mediaSource.connect(gainNode)
    applyGain()
  } catch (e) {
    // WebAudio unavailable/failed: audio still plays at x1 through the
    // element's default output — never break playback for gain.
  }
}

// Native <audio src> streaming (2026-07-20): the /legacy-api audio endpoint
// serves 206 Partial Content with `accept-ranges: bytes` and authenticates
// via the cookie session, so the native element streams with fast-start
// (~30ms canplay) + HTTP range/seek on both prod AND demo (verified
// identical). Do NOT set crossOrigin='anonymous' — same-origin here, and
// anonymous mode drops the cookie (breaks the auth wall). Do NOT buffer the
// whole file into a blob — that kills fast-start + range.
const createAudio = () => {
  audio.value?.pause()
  audio.value = undefined
  currentTime.value = 0
  const url = `${VITE_ARBIMON_LEGACY_BASE_URL}${props.visobject.audioUrl + (props.freqFilter !== undefined ? `?maxFreq=${props.freqFilter?.filterMax}&minFreq=${props.freqFilter?.filterMin}` : '')}`
  audio.value = new Audio(url)
  audio.value?.addEventListener('loadedmetadata', () => {
    duration.value = audio.value?.duration ?? 0
  })
  audio.value?.addEventListener('timeupdate', () => {
    currentTime.value = audio.value?.currentTime ?? 0
    emit('emitCurrentTime', currentTime.value)
  })
  audio.value?.addEventListener('ended', () => {
    isPlaying.value = false
    currentTime.value = 0
  })
  // If the WebAudio graph already exists (gain was set before a freq-filter
  // change rebuilt the element), rewire it to the new element.
  if (audioCtx !== undefined) wireGainGraph()
}

const formatTime = (sec: number) => {
  const minutes = Math.floor(sec / 60)
  const seconds = Math.floor(sec % 60)
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

const togglePlay = () => {
  if (isPlaying.value) {
    audio.value?.pause()
  } else {
    // Lazily wire the WebAudio gain graph on first play (AudioContext must
    // be created after a user gesture per browser autoplay policy).
    if (mediaSource === undefined || audioCtx === undefined) wireGainGraph()
    void audioCtx?.resume()
    void audio.value?.play()
  }
  isPlaying.value = !isPlaying.value
  kickSpectrum()
}

const seekAudio = () => {
  if (audio.value === undefined) return
  audio.value.currentTime = currentTime.value
}

const onDial = (): void => {
  dialGain.value = Math.round(posToGain(gainSliderPos.value) * 10) / 10
  // continuous playback: adjust the gain node in place — no audio rebuild
  if (mediaSource === undefined || audioCtx === undefined) wireGainGraph()
  applyGain()
}

const setGain = (ind: number) => {
  currentIndex.value = ind
  dialGain.value = gainLevels[ind]
  gainSliderPos.value = Math.round(gainToPos(gainLevels[ind]))
  if (mediaSource === undefined || audioCtx === undefined) wireGainGraph()
  applyGain()
}

watch(() => props.freqFilter, () => {
  createAudio()
})

onMounted(() => {
  createAudio()
})

onBeforeUnmount(() => {
  audio.value?.pause()
  if (spectrumRaf !== 0) { cancelAnimationFrame(spectrumRaf); spectrumRaf = 0 }
  try {
    mediaSource?.disconnect(); gainNode?.disconnect(); limiterNode?.disconnect()
    analyserNode?.disconnect(); void audioCtx?.close()
  } catch (e) { /* noop */ }
  audioCtx = undefined; gainNode = undefined; limiterNode = undefined
  analyserNode = undefined; mediaSource = undefined
  if (audio.value === undefined) return
  audio.value.src = ''
})
</script>

<style lang="scss">
.custom-gain,
.custom-slider {
  appearance: none;
  background: #ADFF2C;
  height: 4px;
  border-radius: 2px;
}
.custom-gain::-webkit-slider-thumb,
.custom-slider::-webkit-slider-thumb {
  appearance: none !important;
  width: 2px !important;
  height: 13px !important;
  background: #ADFF2C !important;
  cursor: pointer !important;
  border-radius: 1px !important;
  margin-top: -4px !important;
}

.custom-gain::-moz-range-thumb,
.custom-slider::-moz-range-thumb {
  width: 2px;
  height: 16px;
  background: #ADFF2C;
  cursor: pointer;
  border: none;
  border-radius: 1px;
}

.custom-slider::-webkit-slider-runnable-track {
  background: #7F7D78 !important;
  height: 4px !important;
  border-radius: 2px !important;
}
.custom-slider::-moz-range-track {
  background: #7F7D78;
  height: 4px;
  border-radius: 2px;
}
.custom-gain::-webkit-slider-runnable-track {
  background: #fff !important;
  height: 4px !important;
  border-radius: 2px !important;
}
.custom-gain::-moz-range-track {
  background: #fff;
  height: 4px;
  border-radius: 2px;
}
</style>
