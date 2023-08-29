<template>
  <nav
    class="px-4 lg:px-6 py-2.5 bg-echo border-b-4 border-b-frequency"
    :class="{'border-b-1 border-box-grey': !isReport}"
  >
    <div class="sm:(relative flex justify-between) items-center">
      <div class="justify-between flex-row relative flex items-center h-9">
        <div class="flex items-center">
          <mobile-menu-toggle-button
            v-model:isToggled="hasToggledMobileMenu"
            @toggle-mobile-menu="toggleMobileMenu()"
          />
          <router-link to="/">
            <div class="flex-shrink-0 flex items-center ml-4 <sm:(mx-2)">
              <img
                class="h-9 w-9 <sm:(h-7 w-7)"
                src="/src/_services/assets/arbimon-logo.svg"
                alt="Arbimon logo"
              >
              <div class="text-insight ml-2 <md:hidden font-display">
                <span class="<lg:hidden uppercase font-medium">Arbimon </span>
                <span :class="{ pride: isPride }">Insights</span>
                <sup
                  class="font-extralight"
                  style="font-size: 10px"
                >BETA</sup>
              </div>
            </div>
          </router-link>
          <button
            v-if="store.projects.length > 0"
            class="navbar-item text-sm h-9 mx-2 sm:(px-2 hover:bg-echo rounded-md cursor-pointer)"
            @click="toggleProjectSelector(true)"
          >
            <span class="max-w-48 truncate">{{ selectedProjectName }}</span>
            <icon-custom-angle-down class="ml-1 text-xs" />
          </button>
        </div>
        <div class="flex items-center mx-4 sm:hidden">
          <auth-navbar-item-component dom-id="navbar-auth-mobile" />
        </div>
      </div>
      <div
        class="flex-col sm:(flex-1 flex flex-row items-center) <sm:(border-t-box-grey border-t-1)"
        :class="hasToggledMobileMenu ? 'visible' : 'hidden' "
      >
        <router-link
          v-for="(item, idx) in navMenus"
          :key="'nav-menus-' + idx"
          :to="item.destination"
          class="navbar-item navbar-menu-item <sm:(h-10 justify-start pl-4)"
          :class="item.isParent ? 'router-link-needs-exact' : ''"
          @click="hasToggledMobileMenu = false"
        >
          {{ item.label }}
        </router-link>
        <a
          v-if="arbimonLink"
          :href="arbimonLink"
          class="navbar-item navbar-menu-item <sm:(h-10 justify-start pl-4)"
        >
          Arbimon
          <icon-custom-linkout class="text-xs ml-1" />
        </a>
      </div>
      <div class="flex items-center mx-2 <sm:hidden">
        <auth-navbar-item-component dom-id="navbar-auth-desktop" />
      </div>
    </div>
  </nav>
  <project-selector
    v-if="hasOpenedProjectSelector"
    @emit-close="toggleProjectSelector(false)"
  />
</template>
<script src="./nav-bar" lang="ts"></script>
<style lang="scss">
.pride {
  background-image: linear-gradient(to right, rgb(255, 0, 0), rgb(255, 145, 0), rgb(255, 234, 0), rgb(0, 255, 0), rgb(0, 238, 255), rgb(30, 100, 255), rgb(200, 70, 255), rgb(255, 50, 255), rgb(255, 44, 104));
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
}
</style>
