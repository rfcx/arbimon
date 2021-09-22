<template>
  <div id="comparison-filter-modal-component">
    <div
      id="select-project-modal"
      class="fixed inset-0 z-10 bg-mirage-grey bg-opacity-75 transition-opacity overflow-y-auto h-full w-full"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div class="flex justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <!-- This element is to trick the browser into centering the modal contents. -->
        <span
          class="hidden sm:inline-block sm:align-middle sm:h-screen"
          aria-hidden="true"
        />
        <div class="inline-block bg-steel-grey rounded text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          <div class="bg-steel-grey">
            <on-click-outside @trigger="close">
              <h1 class="text-xl text-white pt-4 pb-2 px-4 border-b-1">
                Build comparison
              </h1>
              <div class="flex flex-row min-h-lg">
                <!-- left menu bar -->
                <div class="border-r-1 min-w-30">
                  <div
                    v-for="(menu) in menus"
                    :key="'menu-' + menu.id"
                    class="text-white px-4 py-2 border-b-1"
                    :class="{ 'border-l-4 border-l-brand-primary': isCurrentActive(menu.id) }"
                    @click="setActiveMenuId(menu.id)"
                  >
                    {{ menu.name }}
                  </div>
                </div>
                <!-- right content -->
                <!-- site -->
                <div
                  v-if="currentActiveMenuId === menus[0].id"
                  class="w-full"
                >
                  <div class="search-stream-container w-full p-4">
                    <!-- TODO: 50 implement search logic -->
                    <input
                      id="search"
                      type="text"
                      placeholder="Search"
                      class="rounded-lg w-full bg-gray-200 focus:outline-none focus:bg-white focus:border-brand-primary hidden"
                    >
                  </div>
                  <div class="max-h-md overflow-auto">
                    <label
                      class="px-4 pb-2 align-middle list-item"
                    >
                      <input
                        type="radio"
                        class="rounded"
                        :checked="isSelectedAllSites"
                        @click="selectAllSites()"
                      >
                      <span class="text-white ml-2">All sites in the project</span>
                    </label>
                    <h2 class="text-primary px-4 pt-2 pb-4 border-t-1 border-grey">
                      Filter results from some sites only
                    </h2>
                    <label
                      v-for="(item) in streamCheckboxItems"
                      :key="'stream-list-' + item.stream.id"
                      class="px-4 pb-2 align-middle list-item"
                    >
                      <input
                        type="checkbox"
                        class="rounded"
                        :checked="item.check"
                        @click="updateSelectedStreams(item)"
                      >
                      <span class="text-white ml-2">{{ item.stream.name }}</span>
                    </label>
                  </div>
                </div>
                <div
                  v-else
                  class="p-4 flex"
                >
                  <div>
                    <label
                      class="text-white block"
                      for="start"
                    >
                      Start
                    </label>
                    <input
                      id="start"
                      v-model="startDate"
                      type="date"
                      :max="endDate || undefined"
                      class="rounded-lg mr-2"
                    >
                  </div>
                  <div>
                    <label
                      class="text-white block"
                      for="end"
                    >
                      End
                    </label>
                    <input
                      id="end"
                      v-model="endDate"
                      type="date"
                      :min="startDate || undefined"
                      :max="today"
                      class="rounded-lg mr-2"
                    >
                  </div>
                </div>
              </div>
              <div class="flex justify-end px-4 py-2 border-t-1">
                <button
                  class="btn mr-2"
                  @click="close"
                >
                  Cancel
                </button>
                <button
                  class="btn btn-primary"
                  @click="apply()"
                >
                  Apply
                </button>
              </div>
            </on-click-outside>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script src="./comparison-filter-modal.ts" lang="ts" />
