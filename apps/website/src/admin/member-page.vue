<template>
  <div class="px-4 sm:px-6 py-8 lg:(pt-6 px-20) bg-white dark:bg-pitch">
    <div class="mx-auto max-w-screen-xl">
      <div class="mt-20 text-sm">
        <router-link
          :to="`/admin`"
          class="font-medium"
        >
          Projects
        </router-link> /
        <span class="text-fog"> Arbimon 2024 </span>
      </div>
      <h2 class="mt-2 mb-10">
        Manage project members
      </h2>
      <member-list />
    </div>
  </div>
</template>

<script setup lang="ts">
import MemberList from './components/member-list.vue'
</script>
