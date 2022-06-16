<template>
  <!-- ================= dynamic navbar ============== -->
  <navbar-component :is-report="false" />
  <!-- ================== page content =============== -->
  <div class="w-full">
    <div
      v-if="store.selectedProject"
      class="page_content lg:flex"
    >
      <Sidebar class="hidden lg:flex w-64 flex-initial items-stretch min-h-[calc(100vh-3.25rem)]" />
      <div class="w-full p-6">
        <router-view />
      </div>
    </div>
    <invalid-project-component v-else />
  </div>
</template>

<script setup lang="ts">

  import { useStoreOutsideSetup } from '../../_services/store'
  import InvalidProjectComponent from '../components/invalid-project/invalid-project.vue'
  import NavbarComponent from '../components/navbar/nav-bar.vue'
  import Sidebar from '../components/side-bar/side-bar.vue'

  const store = useStoreOutsideSetup()

</script>
