<template>
  <div>
    <h2 class="text-insight">
      Summary
    </h2>

    <div class="mb-4 border-b border-fog dark:border-fog">
      <ul
        id="project-summary-tab"
        class="flex -mb-px text-sm font-medium text-center"
        data-tabs-toggle="#project-summary-tab-content"
        role="tablist"
      >
        <li
          class="flex-1"
          role="presentation"
        >
          <button
            id="about-tab"
            class="block w-full p-4 border-b-2 rounded-t-lg text-base"
            data-tabs-target="#about-tab-content"
            type="button"
            role="tab"
            aria-controls="about"
            aria-selected="false"
          >
            About
          </button>
        </li>
        <li
          class="flex-1"
          role="presentation"
        >
          <button
            id="methods-tab"
            class="block w-full p-4 border-b-2 rounded-t-lg text-base"
            data-tabs-target="#methods-tab-content"
            type="button"
            role="tab"
            aria-controls="methods"
            aria-selected="false"
          >
            Methods
          </button>
        </li>
        <li
          class="flex-1"
          role="presentation"
        >
          <button
            id="key-results-tab"
            class="block w-full p-4 border-b-2 rounded-t-lg text-base"
            data-tabs-target="#key-results-tab-content"
            type="button"
            role="tab"
            aria-controls="key-results"
            aria-selected="false"
          >
            Key results
          </button>
        </li>
        <li
          class="flex-1"
          role="presentation"
        >
          <button
            id="stakeholders-tab"
            class="block w-full p-4 border-b-2 rounded-t-lg text-base"
            data-tabs-target="#stakeholders-tab-content"
            type="button"
            role="tab"
            aria-controls="stakeholders"
            aria-selected="false"
          >
            Stakeholders
          </button>
        </li>
        <li
          class="flex-1"
          role="presentation"
        >
          <button
            id="resources-tab"
            class="block w-full p-4 border-b-2 rounded-t-lg text-base"
            data-tabs-target="#resources-tab-content"
            type="button"
            role="tab"
            aria-controls="resources"
            aria-selected="false"
          >
            Resources
          </button>
        </li>
      </ul>
    </div>

    <div id="project-summary-tab-content">
      <div
        id="about-tab-content"
        class="rounded-lg"
        role="tabpanel"
        aria-labelledby="about-tab-content"
      >
        <svg
          v-if="isLoading"
          xmlns="http://www.w3.org/2000/svg"
          xmlns:xlink="http://www.w3.org/1999/xlink"
          class="block bg-none w-8 h-8 mx-auto mt-6"
          style="shape-rendering: auto;"
          viewBox="0 0 100 100"
          preserveAspectRatio="xMidYMid"
        >
          <circle
            cx="50"
            cy="50"
            fill="none"
            stroke="#d9d9d9"
            stroke-width="10"
            r="35"
            stroke-dasharray="164.93361431346415 56.97787143782138"
          >
            <animateTransform
              attributeName="transform"
              type="rotate"
              repeatCount="indefinite"
              dur="1s"
              values="0 50 50;360 50 50"
              keyTimes="0;1"
            />
          </circle>
        </svg>

        <div
          v-else
          class="mx-auto p-4 lg:max-w-4xl relative"
        >
          <DashboardMarkdownViewerEditor
            id="about"
            v-model:is-view-mored="isAboutTabViewMored"
            v-model:is-editing="isAboutTabEditing"
            :editable="canEdit"
            :raw-markdown-text="dashboardContent?.readme"
            :default-markdown-text="readmeDefault"
            @on-editor-close="updateReadme"
          />
        </div>
      </div>

      <div
        id="methods-tab-content"
        class="hidden rounded-lg"
        role="tabpanel"
        aria-labelledby="methods-tab-content"
      >
        <div class="mx-auto p-4 lg:max-w-4xl relative">
          <DashboardMarkdownViewerEditor
            id="methods"
            v-model:is-view-mored="isMethodsTabViewMored"
            v-model:is-editing="isMethodsTabEditing"
            :editable="canEdit"
            :raw-markdown-text="dashboardContent?.methods"
            :default-markdown-text="methodsDefault"
            @on-editor-close="updateMethods"
          />
        </div>
      </div>

      <div
        id="key-results-tab-content"
        class="hidden rounded-lg"
        role="tabpanel"
        aria-labelledby="key-results-tab-content"
      >
        <div class="mx-auto p-4 lg:max-w-4xl relative">
          <DashboardMarkdownViewerEditor
            id="key-result"
            v-model:is-view-mored="isKeyResultTabViewMored"
            v-model:is-editing="isKeyResultTabEditing"
            :editable="canEdit"
            :raw-markdown-text="dashboardContent?.keyResult"
            :default-markdown-text="keyResultDefault"
            @on-editor-close="updateKeyResult"
          />
        </div>
      </div>

      <div
        id="stakeholders-tab-content"
        class="hidden rounded-lg"
        role="tabpanel"
        aria-labelledby="stakeholders-tab-content"
      >
        <DashboardProjectStakeholders
          :organizations="stakeholders?.organization ?? []"
          :editable="true"
        />
      </div>

      <div
        id="resources-tab-content"
        class="hidden rounded-lg"
        role="tabpanel"
        aria-labelledby="resources-tab-content"
      >
        <div class="mx-auto p-4 lg:max-w-4xl relative">
          <DashboardMarkdownViewerEditor
            id="resources"
            v-model:is-view-mored="isResourcesTabViewMored"
            v-model:is-editing="isResourcesTabEditing"
            :editable="canEdit"
            :raw-markdown-text="dashboardContent?.resources"
            :default-markdown-text="resourcesDefault"
            @on-editor-close="updateResources"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { type AxiosInstance } from 'axios'
