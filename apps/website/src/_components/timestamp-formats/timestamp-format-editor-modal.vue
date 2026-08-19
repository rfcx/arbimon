<template>
  <modal-popup
    title="Filename Formats"
    modal-body="sm:(my-8 align-middle max-w-2xl w-full)"
    @emit-close="$emit('close')"
  >
    <!-- The palette makes this modal tall (20 tokens over 3 groups). modal-popup's
         panel is `overflow-hidden`, so without an explicit cap the footer
         buttons can sit below the fold on a short viewport with no way to
         scroll to them. Cap at the viewport and scroll INSIDE the dialog. -->
    <div class="p-6 max-h-[85vh] overflow-y-auto">
      <div class="flex items-start justify-between mb-5">
        <div>
          <h3 class="text-lg font-medium text-insight">
            Custom Filename Formats
          </h3>
          <p class="text-sm text-cloud mt-1">
            Saved to your account and used in every project. Arbimon always tries
            its built-in patterns first, so adding a format can only ever
            recognise <em>more</em> filenames — never break one that already works.
          </p>
        </div>
        <button
          class="text-cloud hover:text-insight shrink-0 ml-4"
          title="Close"
          aria-label="Close filename formats"
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

      <!-- SAVED LIST ------------------------------------------------------- -->
      <ul
        v-if="draft.length > 0"
        class="space-y-1 mb-4"
      >
        <li
          v-for="(item, index) in draft"
          :key="item.id"
          class="flex items-center gap-x-2 text-sm border border-cloud/20 rounded px-2 py-1.5"
          :class="editingId === item.id ? 'border-frequency/60' : ''"
        >
          <span class="text-cloud/50 tabular-nums w-5 shrink-0">{{ index + 1 }}.</span>
          <span class="text-insight truncate flex-1 min-w-0">{{ item.label }}</span>
          <code class="text-xs text-cloud/60 truncate max-w-[38%] shrink-0">{{ item.format }}</code>
          <!-- Reorder: position IS precedence, so this is a functional control,
               not a cosmetic one. Buttons rather than drag-and-drop -- keyboard
               reachable, and no drag library in this codebase. -->
          <button
            class="text-cloud/60 hover:text-frequency disabled:opacity-30 disabled:hover:text-cloud/60 shrink-0"
            :disabled="index === 0"
            :title="index === 0 ? 'Already first' : 'Move up (earlier formats win)'"
            :aria-label="`Move ${item.label} up`"
            @click="move(index, -1)"
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
            :disabled="index === draft.length - 1"
            :title="index === draft.length - 1 ? 'Already last' : 'Move down'"
            :aria-label="`Move ${item.label} down`"
            @click="move(index, 1)"
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
          <button
            class="text-cloud/60 hover:text-frequency shrink-0"
            title="Edit this format"
            :aria-label="`Edit ${item.label}`"
            @click="beginEdit(item)"
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
            title="Delete this format"
            :aria-label="`Delete ${item.label}`"
            @click="remove(item.id)"
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
        class="text-xs text-cloud mb-4"
      >
        No formats saved yet. Build one below — the palette inserts tokens at
        your cursor.
      </p>

      <!-- EDITOR ----------------------------------------------------------- -->
      <div class="border-t border-cloud/20 pt-4">
        <div class="flex items-baseline justify-between mb-2">
          <span class="text-sm text-insight">{{ editingId === undefined ? 'Add a format' : 'Edit format' }}</span>
          <button
            v-if="editingId !== undefined"
            class="text-xs text-cloud hover:text-insight"
            @click="resetEditor"
          >
            Cancel edit
          </button>
        </div>

        <label
          class="block text-xs text-cloud mb-1"
          for="tsf-label"
        >Name</label>
        <input
          id="tsf-label"
          v-model="labelInput"
          type="text"
          placeholder="AudioMoth field kit"
          maxlength="60"
          class="w-full mb-3 text-sm border border-cloud/40 rounded bg-pitch text-insight placeholder:text-cloud/40 focus:(border-frequency ring-frequency)"
        >

        <label
          class="block text-xs text-cloud mb-1"
          for="tsf-format"
        >Format</label>
        <input
          id="tsf-format"
          ref="formatInputEl"
          v-model="formatInput"
          type="text"
          spellcheck="false"
          placeholder="%Y%M%D_%H%I%S"
          maxlength="120"
          class="w-full text-sm font-mono border rounded bg-pitch text-insight placeholder:text-cloud/40 focus:(border-frequency ring-frequency)"
          :class="formatError !== undefined ? 'border-flamingo/70' : 'border-cloud/40'"
          @select="rememberCaret"
          @keyup="rememberCaret"
          @click="rememberCaret"
        >

        <p
          v-if="formatError !== undefined"
          class="text-xs text-flamingo mt-1"
          role="alert"
        >
          {{ formatError }}
        </p>

        <!-- TOKEN PALETTE (operator reference: iStat Menus). Inserts at the
             caret rather than appending, so a token can be added mid-format. -->
        <div class="mt-3">
          <div class="flex items-baseline justify-between mb-1.5">
            <span class="block text-xs text-cloud">Insert a token</span>
            <span class="text-xs text-cloud/50">click to add at the cursor</span>
          </div>

          <!-- Grouped by the part of the timestamp each token fills, with the
               meaning, accepted RANGE and an example shown INLINE.

               These were tooltip-only (`title=`) until 2026-08-19. A tooltip is
               invisible on touch, unreachable by keyboard, and forces the user
               to hover 20 chips one at a time to answer "which hour token do I
               want?" -- so the information that makes the palette usable was
               the one part that could not be scanned. The range column is what
               actually prevents the common failures: %G rejecting 12, %Z
               rejecting negative offsets, %z rejecting lowercase.

               Ranges come from TIMESTAMP_TOKEN_GROUPS in the engine, which is
               unit-tested against the real regexes so this copy cannot drift
               from behaviour. -->
          <div class="space-y-2.5">
            <div
              v-for="group in TIMESTAMP_TOKEN_GROUPS"
              :key="group.key"
            >
              <span class="block text-[10px] uppercase tracking-wide text-cloud/50 mb-1">{{ group.label }}</span>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-0.5">
                <button
                  v-for="info in group.tokens"
                  :key="info.token"
                  class="group flex items-baseline gap-x-2 text-left px-1.5 py-1 rounded border border-transparent hover:(border-frequency/40 bg-frequency/5)"
                  :title="`Insert ${info.token} — ${info.name}, ${info.range}`"
                  @click="insertToken(info.token)"
                >
                  <code class="text-xs font-mono text-frequency shrink-0 w-6">{{ info.token }}</code>
                  <span class="text-xs text-insight truncate flex-1 min-w-0">{{ info.name }}</span>
                  <span class="text-[10px] text-cloud/60 tabular-nums shrink-0">{{ info.range }}</span>
                </button>
              </div>
            </div>
          </div>

          <p class="text-xs text-cloud/70 mt-2.5">
            Anything that isn’t a token is matched literally. Write <code>%%</code>
            for a real percent sign.
          </p>
        </div>

        <!-- LIVE PREVIEW ---------------------------------------------------
             TWO MODES. Against staged filenames when opened from the uploader;
             against a typed sample in account settings, where no files exist.
             The second is required, not a nicety -- without it the editor is
             unverifiable exactly where it is most discoverable. -->
        <div class="mt-4">
          <div class="flex items-baseline justify-between mb-1.5">
            <span class="text-xs text-cloud">Preview</span>
            <span
              v-if="sampleFilenames.length > 0"
              class="text-xs text-cloud/60"
            >from your staged files</span>
          </div>

          <input
            v-if="sampleFilenames.length === 0"
            v-model="typedSample"
            type="text"
            spellcheck="false"
            placeholder="Paste one of your filenames, e.g. 20240315_064510.wav"
            class="w-full mb-2 text-sm font-mono border border-cloud/40 rounded bg-pitch text-insight placeholder:text-cloud/40 focus:(border-frequency ring-frequency)"
          >

          <ul
            v-if="previewRows.length > 0"
            class="space-y-1"
          >
            <li
              v-for="row in previewRows"
              :key="row.filename"
              class="flex items-baseline justify-between gap-x-2 text-xs"
            >
              <code class="text-cloud/70 truncate">{{ row.filename }}</code>
              <span
                class="shrink-0 tabular-nums"
                :class="row.parsed !== undefined ? 'text-frequency' : 'text-cloud/50'"
              >{{ row.parsed ?? 'no match' }}</span>
            </li>
          </ul>
          <p
            v-else
            class="text-xs text-cloud/50"
          >
            {{ formatInput === '' ? 'Enter a format to see how it reads your filenames.' : 'Type a sample filename above.' }}
          </p>
        </div>

        <div class="mt-4 flex items-center gap-x-2">
          <button
            class="btn btn-secondary text-sm disabled:(opacity-50 cursor-not-allowed)"
            :disabled="!canCommit"
            :title="commitBlockedReason ?? undefined"
            @click="commit"
          >
            {{ editingId === undefined ? 'Add format' : 'Save format' }}
          </button>
          <span
            v-if="commitBlockedReason !== undefined && (labelInput !== '' || formatInput !== '')"
            class="text-xs text-cloud"
          >{{ commitBlockedReason }}</span>
        </div>
      </div>

      <!-- FOOTER -----------------------------------------------------------
           STICKY. Measured 2026-08-19 on a 900px viewport: with the palette
           expanded the panel scrolls (975px content in 746px), and a static
           footer put Done at y=974 -- BELOW THE FOLD, reachable only by
           scrolling past all 20 tokens. An image-model review flagged this and
           an earlier probe of mine contradicted it; the probe was wrong (it had
           measured the UPLOADER SETTINGS modal's Done button, since two exist
           while both dialogs are open). Re-scoped to this panel, the model was
           right.

           `-mx-6 px-6 -mb-6 pb-6` cancels the panel's padding so the bar spans
           the full width and its background covers content scrolling beneath. -->
      <div class="sticky bottom-0 mt-6 -mx-6 px-6 -mb-6 pb-6 pt-3 bg-moss border-t border-cloud/20 flex items-center justify-between">
        <span
          v-if="saveError !== undefined"
          class="text-xs text-flamingo"
          role="alert"
        >{{ saveError }}</span>
        <span
          v-else
          class="text-xs text-cloud/60"
        >{{ draft.length }} of {{ MAX_USER_TIMESTAMP_FORMATS }} saved</span>
        <div class="flex items-center gap-x-2">
          <button
            class="btn btn-secondary text-sm"
            @click="$emit('close')"
          >
            Cancel
          </button>
          <button
            class="btn btn-primary text-sm disabled:(opacity-50 cursor-not-allowed)"
            :disabled="saving"
            @click="save"
          >
            {{ saving ? 'Saving…' : 'Done' }}
          </button>
        </div>
      </div>
    </div>
  </modal-popup>
