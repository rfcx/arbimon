<template>
  <button
    v-if="!auth?.isAuthenticated"
    class="btn btn-primary"
    @click="login"
  >
    Sign In
  </button>
  <div
    v-else
    class="flex flex-row"
    aria-expanded="true"
    aria-haspopup="true"
  >
    <div
      id="avatar-button"
      type="button"
      class="hover:cursor-pointer focus:cursor-pointer group"
    >
      <img
        class="h-8 w-8 rounded-full"
        :src="userImage"
      >
      <ul
        class="logout-dropdown absolute top-13 right-1 z-50 min-w-40 border-t-box-grey border-t-1 bg-steel-grey rounded-b-md text-primary invisible group-hover:visible focus:outline-none transition-all"
        role="menu"
        aria-orientation="vertical"
        aria-labelledby="avatar-button"
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

<script src="./auth-navbar-item.ts" lang="ts" />
