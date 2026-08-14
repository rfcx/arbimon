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

    <!-- The popup is a COLUMN: a scrolling options area plus a create row that
         is pinned OUTSIDE it. `role="listbox"` stays on this outer element so
         both the options and the create row remain part of ONE widget for
         assistive tech, even though only the options scroll. -->
    <div
      v-if="open"
      :id="listId"
      role="listbox"
      class="absolute z-50 mt-1 w-full rounded-lg border border-cloud/20 bg-echo shadow-xl flex flex-col overflow-hidden"
    >
      <ul
        ref="list"
        class="max-h-72 overflow-y-auto py-1"
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
      </ul>

      <!-- CREATE ROW — pinned OUTSIDE the scrolling area (operator 2026-08-14).

           IT USED TO BE THE LAST CHILD OF THE SCROLL CONTAINER, which meant that
           on a project with many sites the user had to scroll past ALL of them
           to reach it. Measured: only ~5 rows fit in the 288px list, so beyond
           4 sites the create row was already below the fold — and a project
           with 50 sites buried it completely.

           As a sibling of the scrolling <ul> it is ALWAYS visible, docked to the
           bottom of the popup like a dialog's action bar, while the options
           scroll behind it.

           Still LAST in the arrow-key order, which was the original reason for
           bottom placement: browsing with the keyboard reaches real options
           first and can never land on an action by accident. So this keeps that
           property AND makes the row reachable in one click. -->
      <div
        :id="`${listId}-opt-${createIndex}`"
        role="option"
        :aria-selected="activeIndex === createIndex"
        class="shrink-0 border-t border-cloud/20 px-3 py-2 text-sm cursor-pointer flex items-center gap-x-2 text-frequency bg-echo"
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
      </div>
    </div>
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
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'

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
const list = ref<HTMLElement>()
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
  scrollActiveIntoView()
}

/**
 * Keep the keyboard-active option visible.
 *
 * Necessary because the options area scrolls (max-h-72 ≈ 5 rows): without this,
 * arrow-keying down a long site list moves the highlight out of sight and the
 * user is navigating blind. The create row is deliberately EXCLUDED — it is
 * pinned outside the scroller and always visible, so there is nothing to scroll
 * to.
 */
const scrollActiveIntoView = (): void => {
  if (activeIndex.value === createIndex.value) return
  void nextTick(() => {
    const el = list.value?.querySelector<HTMLElement>(`#${CSS.escape(`${listId.value}-opt-${activeIndex.value}`)}`)
    el?.scrollIntoView({ block: 'nearest' })
  })
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

<style scoped>
/**
 * ATTENTION PULSE for the unlinked site picker.
 *
 * ⚠️ LIVES HERE, NOT IN THE HOST. It was originally defined in
 * staging-table.vue's `<style scoped>` (§147) and applied to this component's
 * input via `input-class`. Scoped CSS only matches the DOM the component
 * itself renders, so once the native <select> became this child component the
 * rule stopped applying — verified live: `animationName: none`. Styling passed
 * DOWN by class must be defined WHERE THE ELEMENT LIVES.
 *
 * Not an `animate-*` utility: this WindiCSS config registers only a `wave`
 * animation, so `animate-pulse` emits NO CSS at all (checked against the built
 * stylesheet). A local keyframe cannot fail that way.
 *
 * Animates BOX-SHADOW, not size: a pulsing ring must not reflow the header row
 * (which would nudge the table every cycle), and box-shadow is
 * compositor-friendly.
 */
@keyframes site-picker-ping {
  0%   { box-shadow: 0 0 0 0 rgba(173, 255, 44, 0.55); }
  70%  { box-shadow: 0 0 0 10px rgba(173, 255, 44, 0); }
  100% { box-shadow: 0 0 0 0 rgba(173, 255, 44, 0); }
}

/**
 * ⚠️ THE BORDER NEEDS `input.` + `!important`, and that is not over-caution.
 *
 * Measured live: the border rendered BLUE rgb(28,100,242) despite
 * `border-frequency` being both applied AND emitted. The winner is the forms
 * plugin's base rule for `[type="text"], [type="email"], …`, whose ATTRIBUTE
 * selector outranks a single utility class. A plain `.site-picker-attention`
 * rule loses to it for the same reason.
 *
 * `input.site-picker-attention` (element + class) plus !important is the
 * smallest thing that reliably wins here, and it is confined to this one
 * attention state rather than fighting the base layer globally.
 */
input.site-picker-attention {
  animation: site-picker-ping 1.8s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  border-color: rgb(173, 255, 44) !important;
}

/* Reduced motion: drop the movement, keep every other cue (accent border,
   tinted field, autofocus) so the emphasis survives — only the motion goes. */
@media (prefers-reduced-motion: reduce) {
  input.site-picker-attention {
    animation: none;
  }
}
</style>