</template>

<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'

import { type UserTimestampFormat, MAX_USER_TIMESTAMP_FORMATS } from '@rfcx-bio/common/dao/types'
import { parseTimestampWithFormat, TIMESTAMP_FORMAT_ERROR_TEXT, TIMESTAMP_TOKEN_GROUPS, validateTimestampFormat } from '@rfcx-bio/upload-engine'

import ModalPopup from '@/_components/modal-popup.vue'

/**
 * The filename-format editor (operator spec 2026-08-18; iStat Menus as the
 * GUI reference).
 *
 * Edits a LOCAL DRAFT and only emits on Done, so Cancel genuinely abandons the
 * session's changes -- including reorders and deletes, which are otherwise
 * irreversible from the user's point of view. Persistence belongs to the host
 * (both hosts already own a profile-save path); this component never calls the
 * API itself, which is what lets the uploader and account settings share it.
 */
const props = withDefaults(defineProps<{
  formats: UserTimestampFormat[]
  /** Real staged filenames, when opened from the uploader. Empty in account
   *  settings, which switches the preview to a typed sample. */
  sampleFilenames?: string[]
  saving?: boolean
  saveError?: string
}>(), { sampleFilenames: () => [], saving: false, saveError: undefined })

const emit = defineEmits<{(e: 'close'): void, (e: 'save', formats: UserTimestampFormat[]): void}>()

