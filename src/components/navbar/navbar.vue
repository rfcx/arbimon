<template>
  <div class="navbar">
    <nav class="bg-steel-grey">
      <div class="relative flex items-center justify-between h-13">
        <router-link to="/">
          <div class="flex-shrink-0 flex items-center mx-4">
            <img
              class="h-9"
              src="/src/assets/rfcx-logo.svg"
              alt="Rainforest connection logo"
            >
            <div class="font-semibold text-primary">
              Biodiversity Analytics
            </div>
          </div>
        </router-link>
        <div class="flex-1 flex items-center space-x-4">
          <router-link
            v-for="(item, idx) in navMenus"
            :key="'nav-menus-' + idx"
            :to="item.routerPath"
            class="box-content navbar-item text-primary align-middle flex items-center justify-center h-13 px-2"
          >
            <span class="text-primary">
              {{ item.label }}
            </span>
          </router-link>
        </div>
        <div class="flex items-center mx-4">
          <button
            v-if="!isAuthenticated"
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
                :src="user.picture"
              >
              <ul
                class="logout-dropdown absolute top-13 right-1 z-50 min-w-40 border-t-box-grey border-t-2 bg-steel-grey rounded-b-md text-primary invisible group-hover:visible focus:outline-none transition-all"
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
          <div />
        </div>
      </div>
    </nav>
  </div>
</template>
<script src="./navbar.ts" lang="ts" />
