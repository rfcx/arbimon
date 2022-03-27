<template>
  <el-select
    v-model="selectedVersion"
    size="small"
    round
  >
    <template #prefix>
      <div
        class="rounded-1 w-2 h-2"
        :class="selectedVersion.colorClass"
      />
    </template>
    <el-option
      v-for="version in versions"
      :key="'version-selector-' + version.value"
      :label="version.label"
      :value="version"
      :disabled="version.disabled"
    >
      <div class="flex items-center ">
        <div
          class="rounded-1 w-2 h-2"
          :class="version.colorClass"
        />
        <div
          class="ml-2 text-white font-normal"
          :class="version.disabled ? 'text-subtle' : '' "
        >
          {{ version.label }}
        </div>
        <div
          v-if="selectedVersion.value === version.value"
          class="ml-auto"
        >
          <icon-fa-check class="text-xxs text-white" />
        </div>
      </div>
    </el-option>
  </el-select>
</template>
<script lang="ts" setup>
import { ref } from 'vue'

const versions = [
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

const selectedVersion = ref(versions[0])

</script>