const draft = ref<UserTimestampFormat[]>(props.formats.map(item => ({ ...item })))

const labelInput = ref('')
const formatInput = ref('')
const typedSample = ref('')
const editingId = ref<string | undefined>(undefined)
const formatInputEl = ref<HTMLInputElement>()
/** Caret position at the last interaction — the palette inserts there. Tracked
 *  explicitly because clicking a palette button blurs the input first. */
const caret = ref(0)

const rememberCaret = (event: Event): void => {
  const el = event.target as HTMLInputElement
  caret.value = el.selectionStart ?? el.value.length
}

const insertToken = (token: string): void => {
  const value = formatInput.value
  const at = Math.min(caret.value, value.length)
  formatInput.value = value.slice(0, at) + token + value.slice(at)
  caret.value = at + token.length
  // Restore focus + caret so a run of palette clicks builds left-to-right
  // instead of every token landing at the same spot.
  void nextTick(() => {
    const el = formatInputEl.value
    if (el === undefined) return
    el.focus()
    el.setSelectionRange(caret.value, caret.value)
  })
}

/** Inline validation with the SPECIFIC reason (empty is not an error yet — the
 *  field simply has not been filled in). */
const formatError = computed<string | undefined>(() => {
  if (formatInput.value === '') return undefined
  const reason = validateTimestampFormat(formatInput.value)
  return reason === undefined ? undefined : TIMESTAMP_FORMAT_ERROR_TEXT[reason]
})

