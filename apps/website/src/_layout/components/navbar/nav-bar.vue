<template>
  <nav class="bg-steel-grey">
    <div class="sm:(relative flex justify-between) items-center">
      <div class="justify-between flex-row relative flex items-center h-13">
        <div class="flex items-center">
          <mobile-menu-toggle-button
            v-model:isToggled="hasToggledMobileMenu"
            @toggle-mobile-menu="toggleMobileMenu()"
          />
          <router-link to="/">
            <div class="flex-shrink-0 flex items-center ml-4 mr-4 <sm:(mx-2)">
              <img
                class="h-9 w-9 <sm:(h-7 w-7)"
                src="/src/_services/assets/rfcx-logo.svg"
                alt="Rainforest Connection logo"
              >
              <div class="font-semibold text-primary ml-2 <md:hidden">
                <span :class="{ pride: isPride }">Arbimon</span>
              </div>
            </div>
          </router-link>
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
          v-for="(item, idx) in topLevelMenuItems"
          :key="'nav-menus-' + idx"
          :to="item.destination"
          class="navbar-item navbar-menu-item <sm:(h-10 justify-start pl-4)"
          :class="item.isParent ? 'router-link-needs-exact' : ''"
          @click="hasToggledMobileMenu = false"
        >
          {{ item.label }}
        </router-link>

        <el-dropdown
          :popper-options="{modifiers: [
            {
              name: 'offset',
              options: {
                offset: [0, 0],
              },
            },
          ],}"
        >
          <span class="navbar-item navbar-menu-item <sm:(h-10 justify-start pl-4)">
            Resources <icon-custom-angle-down class="ml-1 text-xs" />
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item
                v-for="(item, idx) in resourcesMenuItems"
                :key="'nav-menus-resources-' + idx"
              >
                <router-link
                  :to="item.destination"
                  @click="hasToggledMobileMenu = false"
                >
                  {{ item.label }}
                </router-link>
              </el-dropdown-item>
              <el-dropdown-item disabled>
                Forum
              </el-dropdown-item>
              <el-dropdown-item disabled>
                Publications
              </el-dropdown-item>
              <el-dropdown-item disabled>
                Newsroom
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>

      <div class="flex items-center mx-2 <sm:hidden">
        <auth-navbar-item-component dom-id="navbar-auth-desktop" />
      </div>
    </div>
  </nav>
  <nav
    v-if="isProjectLevel"
    class="bg-steel-grey-light"
  >
    <div class="sm:(relative flex justify-between) items-center">
      <div class="justify-between flex-row relative flex items-center h-13">
        <div class="flex items-center">
          <button
            v-if="store.projects.length > 0"
            class="navbar-item text-sm h-9 mx-2 px-4 sm:(hover:bg-steel-grey rounded-md cursor-pointer)"
            @click="toggleProjectSelector(true)"
          >
            <span class="max-w-48 truncate">{{ selectedProjectName }}</span>
            <icon-custom-angle-down class="ml-1 text-xs" />
          </button>
        </div>
      </div>
      <div
        class="flex-col sm:(flex-1 flex flex-row items-center) <sm:(border-t-box-grey border-t-1)"
        :class="hasToggledMobileMenu ? 'visible' : 'hidden' "
      >
        <router-link
          v-for="(item, idx) in projectMenuItems"
          :key="'nav-menus-' + idx"
          :to="item.destination"
          class="navbar-item navbar-menu-item <sm:(h-10 justify-start pl-4)"
          :class="item.isParent ? 'router-link-needs-exact' : ''"
          @click="hasToggledMobileMenu = false"
        >
          {{ item.label }}
        </router-link>
      </div>
    </div>
  </nav>
  <project-selector
    v-if="hasOpenedProjectSelector"
    @emit-close="toggleProjectSelector(false)"
  />
</template>
<script src="./nav-bar" lang="ts">
</script>
<style lang="scss">
.pride {
  background-image: linear-gradient(to right, rgb(255, 0, 0), rgb(255, 145, 0), rgb(255, 234, 0), rgb(0, 255, 0), rgb(0, 238, 255), rgb(30, 100, 255), rgb(200, 70, 255), rgb(255, 50, 255), rgb(255, 44, 104));
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
}
</style>
