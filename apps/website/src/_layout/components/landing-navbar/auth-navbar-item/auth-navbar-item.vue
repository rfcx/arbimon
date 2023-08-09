<template>
  <div
    v-if="!store.user"
    class="flex items-center"
  >
    <button
      class="text-gray-800 font-display dark:text-insight px-4 lg:px-5 py-1.5 lg:py-2 mr-2 dark:hover:text-frequency hidden md:block"
      @click="login"
    >
      Log in
    </button>
    <button
      class="btn btn-primary"
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
        class="logout-dropdown absolute top-13 right-1 z-50 min-w-40 bg-moss rounded-lg text-insight hover:text-frequency invisible group-hover:visible focus:outline-none transition-all"
        role="menu"
        tabindex="-1"
      >
        <li
          class="p-4 rounded-lg hover:(bg-moss cursor-pointer)"
          @click="logout"
        >
          Sign out
        </li>
      </ul>
    </div>
  </div>
</template>

<script src="./auth-navbar-item.ts" lang="ts"></script>
