<template>
  <div
    ref="root"
    class="relative"
  >
    <!-- COMBOBOX, not a native <select> (operator 2026-08-14).
         Rationale is in the script block; the short version is that a
         "Create a Site" <option> inside a native select blurs SELECTION with
         ACTION, and arrow-keying onto it can fire `change` — opening a modal
         while the user is merely browsing the list. -->
    <input
      :id="inputId"
      ref="input"
      v-model="query"
      type="text"
      role="combobox"
      autocomplete="off"
      aria-autocomplete="list"
      :aria-expanded="open"
      :aria-controls="listId"
      :aria-activedescendant="activeId"
      :placeholder="placeholder"
      :class="inputClass"
      @focus="onOpen"
      @click="onOpen"
      @input="onOpen"
      @keydown.down.prevent="move(1)"
      @keydown.up.prevent="move(-1)"
      @keydown.enter.prevent="commit"
      @keydown.esc.prevent="close"
      @keydown.tab="close"
    >

    <ul
      v-if="open"
      :id="listId"
      ref="list"
      role="listbox"
      class="absolute z-50 mt-1 max-h-72 w-full overflow-y-auto rounded-lg border border-cloud/20 bg-echo shadow-xl py-1"
    >
      <li
        v-for="(option, index) in filtered"
        :id="`${listId}-opt-${index}`"
        :key="option.id"
        role="option"
        :aria-selected="index === activeIndex"
        :aria-disabled="option.taken"
        class="px-3 py-2 text-sm"
        :class="[
          option.taken ? 'text-cloud/40 cursor-not-allowed' : 'text-insight cursor-pointer',
          index === activeIndex && !option.taken ? 'bg-frequency/15' : ''
        ]"
        @mousedown.prevent="option.taken ? undefined : choose(option)"
        @mouseenter="activeIndex = index"
      >
        {{ option.name }}<span
          v-if="option.taken"
          class="text-xs"
        > — already on this page</span>
      </li>

      <li
        v-if="filtered.length === 0"
        class="px-3 py-2 text-sm text-cloud"
      >
        No sites match “{{ query }}”
      </li>

      <!-- CREATE ROW — pinned at the BOTTOM, behind a divider.
           Bottom placement is deliberate: it never intercepts the arrow-key
           path to real options, so browsing the list can't land on an action
           first. It carries role="option" so the listbox stays a single
           coherent widget for screen readers, and it echoes the typed text so
           the outcome is unambiguous ("Create “Boger Creek”" vs a generic
           "Add new…"). -->
      <li
        :id="`${listId}-opt-${createIndex}`"
        role="option"
        :aria-selected="activeIndex === createIndex"
        class="mt-1 border-t border-cloud/20 px-3 py-2 text-sm cursor-pointer flex items-center gap-x-2 text-frequency"
        :class="activeIndex === createIndex ? 'bg-frequency/15' : ''"
        @mousedown.prevent="requestCreate"
        @mouseenter="activeIndex = createIndex"
      >
        <svg
          viewBox="0 0 16 16"
          class="w-3.5 h-3.5 fill-current shrink-0"
        ><path d="M7 2h2v5h5v2H9v5H7V9H2V7h5V2z" /></svg>
        <span v-if="query.trim() === ''">Create a Site…</span>
        <span v-else>Create “{{ query.trim() }}”…</span>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
