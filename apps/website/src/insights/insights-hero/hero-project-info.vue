<template>
  <div class="my-4 flex gap-2 font-display text-insight text-sm flex-wrap">
    <div
      class="flex flex-row items-center font-display text-sm mr-2 h-5"
    >
      <icon-fas-spinner
        v-if="isLoadingProfile"
        class="animate-spin"
        aria-label="Loading"
      />
      <span
        :style="showTooltip"
        class="text-insight text-sm mr-2 cursor-pointer"
        data-tooltip-target="tooltip-project-country"
      >
        {{ projectCountryText }}
      </span>
      <div
        id="tooltip-project-country"
        role="tooltip"
        class="tooltip_ml absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-gray-900 transition-opacity duration-300 bg-white rounded-lg shadow-sm opacity-0 tooltip"
      >
        {{ projectCountry }}
        <div
          class="absolute tooltip-arrow"
          data-popper-arrow
        />
      </div>
      <div
        v-if="projectFlag"
        class="align-baseline"
      >
        <country-flag
          :country="projectFlag"
          size="small"
        />
      </div>
      <icon-custom-fi-globe
        v-else
      />
    </div>
    <div
      class="flex flex-row border-l-2 border-gray-300 px-2 space-x-4 items-center"
      :class="profile?.dateStart === null && profile?.dateEnd === null ? 'hidden': ''"
    >
      <span>
        Project dates:
      </span>
      <span class="uppercase">
        {{ formatDateRange(profile?.dateStart) }}
      </span>
      <icon-custom-arrow-right-white class="self-start" />
      <span
        class="uppercase"
      >
        {{ formatDateRange(profile?.dateEnd) }}
      </span>
    </div>
    <div
      v-if="projectObjectives.length > 0"
      class="border-l-2 border-gray-300 px-2"
    >
      <span>Objectives: </span>
      {{ projectObjectivesText }}
    </div>
  </div>
</template>

<script setup lang="ts">

import { type TCountryCode, getCountryData } from 'countries-list'
import dayjs from 'dayjs'
import { computed } from 'vue'
import CountryFlag from 'vue-country-flag-next'

import { type ProjectSettingsResponse } from '@rfcx-bio/common/api-bio/project-profile/project-settings'

import { objectiveTypes } from '../../projects/types'

const props = defineProps<{
  isLoadingProfile: boolean,
  projectObjectives: string[],
  profile: ProjectSettingsResponse | undefined
}>()
const formatDateRange = (date: Date | null | undefined): string => {
  if (!dayjs(date).isValid()) return 'present'
  else return dayjs(date).format('MMM DD YYYY')
}

const projectFlag = computed(() => {
  if (props.profile?.countryCodes === undefined) return ''
  if (!props.profile?.countryCodes.length) return ''
  return props.profile.countryCodes.length > 1 ? '' : props.profile.countryCodes[0]
})

const projectCountry = computed(() => {
  if (props.profile?.countryCodes === undefined) return ''
  if (!props.profile?.countryCodes.length) return ''
  const country = props.profile.countryCodes?.map(code => getCountryData(code as TCountryCode).name)
  return country?.join(', ')
})

const projectCountryText = computed(() => {
  if (props.profile?.countryCodes === undefined) return ''
  if (!props.profile?.countryCodes.length) return ''
  if (props.profile.countryCodes.length > 3) {
    return 'Multiple countries'
  } else {
    const country = props.profile.countryCodes?.map(code => getCountryData(code as TCountryCode).name)
    return country.join(', ')
  }
})

const showTooltip = computed(() => {
  if (props.profile?.countryCodes === undefined) return ''
  if (!props.profile?.countryCodes.length) return ''
  if (props.profile.countryCodes.length > 3) {
    return ''
  } else {
    return 'pointer-events: none'
  }
})

const projectObjectivesText = computed(() => {
  const objectives = props.projectObjectives
  if (objectives.length === 0) return ''
  const objectiveDescs = objectives?.map((obj) => {
    const objectiveType = objectiveTypes.find((o) => o.slug === obj)
    return objectiveType?.description ?? obj
  })
  return objectiveDescs?.join(', ')
})

</script>

<style lang="scss">
.tooltip_ml {
  margin-left: 3.4rem !important;
}
</style>
