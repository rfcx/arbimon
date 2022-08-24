<template>
  <div class="flex flex-row items-center">
    <div
      v-for="filter in jobResultFilters"
      :key="'job-result-filter-' + filter.label"
      class="ml-6"
    >
      <el-dropdown>
        <span class="flex items-center text-sm text-subtle">
          {{ filter.label }}
          <icon-fa-chevron-down class="ml-2 text-xxs" />
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item
              v-for="(item, idx) in filter.items"
              :key="'job-result-filter-item-' + filter.label + idx"
            >
              {{ item.label }}
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
    <div class="display-controls ml-6">
      <button class="btn btn-icon rounded-r-none">
        <icon-fa-bars class="text-xs" />
      </button>
      <button class="btn btn-icon border-l-2 rounded-l-none">
        <icon-fa-th-large class="text-xs" />
      </button>
    </div>
  </div>
</template>
<script setup lang="ts">

const jobResultFilters = [
  {
    label: 'Threshold ≥ 0.5',
    items: [
      {
        label: '> 0.5',
        value: '> 0.5'
      }
    ]
  },
  {
    label: 'Validation status',
    items: [
      {
        label: 'Confirmed',
        value: 1
      },
      {
        label: 'Rejected',
        value: -1
      },
      {
        label: 'Unvalidate',
        value: 0
      }
    ]
  },
  {
    label: 'Class',
    items: [
      {
        label: 'Dog',
        value: 'dog'
      }
    ]
  },
  {
    label: 'Site',
    items: [
      {
        label: 'PPP',
        value: 'ppp'
      }
    ]
  },
  {
    label: 'Sort by score',
    items: [
      {
        label: 'Low to high',
        value: 'High to low'
      }
    ]
  }
]

</script>
