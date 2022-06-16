<template>
  <aside
    class="w-64 h-max border-r-1 border-box-grey bg-steel-grey"
    aria-label="Sidebar"
  >
    <div class="overflow-y-auto py-4 rounded">
      <ul class="space-y-2">
        <li>
          <router-link
            :to="{ name: ROUTE_NAMES.cnnJobList }"
          >
            <a
              href="#"
              class="flex items-center p-4"
            >
              <span>Convolutional Neural Network (CNN)</span>
            </a>
          </router-link>
        </li>
        <li>
          <a
            :href="`${arbimonLink}/analysis/patternmatching`"
            class="flex items-center p-4"
          >
            <span>Pattern Matching</span>
          </a>
        </li>
        <li>
          <a
            :href="`${arbimonLink}/analysis/random-forest-models`"
            class="flex items-center p-4"
          >
            <span>Random Forest Models</span>
          </a>
        </li>
        <li>
          <a
            :href="`${arbimonLink}/analysis/soundscapes`"
            class="flex items-center p-4"
          >
            <span>Soundscape analysis</span>
          </a>
        </li>
      </ul>
    </div>
  </aside>
</template>

<script setup lang="ts">
  import { computed } from 'vue'

  import { ROUTE_NAMES } from '~/router'
  import { useStoreOutsideSetup } from '~/store'

  const store = useStoreOutsideSetup()

  // TODO: pass the link / nav menus in as props
  const arbimonLink = computed(() => {
    const selectedProjectSlug = store.selectedProject?.slug
    if (selectedProjectSlug === undefined) return ''
    else return `${import.meta.env.VITE_ARBIMON_BASE_URL}/project/${selectedProjectSlug}`
  })
</script>
