<template>
  <div
    class="page-container"
  >
    <navbar-component />
    <div class="max-w-screen-2xl mx-auto px-2 py-4 sm:px-6 lg:px-8">
      <div>
        <h1 class="text-white text-2xl capitalize">
          Explore
        </h1>
        <ul class="list-disc ml-6 mt-4">
          <li class="mt-2">
            Work
          </li>
          <li class="mt-2">
            To
          </li>
          <li class="mt-2">
            Do
          </li>
          <li class="mt-2">
            Here
          </li>
        </ul>
      </div>
      <div v-if="store.projects.length > 0">
        <h1 class="text-white text-2xl capitalize">
          Recently viewed projects
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
    </div>
  </div>
</template>
<script src="./explore-page" lang="ts"></script>