import { type TabItem, type TabsOptions, Tabs } from 'flowbite'
import { computed, inject, onMounted, ref } from 'vue'

import { apiClientBioKey } from '@/globals'
import { useStore } from '~/store'
import { useGetDashboardContent } from '../../composables/use-get-dashboard-content'
import { useGetDashboardStakeholders } from '../../composables/use-get-dashboard-stakeholders'
import { useMarkdownEditorDefaults } from '../../composables/use-markdown-editor-defaults'
import { useUpdateDashboardKeyResult } from '../../composables/use-update-dashboard-key-result'
import { useUpdateDashboardMethods } from '../../composables/use-update-dashboard-methods'
import { useUpdateDashboardReadme } from '../../composables/use-update-dashboard-readme'
import { useUpdateDashboardResources } from '../../composables/use-update-dashboard-resources'
import DashboardMarkdownViewerEditor from './components/dashboard-markdown-viewer-editor.vue'
import DashboardProjectStakeholders from './components/dashboard-project-stakeholders/dashboard-project-stakeholders.vue'

defineProps<{ canEdit: boolean }>()

const apiClientBio = inject(apiClientBioKey) as AxiosInstance
const { readme: readmeDefault, keyResult: keyResultDefault, resources: resourcesDefault, methods: methodsDefault } = useMarkdownEditorDefaults()

const isAboutTabViewMored = ref(false)
const isAboutTabEditing = ref(false)

const isMethodsTabViewMored = ref(false)
const isMethodsTabEditing = ref(false)

const isKeyResultTabViewMored = ref(false)
const isKeyResultTabEditing = ref(false)

const isResourcesTabViewMored = ref(false)
const isResourcesTabEditing = ref(false)

const store = useStore()

const isEnabled = computed(() => {
  return isAboutTabEditing.value !== true || isKeyResultTabEditing.value !== true || isResourcesTabEditing.value !== true
})

const { data: stakeholders } = useGetDashboardStakeholders(apiClientBio, store.selectedProject?.id ?? -1)

const { isLoading, data: dashboardContent } = useGetDashboardContent(
  apiClientBio,
  store.selectedProject?.id ?? -1,
  isEnabled
)

const { mutate: mutateReadme } = useUpdateDashboardReadme(apiClientBio, store.selectedProject?.id ?? -1)
const { mutate: mutateKeyResult } = useUpdateDashboardKeyResult(apiClientBio, store.selectedProject?.id ?? -1)
const { mutate: mutateResources } = useUpdateDashboardResources(apiClientBio, store.selectedProject?.id ?? -1)
const { mutate: mutateMethods } = useUpdateDashboardMethods(apiClientBio, store.selectedProject?.id ?? -1)

const updateReadme = (value: string): void => {
  mutateReadme(value, {
    onSuccess: () => {
      isAboutTabViewMored.value = true
      isAboutTabEditing.value = false
    },
    onError: () => {
      isAboutTabViewMored.value = true
      isAboutTabEditing.value = true
    }
  })
}

const updateKeyResult = (value: string): void => {
  mutateKeyResult(value, {
    onSuccess: () => {
      isKeyResultTabViewMored.value = true
      isKeyResultTabEditing.value = false
    },
    onError: () => {
      isKeyResultTabViewMored.value = true
      isKeyResultTabEditing.value = true
    }
  })
}

const updateResources = (value: string): void => {
  mutateResources(value, {
    onSuccess: () => {
      isResourcesTabViewMored.value = true
      isResourcesTabEditing.value = false
    },
    onError: () => {
      isResourcesTabViewMored.value = true
      isResourcesTabEditing.value = true
    }
  })
}

const updateMethods = (value: string): void => {
  mutateMethods(value, {
    onSuccess: () => {
      isMethodsTabViewMored.value = true
      isMethodsTabEditing.value = false
    },
    onError: () => {
      isMethodsTabViewMored.value = true
      isResourcesTabEditing.value = true
    }
  })
}

onMounted(() => {
   const tabs: TabItem[] = [
    {
      id: 'about-tab',
      // these will work as intended under onMounted.
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      triggerEl: document.querySelector('#about-tab')!,
      // these will work as intended under onMounted.
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      targetEl: document.querySelector('#about-tab-content')!
    },
    {
      id: 'methods-tab',
      // these will work as intended under onMounted.
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      triggerEl: document.querySelector('#methods-tab')!,
      // these will work as intended under onMounted.
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      targetEl: document.querySelector('#methods-tab-content')!
    },
    {
      id: 'key-results-tab',
      // these will work as intended under onMounted.
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      triggerEl: document.querySelector('#key-results-tab')!,
      // these will work as intended under onMounted.
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      targetEl: document.querySelector('#key-results-tab-content')!
    },
    {
      id: 'stakeholders-tab',
      // these will work as intended under onMounted.
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      triggerEl: document.querySelector('#stakeholders-tab')!,
      // these will work as intended under onMounted.
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      targetEl: document.querySelector('#stakeholders-tab-content')!
    },
    {
      id: 'resources-tab',
      // these will work as intended under onMounted.
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      triggerEl: document.querySelector('#resources-tab')!,
      // these will work as intended under onMounted.
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      targetEl: document.querySelector('#resources-tab-content')!
    }
  ]

  const options: TabsOptions = {
    defaultTabId: 'about-tab',
    activeClasses: 'border-frequency text-frequency hover:text-frequency dark:text-frequency dark:hover:text-frequency',
    inactiveClasses: 'border-stone-200 text-white hover:text-gray-500 dark:text-white dark:hover:text-gray-500'
  }

  /* eslint-disable no-unused-vars */
  /* eslint-disable @typescript-eslint/no-unused-vars */
  const t = new Tabs(tabs, options)
})
</script>
