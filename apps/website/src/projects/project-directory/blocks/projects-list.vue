<template>
  <aside>
    <ul>
      <li
        v-for="p in mockProjects"
        :key="p.id"
      >
        <p>{{ p.name }}</p>
        <p>{{ p.summary }}</p>
        <p>{{ p.objectives }}</p>
        <p>Rec: {{ p.noOfRecordings }}</p>
        <p>Species: {{ p.noOfSpecies }}</p>
      </li>
    </ul>
  </aside>
</template>

<script setup lang="ts">
import { rawDirectoryProjectsData } from '../data/rawDirectoryProjectsData'

const mockProjects = rawDirectoryProjectsData

</script>
