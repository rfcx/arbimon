<template>
  <div
    class="flex flex-row items-center justify-between border-1 border-insight rounded-lg py-4 px-[18px] row-span-3 group hover:(row-span-4 py-8 bg-moss)"
    :class="{'row-span-4 bg-moss': isHovered, 'border-frequency relative row-span-4 bg-moss': checked}"
    @click="toggleSelectMemberCard"
  >
    <icon-custom-fi-check-circle
      v-if="checked"
      class="text-frequency bg-pitch w-6 h-6 absolute -translate-y-1/2 translate-x-1/2 left-auto -top-3 -right-3"
    />
    <img
      class="w-12 h-12 mr-3 rounded-full shadow"
      :src="image || 'https://inaturalist-open-data.s3.amazonaws.com/photos/332643265/small.jpeg'"
      alt="user profile image"
    >
    <div class="w-2/4">
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
    <div class="w-1/4">
      <button
        :id="`${email}EditStakeholderDropdownButton`"
        :data-dropdown-toggle="`${email}dropdownBottom`"
        data-dropdown-placement="bottom"
        class="hidden relative group-hover:block !ml-auto"
        type="button"
        @click="toggleCard()"
      >
        <icon-custom-dots-vertical class="hidden relative group-hover:block !ml-auto" />
        <div
          :id="`${email}dropdownBottom`"
          class="z-10 hidden list-none bg-moss divide-y divide-gray-100 rounded-lg shadow p-3 w-56"
          @mouseleave="toggleCard()"
        >
          <ul
            :aria-labelledby="`${email}EditStakeholderDropdownButton`"
            class="flex flex-col gap-y-3"
          >
            <li
              class="flex flex-row items-center justify-start space-x-2"
              @click="makePrimaryContact()"
            >
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
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const props = defineProps<{ name: string, email: string, image?: string, ranking?: number, modelValue: string[] }>()
const emit = defineEmits<{(event: 'emitHideEmail', value: string): void, (event: 'update:modelValue', value: string[]): void}>()

const isHovered = ref<boolean>(false)
const isHidden = ref<boolean>(false)
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

const hideEmail = (): void => {
  isHidden.value = true
  toggleCard()
  emit('emitHideEmail', props.email)
}

const makePrimaryContact = (): void => {
  toggleSelectMemberCard()
  // TODO: emit primary contact
}
</script>
