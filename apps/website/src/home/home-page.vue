<template>
  <div
    class="page-container"
  >
    <navbar-component />
    <div class="max-w-screen-2xl mx-auto px-2 py-4 sm:px-6 lg:px-8">
      <div v-if="store.projects.length > 0">
        <h1 class="text-insight text-4xl capitalize">
          Recent projects
        </h1>
        <ul class="list-disc ml-6 mt-4">
          <li
            v-for="project in store.projects.slice(0, 10)"
            :key="project.id"
            class="mt-2"
          >
            <router-link
              :to="{ name: dashboardRoutename, params: { projectSlug: project.slug }}"
            >
              {{ project.name }}
            </router-link>
          </li>
        </ul>
      </div>
      <div
        v-else
        class="text-subtle"
      >
        Please login to view your projects!
      </div>
    </div>
  </div>
</template>
<script src="./home-page" lang="ts"></script>
