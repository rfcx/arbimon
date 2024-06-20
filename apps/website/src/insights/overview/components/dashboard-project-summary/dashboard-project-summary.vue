<template>
  <div>
    <h2 class="text-insight">
      Summary
    </h2>

    <div class="mb-6 border-b border-fog dark:border-fog">
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
            @click="stakeholdersTabContent"
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
        <!-- The loading status is just needed for the "About" section because it's the only section needed to show loading status for. -->
        <div
          class="lg:max-w-4xl relative"
          :class="isAboutTabEditing ? 'mx-auto pl-4 pb-4 pr-4 lg:max-w-4xl relative' : 'mx-auto lg:max-w-4xl relative'"
        >
          <DashboardMarkdownViewerEditor
            id="about"
            v-model:is-view-mored="isAboutTabViewMored"
            v-model:is-editing="isAboutTabEditing"
            :status="getProjectInfoStatus"
            :on-save-error-message="onAboutSaveErrorMessage"
            :raw-markdown-text="profile?.readme"
            :default-markdown-text="readmeDefault"
            :editable="canEdit"
            :is-project-member="isProjectMember"
            :is-viewing-as-guest="isViewingAsGuest"
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
        <div :class="isMethodsTabEditing ? 'mx-auto pl-4 pb-4 pr-4 lg:max-w-4xl relative' : 'mx-auto lg:max-w-4xl relative'">
          <DashboardMarkdownViewerEditor
            id="methods"
            v-model:is-view-mored="isMethodsTabViewMored"
            v-model:is-editing="isMethodsTabEditing"
            :status="getProjectInfoStatus"
            :on-save-error-message="onMethodsSaveErrorMessage"
            :raw-markdown-text="profile?.methods"
            :default-markdown-text="methodsDefault"
            :editable="canEdit"
            :is-project-member="isProjectMember"
            :is-viewing-as-guest="isViewingAsGuest"
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
        <div :class="isKeyResultTabEditing ? 'mx-auto pl-4 pb-4 pr-4 lg:max-w-4xl relative' : 'mx-auto lg:max-w-4xl relative'">
          <DashboardMarkdownViewerEditor
            id="key-result"
            v-model:is-view-mored="isKeyResultTabViewMored"
            v-model:is-editing="isKeyResultTabEditing"
            :status="getProjectInfoStatus"
            :on-save-error-message="onKeyResultSaveErrorMessage"
            :raw-markdown-text="profile?.keyResult"
            :default-markdown-text="keyResultDefault"
            :editable="canEdit"
            :is-project-member="isProjectMember"
            :is-viewing-as-guest="isViewingAsGuest"
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
          :editable="canEdit"
          :is-project-member="isProjectMember"
          :is-viewing-as-guest="isViewingAsGuest"
          :is-selected-tab="selectedStakeholdersTab"
        />
      </div>

      <div
        id="resources-tab-content"
        class="hidden rounded-lg"
        role="tabpanel"
        aria-labelledby="resources-tab-content"
      >
        <div :class="isResourcesTabEditing ? 'mx-auto pl-4 pb-4 pr-4 lg:max-w-4xl relative' : 'mx-auto lg:max-w-4xl relative'">
          <DashboardMarkdownViewerEditor
            id="resources"
            v-model:is-view-mored="isResourcesTabViewMored"
            v-model:is-editing="isResourcesTabEditing"
            :raw-markdown-text="profile?.resources"
            :on-save-error-message="onResourcesSaveErrorMessage"
            :status="getProjectInfoStatus"
            :default-markdown-text="resourcesDefault"
            :editable="canEdit"
            :is-project-member="isProjectMember"
            :is-viewing-as-guest="isViewingAsGuest"
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

import type { ProjectProfileUpdateBody } from '@rfcx-bio/common/api-bio/project/project-settings'

import { apiClientKey } from '@/globals'
import { useGetProjectInfo, useUpdateProjectSettings } from '@/projects/_composables/use-project-profile'
import { useStore } from '~/store'
import { useMarkdownEditorDefaults } from '../../composables/use-markdown-editor-defaults'
import DashboardMarkdownViewerEditor from './components/dashboard-markdown-viewer-editor.vue'
import DashboardProjectStakeholders from './components/dashboard-project-stakeholders/dashboard-project-stakeholders.vue'

