<template>
  <on-click-outside @trigger="isOpenDropdown = false">
    <div class="relative">
      <div
        class="flex items-center bg-box-grey px-4 py-1 rounded-full min-w-28 cursor-pointer select-none"
        @click="openDropdown()"
      >
        <div
          class="rounded-1 w-2 h-2"
          :class="selectedVersion.colorClass"
        />
        <div class="ml-2 capitalize">
          {{ selectedVersion.label }}
        </div>
        <icon-custom-angle-down class="text-xs ml-auto" />
      </div>
      <div
        v-if="isOpenDropdown"
        class="absolute right-0 top-0 mt-12 bg-box-grey rounded-lg min-w-48"
      >
        <div
          v-for="version in versions"
          :key="'version-selector-' + version.value"
          class="flex items-center px-4 py-2 select-none first:(rounded-t-lg) last:(rounded-b-lg)"
          :class="version.disabled ? 'text-subtle cursor-not-allowed hover:(bg-box-grey)' : 'cursor-pointer hover:(bg-steel-grey)' "
          @click="setCurrentVersion(version)"
        >
          <div
            class="rounded-1 w-2 h-2"
            :class="version.colorClass"
          />
          <div
            class="ml-2 text-insight capitalize font-normal"
            :class="version.disabled ? 'text-subtle' : '' "
          >
            {{ version.label }}
          </div>
          <icon-fa-check
            v-if="selectedVersion.value === version.value"
            class="text-xxs ml-auto"
            :class="version.disabled ? 'text-subtle' : 'text-white' "
          />
        </div>
      </div>
    </div>
  </on-click-outside>
</template>
<script lang="ts" setup>
import { OnClickOutside } from '@vueuse/components'
import { inject, ref } from 'vue'

import type { BiodiversityStore } from '../../../../_services/store'

interface ProjectVersion {
    label: string
    value: string
    colorClass: string
    disabled: boolean
  }

const versions: ProjectVersion[] = [
  {
    label: 'draft',
    value: 'draft',
    colorClass: 'bg-warning',
    disabled: false
  },
  {
    label: 'publish',
    value: 'publish',
    colorClass: 'bg-brand-primary',
    disabled: true
  }
]

const store = inject<BiodiversityStore>('store')

const selectedVersion = ref(versions[0])
const isOpenDropdown = ref(false)

const openDropdown = () => {
  isOpenDropdown.value = !isOpenDropdown.value
}

const setCurrentVersion = async (version: ProjectVersion) => {
  selectedVersion.value = version
  await store?.setCurrentVersion(version.value)
}

</script>
