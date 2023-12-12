<template>
  <div
    class="flex flex-row items-center justify-start space-x-3 border-1 border-insight rounded-lg py-4 px-[18px] row-span-3 group hover:(row-span-4 py-8 bg-moss)"
    :class="{'row-span-4 py-8 bg-moss': isHovered}"
  >
    <img
      class="w-12 h-12 rounded-full shadow"
      :src="image || 'https://inaturalist-open-data.s3.amazonaws.com/photos/332643265/small.jpeg'"
      alt="user profile image"
    >
    <div class="max-w-2/3">
      <h3
        v-if="ranking === 0"
        class="text-danger text-xs font-medium font-eyebrow uppercase"
      >
        Primary contact
      </h3>
      <h3 class="text-base font-normal font-sans">
        {{ name }}
      </h3>
      <div class="text-ellipsis overflow-hidden">
        <a
          v-if="email"
          class="text-sm font-normal leading-tight hover:underline hover:cursor-pointer"
          :title="email"
          :href="`mailto:${email}`"
        >
          {{ email }}
        </a>
      </div>
    </div>
    <button
      :id="`${email}EditStakeholderDropdownButton`"
      :data-dropdown-toggle="`${email}dropdownBottom`"
      data-dropdown-placement="bottom"
      class="hidden relative group-hover:block !ml-auto"
      type="button"
      @click="toggleCard()"
    >
      <icon-custom-dots-vertical />
      <div
        :id="`${email}dropdownBottom`"
        class="z-10 hidden list-none bg-moss divide-y divide-gray-100 rounded-lg shadow p-3 w-56"
        @mouseleave="toggleCard()"
      >
        <ul
          :aria-labelledby="`${email}EditStakeholderDropdownButton`"
          class="flex flex-col gap-y-3"
        >
          <li class="flex flex-row items-center justify-start space-x-2">
            <icon-fa-plus class="h-3 w-3 text-insight mr-2" />
            <span class="text-left">Make primary contact</span>
          </li>
          <li
            class="flex flex-row items-center justify-start space-x-2"
            :class="{'text-util-gray-02': isHidden}"
            @click="hideEmail()"
          >
            <icon-custom-fi-eye-off class="h-6 w-6" />
            <span class="text-left">Hide email (display email only)</span>
          </li>
        </ul>
      </div>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{ name: string, email: string, image?: string, ranking?: number }>()
const emit = defineEmits<{(event: 'emitHideEmail', value: string): void}>()

const isHovered = ref<boolean>(false)
const isHidden = ref<boolean>(false)

const toggleCard = (): void => {
  isHovered.value = !isHovered.value
}

const hideEmail = (): void => {
  isHidden.value = true
  toggleCard()
  emit('emitHideEmail', props.email)
}
</script>
