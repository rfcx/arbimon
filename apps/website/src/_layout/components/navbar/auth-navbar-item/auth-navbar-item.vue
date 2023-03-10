<template>
  <div
    v-if="!store.user"
    class="flex items-center"
  >
    <button
      class="text-gray-800 dark:text-white hover:bg-gray-50 focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-4 lg:px-5 py-2 lg:py-2.5 mr-2 dark:hover:bg-gray-700 focus:outline-none dark:focus:ring-gray-800"
      @click="login"
    >
      Log in
    </button>
    <button
      class="text-white bg-primary hover:bg-primary-dark focus:ring-4 focus:ring-primary-300 font-medium rounded-lg text-sm px-4 lg:px-5 py-2 lg:py-2.5 mr-2 dark:bg-primary-light dark:hover:bg-primary focus:outline-none dark:focus:ring-primary-800"
      @click="signup"
    >
      Sign up
    </button>
  </div>
  <div
    v-else
    class="flex"
    aria-expanded="true"
    aria-haspopup="true"
  >
    <!-- <version-control v-if="isProjectMember" class="mr-2" /> -->
    <div
      :id="domId"
      type="button"
      class="hover:cursor-pointer focus:cursor-pointer group"
    >
      <img
        class="h-8 w-8 rounded-full"
        :src="userImage"
      >
      <ul
        :aria-labelledby="domId"
        aria-orientation="vertical"
        class="logout-dropdown absolute top-13 right-1 z-50 min-w-40 border-t-box-grey border-t-1 bg-steel-grey rounded-b-md text-primary invisible group-hover:visible focus:outline-none transition-all"
        role="menu"
        tabindex="-1"
      >
        <li
          class="p-4 rounded-b-md hover:(bg-box-grey cursor-pointer)"
          @click="logout"
        >
          Sign out
        </li>
      </ul>
    </div>
  </div>
</template>

<script src="./auth-navbar-item.ts" lang="ts"></script>
