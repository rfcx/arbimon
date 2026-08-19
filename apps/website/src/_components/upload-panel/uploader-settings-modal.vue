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
        <!-- Custom filename formats (operator 2026-08-18). This block REPLACED
             the "Determine Timezone(s)" selector: timezone determination is now
             always automatic (filename -> file metadata -> site timezone ->
             UTC), and a wrong result is corrected where it is visible, with the
             Zone dropdown on the queue itself, rather than by choosing a
             strategy up-front.

             The list is a MIRROR of the same formats shown in account settings.
             It is surfaced here because that is where users are when the need
             arises -- many will never visit their global settings, and should
             simply find that their formats persist across projects and
             sessions. -->
        <timestamp-format-list
          :formats="timestampFormats"
          hint="Timezones are determined automatically: from the filename, then the file’s metadata, then the site’s timezone, then UTC. You can correct the result for a whole queue in the Zone column before uploading."
          @manage="emit('manageFormats')"
        />

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
import { type UserTimestampFormat } from '@rfcx-bio/common/dao/types'

import ModalPopup from '@/_components/modal-popup.vue'
import TimestampFormatList from '@/_components/timestamp-formats/timestamp-format-list.vue'

/**
 * Uploader Settings (operator 2026-08-14).
 *
 * The timezone selector and the FLAC toggle used to sit in the page toolbar,
 * which crowded the options row and left no room to explain either control.
 * They now live here behind a settings button, which also gives later settings
 * (e.g. upload concurrency) somewhere obvious to go.
 *
 * 2026-08-18 (operator): the "Determine Timezone(s)" selector was REMOVED and
 * the custom-filename-format list took its place. Determination is now always
 * automatic, and a wrong result is fixed where the user can see it (the Zone
 * dropdown on the queue) instead of by picking a strategy before the fact.
 *
 * Deliberately CONTROLLED (props + emits, no internal copy of the state): the
 * page owns `flacEncodeEnabled` and the saved formats. Holding a second copy
 * here would let the modal and the page disagree about what the user chose.
 */
defineProps<{
  flacEnabled: boolean
  flacInfoText: string
  timestampFormats: UserTimestampFormat[]
}>()

// Single-line form: the multi-line one trips func-call-spacing under this
// config (the repo's other modals use this shape).
const emit = defineEmits<{(e: 'close'): void, (e: 'update:flacEnabled', value: boolean): void, (e: 'manageFormats'): void}>()

const onFlacChange = (event: Event): void => {
  emit('update:flacEnabled', (event.target as HTMLInputElement).checked)
}
</script>
