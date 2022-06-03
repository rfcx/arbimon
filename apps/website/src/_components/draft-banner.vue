<template>
  <modal-popup
    v-if="publishOptionModalOpen"
    name="Publish Options"
    @emit-close="onClosePublishModalOptions"
  >
    <div class="p-4 m-4">
      <div class="text-white text-xl pb-2">
        Publish Options
      </div>
      <div class="mt-4 mb-4 text-white text-lg">
        Who can see the report?
        <div>
          <el-radio
            v-model="accessbililyOption"
            label="Any one with link"
          />
          <el-radio
            v-model="accessbililyOption"
            label="Only Project members"
          />
        </div>
      </div>

      <div class="mt-4 mb-4 text-white text-lg">
        Protected Datasource
        <div>
          <el-checkbox
            v-model="secureOption.allowDownload"
            label="Allow Download Datasource"
            size="large"
          />
          <el-checkbox
            v-model="secureOption.linkArbimon"
            label="Allow to link to Arbimon project"
            size="large"
          />
        </div>
      </div>
      <div class="flex justify-end mt-2">
        <button
          class="btn mr-2"
          @click="onClosePublishModalOptions"
        >
          Cancel
        </button>
        <button
          class="btn btn-primary ${updating ? 'opacity-50 cursor-not-allowed' : '' }"
        >
          Select
        </button>
      </div>
    </div>
  </modal-popup>
  <div
    v-if="isDraftMode"
    class="draft_banner"
  >
    <div class="draft_content">
      <div class="draft-title text-lg">
        <div
          class="bullet rounded-full w-2.5 h-2.5 mx-2 mr-2 self-center"
        />
        <router-link
          :to="syncHistoryRoute"
          class="inline hover:(text-subtle cursor-pointer)"
        >
          Latest Date ({{ props.currentMode }})
        </router-link>
      </div>
      <div class="draft-description">
        <p
          v-if="props.syncUpdated"
          class="text-s"
        >
          Last generated based on validated analysis data from Arbimon at: {{ formatDateFull(props.syncUpdated) }}
        </p>
        <p>
          <router-link
            to=""
            class="inline underline hover:(underline text-subtle cursor-pointer)"
          >
            Datasource Options
          </router-link>
        </p>
      </div>
    </div>
    <div
      class="draft_button btn btn-primary self-center"
      @click="onOpenPublishModalOptions"
    >
      PUBLISH
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref, withDefaults } from 'vue'

import useDateFormat from '../_services/hooks/use-date-format'
import ModalPopup from './modal-popup.vue'

// How many mode do we have?
enum currentMode {
  DRAFT = 'Draft',
  PUBLISHED = 'Published'
}

interface Props {
  currentMode: string
  syncUpdated: Date | string | null
  projectSlug: string
}

const props = withDefaults(defineProps<Props>(), {
  currentMode: 'Published'
})

const { formatDateFull } = useDateFormat()
const publishOptionModalOpen = ref(false)
const accessbililyOption = ref(true)
const secureOption = reactive({ allowDownload: true, linkArbimon: true })

// To display only in Draft mode
const isDraftMode = computed(() => props.currentMode === currentMode.DRAFT)

const syncHistoryRoute = computed(() => ({ name: 'sync_history', params: { projectSlug: props.projectSlug } }))

const onOpenPublishModalOptions = () => {
  publishOptionModalOpen.value = true
}

const onClosePublishModalOptions = () => {
  publishOptionModalOpen.value = false
}

</script>

<style lang="scss">
.draft_banner {
  display: flex;
  justify-content: space-between;
  padding: 1rem;
  margin-bottom: 1rem;
  border: 3px solid #FFCD00;
  background-color: rgba(255, 205, 0, 0.3);
  border-radius: 0.75rem;

  @media (max-width: 820px) {
    flex-direction: column;
    .draft_button {
      align-self: end;
    }
  }

  .draft_content {
    .draft-title {
      display: flex;
      margin-bottom: .25rem;

      .bullet {
        display: inline-block;
        background-color: #FFCD00;
      }
    }
  }
}
</style>
