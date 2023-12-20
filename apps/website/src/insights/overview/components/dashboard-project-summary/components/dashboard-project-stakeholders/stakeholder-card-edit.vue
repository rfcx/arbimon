<template>
  <div
    class="flex flex-row items-center justify-between h-31 border-1 border-insight rounded-lg py-3 px-[18px] group cursor-pointer hover:(bg-moss)"
    :class="{'bg-moss': isHovered, 'border-frequency relative bg-moss': checked}"
  >
    <icon-custom-fi-check-circle
      v-if="checked"
      class="text-frequency bg-pitch w-6 h-6 absolute -translate-y-1/2 translate-x-1/2 left-auto -top-3 -right-3"
    />
    <img
      class="w-12 h-12 mr-3 rounded-full shadow"
      :src="image || 'https://inaturalist-open-data.s3.amazonaws.com/photos/332643265/small.jpeg'"
      alt="user profile image"
      @click="toggleSelectMemberCard()"
    >
    <div
      class="flex flex-col gap-y-1 w-3/5"
      @click="toggleSelectMemberCard()"
    >
      <div class="h-4 flex items-center">
        <h3
          v-if="ranking === 0"
          class="text-xs text-pitch bg-frequency font-normal font-eyebrow leading-5 px-2 rounded-sm"
        >
          Primary contact
        </h3>
      </div>
      <div class="h-12 flex items-center">
        <h3 class="text-base font-normal font-sans line-clamp-2">
          {{ name }}
        </h3>
      </div>
      <div class="h-5 text-ellipsis overflow-hidden">
        <a
          v-if="ranking === 0"
          class="text-sm font-normal leading-tight underline hover:cursor-pointer"
          :title="email"
          :href="`mailto:${email}`"
        >
          {{ email }}
        </a>
      </div>
    </div>
    <div class="w-1/5">
      <button
        :id="`${email}EditStakeholdersButton`"
        type="button"
        class="hidden group-hover:block !ml-auto"
        data-dropdown-trigger="hover"
        :data-dropdown-toggle="`${email}Dropdown`"
        data-dropdown-placement="right"
        @click="toggleCard()"
      >
        <icon-custom-dots-vertical class="hidden group-hover:block !ml-auto" />
      </button>
      <div
        :id="`${email}Dropdown`"
        class="z-50 hidden list-none bg-moss divide-y divide-gray-100 rounded-lg shadow p-3 w-70"
        @mouseleave="toggleCard()"
      >
        <ul
          :aria-labelledby="`${email}EditStakeholdersButton`"
        >
          <li
            class="flex flex-row items-center justify-start space-x-2 cursor-pointer"
            @click="togglePrimaryContact"
          >
            <icon-custom-fi-x-circle
              v-if="ranking === 0"
              class="h-4 w-4 text-insight"
            />
            <icon-fa-plus
              v-else
              class="h-3 w-3 text-insight"
            />
            <span class="text-left">{{ ranking === 0 ? 'Remove as primary contact' : 'Make primary contact' }}</span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { initDropdowns } from 'flowbite'
import { computed, onMounted, ref } from 'vue'

const props = defineProps<{ userId: number, name: string, email: string, image?: string, ranking?: number, modelValue: string[] }>()
const emit = defineEmits<{(event: 'emitPrimaryContact', userId: number, email: string, isPrimaryContact: boolean): void, (event: 'update:modelValue', value: string[]): void}>()

const isHovered = ref<boolean>(false)
const isRemovedPrimaryContact = ref<boolean>(props.ranking === 0)
const checked = computed<boolean>(() => {
  return props.modelValue.includes(props.email)
})

const toggleCard = (): void => {
  isHovered.value = !isHovered.value
}

const toggleSelectMemberCard = (): void => {
  if (checked.value) {
    const index = props.modelValue.findIndex(checkedId => checkedId === props.email)
    const copy = props.modelValue.slice(0)
    copy.splice(index, 1)

    emit('update:modelValue', [...copy])
  } else {
    emit('update:modelValue', [...props.modelValue, props.email])
  }
}

const togglePrimaryContact = (): void => {
  isRemovedPrimaryContact.value = !isRemovedPrimaryContact.value
  emit('emitPrimaryContact', props.userId, props.email, isRemovedPrimaryContact.value)
}

onMounted(() => {
  initDropdowns()
})
</script>