defineProps<{ canEdit: boolean, isProjectMember: boolean, isViewingAsGuest: boolean }>()

const apiClientBio = inject(apiClientKey) as AxiosInstance
const { readme: readmeDefault, keyResult: keyResultDefault, resources: resourcesDefault, methods: methodsDefault } = useMarkdownEditorDefaults()

const isAboutTabViewMored = ref(false)
const isAboutTabEditing = ref(false)
const onAboutSaveErrorMessage = ref('')

const isMethodsTabViewMored = ref(false)
const isMethodsTabEditing = ref(false)
const onMethodsSaveErrorMessage = ref('')

const isKeyResultTabViewMored = ref(false)
const isKeyResultTabEditing = ref(false)
const onKeyResultSaveErrorMessage = ref('')

const isResourcesTabViewMored = ref(false)
const isResourcesTabEditing = ref(false)
const onResourcesSaveErrorMessage = ref('')

const selectedStakeholdersTab = ref(false)

const store = useStore()

const isEnabled = computed(() => {
  return isAboutTabEditing.value !== true || isMethodsTabEditing.value !== true || isKeyResultTabEditing.value !== true || isResourcesTabEditing.value !== true
})

const {
  status: getProjectInfoStatus,
  data: profile
} = useGetProjectInfo(
  apiClientBio,
  computed(() => store.project?.id ?? -1),
  ['readme', 'keyResults', 'resources', 'methods'],
  isEnabled
)

const { mutate: mutateProjectSettings } = useUpdateProjectSettings(apiClientBio, store.project?.id ?? -1)

const updateReadme = (value: string): void => {
  const update: ProjectProfileUpdateBody = {
    name: profile.value?.name ?? '',
    readme: value
  }
  mutateProjectSettings(update, {
    onSuccess: async () => {
      isAboutTabViewMored.value = value.length !== 0
      isAboutTabEditing.value = false
      onAboutSaveErrorMessage.value = ''
    },
    onError: async (e) => {
      onAboutSaveErrorMessage.value = e.message
      isAboutTabViewMored.value = true
      isAboutTabEditing.value = true
    }
  })
}

const updateKeyResult = (value: string): void => {
  const update: ProjectProfileUpdateBody = {
    name: profile.value?.name ?? '',
    keyResult: value
  }
  mutateProjectSettings(update, {
    onSuccess: async () => {
      isKeyResultTabViewMored.value = value.length !== 0
      isKeyResultTabEditing.value = false
      onKeyResultSaveErrorMessage.value = ''
    },
    onError: async (e) => {
      onKeyResultSaveErrorMessage.value = e.message
      isKeyResultTabViewMored.value = true
      isKeyResultTabEditing.value = true
    }
  })
}

const updateResources = (value: string): void => {
  const update: ProjectProfileUpdateBody = {
    name: profile.value?.name ?? '',
    resources: value
  }
  mutateProjectSettings(update, {
    onSuccess: async () => {
      isResourcesTabViewMored.value = value.length !== 0
      isResourcesTabEditing.value = false
      onResourcesSaveErrorMessage.value = ''
    },
    onError: async (e) => {
      console.info('lesgoooo someting wong')
      console.error(e)
      onResourcesSaveErrorMessage.value = e.message
      isResourcesTabViewMored.value = true
      isResourcesTabEditing.value = true
    }
  })
}

const stakeholdersTabContent = (): void => {
  selectedStakeholdersTab.value = true
}

const updateMethods = (value: string): void => {
  const update: ProjectProfileUpdateBody = {
    name: profile.value?.name ?? '',
    methods: value
  }
  mutateProjectSettings(update, {
    onSuccess: async () => {
      isMethodsTabViewMored.value = value.length !== 0
      isMethodsTabEditing.value = false
      onMethodsSaveErrorMessage.value = ''
    },
    onError: async (e) => {
      onMethodsSaveErrorMessage.value = e.message
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
  const t = new Tabs(document.getElementById('project-summary-tab'), tabs, options)
})

</script>
