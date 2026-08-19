<template>
  <div>
    <div class="flex items-center justify-between mb-1.5">
      <span class="block text-sm text-insight">{{ heading }}</span>
      <button
        class="btn btn-secondary text-xs px-2 py-0.5"
        :title="formats.length > 0 ? 'Edit your saved filename patterns' : 'Create a filename pattern'"
        @click="emit('manage')"
      >
        {{ formats.length > 0 ? 'Edit' : 'Create' }}
      </button>
    </div>

    <ul
      v-if="formats.length > 0"
      class="space-y-1"
    >
      <li
        v-for="(item, index) in formats"
        :key="item.id"
        class="flex items-baseline justify-between gap-x-2 text-sm"
      >
        <span class="text-insight truncate">
          <!-- Position is precedence (first match wins), so it is shown rather
               than left implicit -- a user whose second format never seems to
               apply needs to see that the first one is claiming the filename. -->
          <span class="text-cloud/50 tabular-nums mr-1">{{ index + 1 }}.</span>{{ item.label }}
        </span>
        <code class="text-xs text-cloud/60 shrink-0">{{ item.format }}</code>
      </li>
    </ul>
    <p
      v-else
      class="text-xs text-cloud"
    >
      {{ emptyText }}
    </p>

    <p
      v-if="hint !== undefined"
      class="text-xs text-cloud mt-1.5"
    >
      {{ hint }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { type UserTimestampFormat } from '@rfcx-bio/common/dao/types'

/**
 * The user's saved filename formats, as a read-only list with an Edit affordance.
 *
 * SHARED BY BOTH HOSTS ON PURPOSE (operator, 2026-08-18): this renders inside
 * the uploader's settings modal AND in global account settings, and the two must
 * mirror each other. They read one source of truth -- the user's profile -- so
 * two copies of this markup would drift in exactly the way the operator called
 * out. Presentation only: it owns no state and performs no saving, so both hosts
 * stay in control of loading and persistence.
 */
withDefaults(defineProps<{
  formats: UserTimestampFormat[]
  heading?: string
  emptyText?: string
  /** Optional explanatory line under the list. */
  hint?: string
}>(), {
  heading: 'Custom Filename Patterns',
  emptyText: 'No custom patterns yet. Add one if your recordings’ filenames aren’t recognised automatically — they are saved to your account and used in every project.',
  hint: undefined
})

const emit = defineEmits<{(e: 'manage'): void}>()
</script>
