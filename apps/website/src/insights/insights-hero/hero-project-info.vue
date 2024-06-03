<template>
  <div
    v-if="!isDataAvailable"
    class="text-insight text-sm"
  >
    It seems the section didn’t load as expected. Please refresh your browser to give it another go.
  </div>
  <div
    v-else
    class="my-4 flex gap-2 font-display text-insight text-sm flex-wrap"
  >
    <div
      class="flex flex-row items-center font-display text-sm"
    >
      <icon-custom-ic-loading
        v-if="isLoadingProfile"
        class="animate-spin"
        aria-label="Loading"
      />
      <div
        v-if="profile?.countryCodes !== undefined && profile.countryCodes.length > 0"
        class="flex flex-row items-center"
      >
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
          class="align-baseline flex"
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
    </div>
    <div
      class="flex flex-row border-l-2 border-util-gray-01 pl-2 space-x-2 items-center"
    >
      <span>Project dates:</span>
      <span>{{ formatDateRange(profile?.dateStart) }}</span>
      <icon-custom-arrow-right-white />
      <span>{{ formatDateRange(profile?.dateEnd) }}</span>
    </div>
    <div
      class="border-l-2 border-util-gray-01 pl-2"
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

import { type ProjectSettingsResponse } from '@rfcx-bio/common/api-bio/project/project-settings'

import { masterObjectiveTypes } from '../../projects/types'

const props = defineProps<{
  isLoadingProfile: boolean,
  projectObjectives: string[],
  profile: ProjectSettingsResponse | undefined
}>()
const formatDateRange = (date: Date | null | undefined): string => {
  if (!dayjs(date).isValid()) return 'Present'
  else return dayjs(date).format('D/M/YYYY')
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
  const objectives = props.profile?.objectives ?? []
  if (objectives.length === 0) return 'No data'
  const objectiveDescs = objectives?.map((obj) => {
    const objectiveType = Object.values(masterObjectiveTypes).find((o) => o.slug === obj)
    return objectiveType?.description ?? obj
  })
  return objectiveDescs?.join(', ')
})

const isDataAvailable = computed(() => {
  return (
    (props.profile?.countryCodes && props.profile.countryCodes.length > 0) ||
    (props.profile?.dateStart !== null && props.profile?.dateEnd !== null) ||
    (props.profile.objectives.length > 0)
  )
})

</script>

<style lang="scss">
.tooltip_ml {
  margin-left: 3.4rem !important;
}
</style>
