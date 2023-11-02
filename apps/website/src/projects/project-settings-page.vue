<template>
  <div>Project settings</div>
  <div class="grid lg:grid-cols-2 max-w-screen-2xl gap-4">
    <div>
      <project-form existing-name="tes" />
      <!-- TODO: add project summary -->
    </div>
    <div class="">
      <project-objective-form :existing-objectives="MOCK_OBJECTIVES" />
    </div>
  </div>
</template>
<script setup lang="ts">
import ProjectForm from './components/form/project-form.vue'
import ProjectObjectiveForm from './components/form/project-objective-form.vue'
import { masterOjectiveTypes } from './types'

// TODO: fetch project info for settings (start-end date, project summary, project objectives)

const MOCK_OBJECTIVES = [masterOjectiveTypes.BioBaseline.slug, masterOjectiveTypes.MonitorSpecies.slug, 'Blah blah']
</script>
