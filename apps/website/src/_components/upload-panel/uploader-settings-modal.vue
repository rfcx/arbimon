<template>
  <modal-popup
    title="Uploader Settings"
    modal-body="sm:(my-8 align-middle max-w-lg w-full)"
    @emit-close="$emit('close')"
  >
    <div class="p-6">
      <div class="flex items-start justify-between mb-5">
        <div>
          <h3 class="text-lg font-medium text-insight">
            Uploader Settings
          </h3>
          <p class="text-sm text-cloud mt-1">
            These apply to every Upload Queue Section on this page.
          </p>
        </div>
        <button
          class="text-cloud hover:text-insight shrink-0 ml-4"
          title="Close"
          aria-label="Close settings"
          @click="$emit('close')"
        >
          <svg
            viewBox="0 0 16 16"
            class="w-5 h-5 fill-none stroke-current"
            stroke-width="1.6"
          ><path
            d="M3.5 3.5l9 9M12.5 3.5l-9 9"
            stroke-linecap="round"
          /></svg>
        </button>
      </div>

      <div class="space-y-5">
        <!-- Timezone determination. Kept as a labelled block rather than an
             inline row: in a modal there is room to explain what it does,
             which the toolbar never had. -->
        <div>
          <label
            for="uploader-settings-timezone"
            class="block text-sm text-insight mb-1.5"
          >
            Determine Timezone(s)
          </label>
          <select
            id="uploader-settings-timezone"
            :value="timezoneMode"
            class="w-full rounded border-cloud/30 bg-pitch text-insight px-2 py-1.5 text-sm"
            @change="onTimezoneChange"
          >
            <option value="auto">
              Automatically
            </option>
            <option value="site">
              By Site Timezone
            </option>
            <option value="utc">
              UTC
            </option>
            <option value="metadata">
              Scan Recording File Metadata
            </option>
          </select>
          <p class="text-xs text-cloud mt-1.5">
            How each recording’s date and time are matched to a timezone.
            Changing this re-checks staged recordings, except any you have
            corrected by hand.
          </p>
        </div>

        <!-- FLAC pre-conversion. The explanatory copy that used to live in a
             tooltip is shown inline here — there is room for it now. -->
        <div>
          <label class="flex items-start gap-x-2 text-sm cursor-pointer select-none">
            <input
              :checked="flacEnabled"
              type="checkbox"
              class="rounded border-cloud/40 bg-pitch shrink-0 mt-0.5"
              @change="onFlacChange"
            >
            <span class="text-insight">Pre-Convert WAV to FLAC</span>
            <span
              class="shrink-0 mt-0.5 rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide bg-frequency/20 text-frequency"
            >Experimental</span>
          </label>
          <p class="text-xs text-cloud mt-1.5 leading-relaxed">
            {{ flacInfoText }}
          </p>
        </div>
      </div>

      <div class="mt-6 flex justify-end">
        <button
          class="btn btn-primary text-sm"
          @click="$emit('close')"
        >
          Done
        </button>
      </div>
    </div>
  </modal-popup>
</template>

<script setup lang="ts">
import ModalPopup from '@/_components/modal-popup.vue'

/**
 * Uploader Settings (operator 2026-08-14).
 *
 * The timezone selector and the FLAC toggle used to sit in the page toolbar,
 * which crowded the options row and left no room to explain either control.
 * They now live here behind a settings button, which also gives later settings
 * (e.g. upload concurrency) somewhere obvious to go.
 *
 * Deliberately CONTROLLED (props + emits, no internal copy of the state): the
 * page owns `timezoneMode` and `flacEncodeEnabled`, and changing the timezone
 * mode triggers a re-analysis of staged rows. Holding a second copy here would
 * let the modal and the page disagree about what the user chose.
 */
defineProps<{
  timezoneMode: string
  flacEnabled: boolean
  flacInfoText: string
}>()

// Single-line form: the multi-line one trips func-call-spacing under this
// config (the repo's other modals use this shape).
const emit = defineEmits<{(e: 'close'): void, (e: 'update:timezoneMode', value: string): void, (e: 'update:flacEnabled', value: boolean): void}>()

const onTimezoneChange = (event: Event): void => {
  emit('update:timezoneMode', (event.target as HTMLSelectElement).value)
}

const onFlacChange = (event: Event): void => {
  emit('update:flacEnabled', (event.target as HTMLInputElement).checked)
}
</script>