/**
 * SITE COMBOBOX — a searchable site picker with an inline "Create a Site" row.
 *
 * WHY NOT A NATIVE <select> WITH A "Create…" <option> (operator asked for best
 * practice; this is what the research supported):
 *
 *  - A pseudo-option inside a native select BLURS SELECTION WITH ACTION. On
 *    several browsers arrow-keying through options fires `change` per option,
 *    so a keyboard user browsing the list would OPEN THE MODAL by accident.
 *  - Screen readers announce it as a value, not an action.
 *  - It becomes a "selected value" the control then has to un-select, which is
 *    state no one wants to maintain.
 *
 *  The pattern this uses instead — a combobox whose listbox ends with a pinned
 *  create row that ECHOES THE TYPED TEXT — is the one users already know from
 *  Linear/Notion-style pickers: type a name that does not exist, and the
 *  create affordance appears with your text in it.
 *
 * SCALE JUSTIFIES IT ANYWAY: production carries ~11.5k sites across ~1.1k
 * projects, so while a typical project has ~10, the tail is long enough that
 * type-ahead filtering is a real win over a flat list.
 *
 * KEPT SELF-CONTAINED (operator: independent from the uploader page). It knows
 * about options and a query string; it does not know what a queue, a section
 * or a project is. Emits `select` and `create`; the host decides what those
 * mean.
 */
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

export interface SiteComboboxOption {
  id: string
  name: string
  /** already used elsewhere on the host page — shown, but not selectable */
  taken: boolean
}

const props = withDefaults(defineProps<{
  options: SiteComboboxOption[]
  placeholder?: string
  inputClass?: string
  inputId?: string
}>(), {
  placeholder: 'Search sites, or create a new one…',
  inputClass: 'w-full rounded-md border-2 border-frequency bg-frequency/10 text-insight px-3 py-2 min-w-72 text-sm font-medium focus:(outline-none ring-2 ring-frequency)',
  inputId: 'site-combobox'
})

const emit = defineEmits<{
  (e: 'select', id: string): void
  /** user asked to create a site; carries whatever they had typed (may be '') */
  (e: 'create', name: string): void
}>()

const root = ref<HTMLElement>()
const input = ref<HTMLInputElement>()
const open = ref(false)
const query = ref('')
const activeIndex = ref(0)

const listId = computed(() => `${props.inputId}-listbox`)

const filtered = computed(() => {
  const q = query.value.trim().toLowerCase()
  if (q === '') return props.options
  return props.options.filter(o => o.name.toLowerCase().includes(q))
})

/** The create row always sits one past the last filtered option. */
const createIndex = computed(() => filtered.value.length)

const activeId = computed(() =>
  open.value ? `${listId.value}-opt-${activeIndex.value}` : undefined)

const onOpen = (): void => { open.value = true }
const close = (): void => { open.value = false }

/**
 * Arrow navigation SKIPS taken options rather than stopping on them: landing
 * on something that cannot be chosen is a dead end for a keyboard user. The
 * create row is always reachable as the final stop.
 */
const move = (delta: number): void => {
  open.value = true
  const last = createIndex.value
  let next = activeIndex.value
  for (let i = 0; i < last + 1; i++) {
    next = next + delta
    if (next < 0) next = last
    if (next > last) next = 0
    if (next === last) break // the create row is always selectable
    if (!(filtered.value[next]?.taken ?? true)) break
  }
  activeIndex.value = next
}

const choose = (option: SiteComboboxOption): void => {
  if (option.taken) return
  query.value = option.name
  close()
  emit('select', option.id)
}

const requestCreate = (): void => {
  close()
  emit('create', query.value.trim())
}

const commit = (): void => {
  if (!open.value) { open.value = true; return }
  if (activeIndex.value === createIndex.value) { requestCreate(); return }
  const option = filtered.value[activeIndex.value]
  if (option !== undefined) choose(option)
}

/** Close on outside click — a combobox left open over other content steals
 *  clicks the user meant for the page behind it. */
const onDocPointer = (event: MouseEvent): void => {
  if (root.value !== undefined && !root.value.contains(event.target as Node)) close()
}
onMounted(() => { document.addEventListener('mousedown', onDocPointer) })
onBeforeUnmount(() => { document.removeEventListener('mousedown', onDocPointer) })

defineExpose({
  focus: () => input.value?.focus(),
  /** let the host clear the field after a successful create+select */
  setQuery: (value: string) => { query.value = value }
})
</script>