const previewNames = computed<string[]>(() =>
  props.sampleFilenames.length > 0
    ? props.sampleFilenames.slice(0, 3)
    : typedSample.value !== '' ? [typedSample.value] : [])

const previewRows = computed(() => {
  if (formatInput.value === '' || formatError.value !== undefined) return []
  return previewNames.value.map(filename => ({
    filename,
    parsed: parseTimestampWithFormat(filename, formatInput.value)
  }))
})

const isDuplicateLabel = computed(() =>
  draft.value.some(item => item.id !== editingId.value &&
    item.label.trim().toLowerCase() === labelInput.value.trim().toLowerCase()))

const commitBlockedReason = computed<string | undefined>(() => {
  if (labelInput.value.trim() === '') return 'Give the format a name.'
  if (isDuplicateLabel.value) return 'You already have a format with that name.'
  if (formatInput.value === '') return 'Enter a format.'
  if (formatError.value !== undefined) return formatError.value
  if (editingId.value === undefined && draft.value.length >= MAX_USER_TIMESTAMP_FORMATS) {
    return `You can save up to ${MAX_USER_TIMESTAMP_FORMATS} formats.`
  }
  return undefined
})

const canCommit = computed(() => commitBlockedReason.value === undefined)

const resetEditor = (): void => {
  editingId.value = undefined
  labelInput.value = ''
  formatInput.value = ''
}

const beginEdit = (item: UserTimestampFormat): void => {
  editingId.value = item.id
  labelInput.value = item.label
  formatInput.value = item.format
}

const commit = (): void => {
  if (!canCommit.value) return
  const label = labelInput.value.trim()
  if (editingId.value !== undefined) {
    const existing = draft.value.find(item => item.id === editingId.value)
    if (existing !== undefined) {
      existing.label = label
      existing.format = formatInput.value
    }
  } else {
    draft.value.push({
      // Client-generated id, as the DAO type specifies. Deliberately NOT
      // crypto.randomUUID: this tsconfig's DOM lib does not declare it (a real
      // vue-tsc error, caught by the build gate). Uniqueness only has to hold
      // within one user's list of at most 20, and the API rejects duplicate ids
      // anyway, so timestamp+random is sufficient -- this is not a security id.
      id: `fmt-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`,
      label,
      format: formatInput.value,
      createdAt: new Date().toISOString()
    })
  }
  resetEditor()
}

const remove = (id: string): void => {
  draft.value = draft.value.filter(item => item.id !== id)
  if (editingId.value === id) resetEditor()
}

const move = (index: number, delta: number): void => {
  const target = index + delta
  if (target < 0 || target >= draft.value.length) return
  const next = [...draft.value]
  const [moved] = next.splice(index, 1)
  next.splice(target, 0, moved)
  draft.value = next
}

const save = (): void => {
  emit('save', draft.value.map(item => ({ ...item })))
}
</script>
