<template>
  <modal-popup
    title="Custom Filename Patterns"
    modal-body="sm:(my-8 align-middle max-w-2xl w-full)"
    @emit-close="$emit('close')"
  >
    <div class="p-6">
      <div class="flex items-start justify-between mb-4">
        <div>
          <h3 class="text-lg font-medium text-insight">
            Custom Filename Patterns
          </h3>
          <!-- The "what are these for" explanation lives HERE, with the list
               (operator 2026-08-19) -- the editor modal builds one format and
               should not re-explain the feature every time it opens. -->
          <p class="text-sm text-cloud mt-1">
            When your recordings’ filenames aren’t recognised automatically,
            a saved pattern teaches Arbimon how to read the date and time out of
            them. Patterns are saved to your account and used in every project.
            Arbimon always tries its built-in rules first, so a pattern can
            only ever recognise <em>more</em> filenames — never break one that
            already works.
          </p>
        </div>
        <button
          class="text-cloud hover:text-insight shrink-0 ml-4"
          title="Close"
          aria-label="Close filename patterns"
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

      <ul
        v-if="formats.length > 0"
        class="space-y-1"
      >
        <li
          v-for="(item, index) in formats"
          :key="item.id"
          class="flex items-center gap-x-2 text-sm border border-cloud/20 rounded px-2 py-1.5"
        >
          <!-- Position IS precedence (first match wins), so it is shown and
               reorderable rather than left implicit. -->
          <span class="text-cloud/50 tabular-nums w-5 shrink-0">{{ index + 1 }}.</span>
          <span class="text-insight truncate flex-1 min-w-0">{{ item.label }}</span>
          <code class="text-xs font-mono text-cloud/60 truncate max-w-[38%] shrink-0">{{ item.format }}</code>
          <button
            class="text-cloud/60 hover:text-frequency disabled:opacity-30 disabled:hover:text-cloud/60 shrink-0"
            :disabled="index === 0 || busy"
            :title="index === 0 ? 'Already first' : 'Move up (earlier patterns win)'"
            :aria-label="`Move ${item.label} up`"
            @click="$emit('reorder', { id: item.id, direction: -1 })"
          >
            <svg
              viewBox="0 0 16 16"
              class="w-3.5 h-3.5 fill-none stroke-current"
              stroke-width="1.8"
            ><path
              d="M8 12.5v-9M4 7.5L8 3.5l4 4"
              stroke-linecap="round"
              stroke-linejoin="round"
            /></svg>
          </button>
          <button
            class="text-cloud/60 hover:text-frequency disabled:opacity-30 disabled:hover:text-cloud/60 shrink-0"
            :disabled="index === formats.length - 1 || busy"
            :title="index === formats.length - 1 ? 'Already last' : 'Move down'"
            :aria-label="`Move ${item.label} down`"
            @click="$emit('reorder', { id: item.id, direction: 1 })"
          >
            <svg
              viewBox="0 0 16 16"
              class="w-3.5 h-3.5 fill-none stroke-current"
              stroke-width="1.8"
            ><path
              d="M8 3.5v9M4 8.5l4 4 4-4"
              stroke-linecap="round"
              stroke-linejoin="round"
            /></svg>
          </button>
          <!-- Edit opens the SAME editor/creator modal, pre-populated
               (operator 2026-08-19) -- one editing surface, two entry points. -->
          <button
            class="text-cloud/60 hover:text-frequency shrink-0"
            :disabled="busy"
            title="Edit this pattern"
            :aria-label="`Edit ${item.label}`"
            @click="$emit('edit', item)"
          >
            <svg
              viewBox="0 0 16 16"
              class="w-3.5 h-3.5 fill-none stroke-current"
              stroke-width="1.5"
            ><path
              d="M10.5 2.5l3 3L6 13l-3.5.5L3 10l7.5-7.5zM9 4l3 3"
              stroke-linecap="round"
              stroke-linejoin="round"
            /></svg>
          </button>
          <button
            class="text-cloud/60 hover:text-flamingo shrink-0"
            :disabled="busy"
            title="Delete this pattern"
            :aria-label="`Delete ${item.label}`"
            @click="$emit('remove', item)"
          >
            <svg
              viewBox="0 0 16 16"
              class="w-3.5 h-3.5 fill-none stroke-current"
              stroke-width="1.5"
            ><path
              d="M3 4.5h10M6.5 4.5V3h3v1.5M4.5 4.5l.5 8.5h6l.5-8.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            /></svg>
          </button>
        </li>
      </ul>
      <p
        v-else
        class="text-sm text-cloud"
      >
        No patterns saved yet.
      </p>

      <div class="mt-4 flex items-center justify-between">
        <span
          v-if="error !== undefined"
          class="text-xs text-flamingo"
          role="alert"
        >{{ error }}</span>
        <span
          v-else
          class="text-xs text-cloud/60"
        >{{ formats.length }} of {{ MAX_USER_TIMESTAMP_FORMATS }} saved</span>
        <button
          class="btn btn-primary text-sm disabled:(opacity-50 cursor-not-allowed)"
          :disabled="busy || formats.length >= MAX_USER_TIMESTAMP_FORMATS"
          :title="formats.length >= MAX_USER_TIMESTAMP_FORMATS ? `You can save up to ${MAX_USER_TIMESTAMP_FORMATS} patterns.` : undefined"
          @click="$emit('create')"
        >
          New Pattern…
        </button>
      </div>
    </div>
  </modal-popup>
</template>

<script setup lang="ts">
import { type UserTimestampFormat, MAX_USER_TIMESTAMP_FORMATS } from '@rfcx-bio/common/dao/types'

import ModalPopup from '@/_components/modal-popup.vue'

/**
 * The saved-formats LIST modal (operator 2026-08-19: the old combined modal was
 * split -- this lists and explains, the editor/creator edits one entry).
 *
 * Fully controlled: every action is an EVENT the host handles by persisting
 * immediately (no local draft, so nothing here can drift from the profile).
 * `busy` disables mutation controls while a persist is in flight so a
 * double-click cannot fire two overlapping PATCHes.
 */
withDefaults(defineProps<{
  formats: UserTimestampFormat[]
  busy?: boolean
  error?: string
}>(), { busy: false, error: undefined })

// Single-line form: the multi-line signature trips func-call-spacing under
// this eslint config (same shape as uploader-settings-modal).
defineEmits<{(e: 'close'): void, (e: 'create'): void, (e: 'edit', format: UserTimestampFormat): void, (e: 'remove', format: UserTimestampFormat): void, (e: 'reorder', change: { id: string, direction: -1 | 1 }): void}>()
</script>
