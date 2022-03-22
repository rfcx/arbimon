<template>
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
          Last generated based on validated analysis data from Arbimon at: {{ formatFullDate(props.syncUpdated) }}
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
      @click="publish"
    >
      PUBLISH
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, defineProps, withDefaults } from 'vue'

import useDateFormat from '../_services/hooks/use-date-format'

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
const { formatFullDate } = useDateFormat()

// To display only in Draft mode
const isDraftMode = computed(() => props.currentMode === currentMode.DRAFT)

const syncHistoryRoute = computed(() => ({ name: 'sync_history', params: { projectSlug: props.projectSlug } }))

const publish = () => {}

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
