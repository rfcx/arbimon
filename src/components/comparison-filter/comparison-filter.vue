<template>
  <div id="comparison-filter-component">
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
              <div class="text-lg text-white uppercase pt-4 pb-2 px-4 border-b-1">
                Build comparison
              </div>
              <div class="flex flex-row min-h-lg">
                <div class="border-r-1 min-w-30">
                  <div
                    v-for="(item, idx) in menus"
                    :key="'menu-' + idx"
                    class="text-white uppercase px-4 py-2 border-b-1"
                    :class="{ 'border-l-4 border-l-brand-primary': isCurrentActivate(item.id) }"
                    @click="setActivateMenuId(item.id)"
                  >
                    {{ item.name }}
                  </div>
                </div>
                <div
                  v-if="currentActivateMenuId === menus[0].id"
                  class="w-full"
                >
                  <div class="search-stream-container w-full p-4">
                    <input
                      id="search"
                      type="text"
                      placeholder="SEARCH"
                      class="rounded-lg w-full bg-gray-200 focus:outline-none focus:bg-white focus:border-brand-primary"
                    >
                  </div>
                  <div
                    v-for="(item, idx) in streams"
                    :key="'stream-list-' + idx"
                    class="px-4 pb-4 align-middle"
                  >
                    <input
                      :id="item.stream.id"
                      type="checkbox"
                      class="rounded"
                      :checked="item.check"
                      @click="updateSelectedStreams(item)"
                    >
                    <label
                      class="text-white ml-2"
                      :for="item.stream.id"
                    >
                      {{ item.stream.name }}
                    </label>
                  </div>
                </div>
                <div
                  v-else
                  class="p-4 flex"
                >
                  <div>
                    <label
                      class="text-white uppercase block"
                      for="start"
                    >
                      Start
                    </label>
                    <input
                      id="start"
                      v-model="startDate"
                      type="date"
                      :max="endDate"
                      class="rounded-lg mr-2"
                    >
                  </div>
                  <div>
                    <label
                      class="text-white uppercase block"
                      for="end"
                    >
                      End
                    </label>
                    <input
                      id="end"
                      v-model="endDate"
                      type="date"
                      :min="startDate"
                      :max="today"
                      class="rounded-lg mr-2"
                    >
                  </div>
                </div>
              </div>
              <div class="flex justify-end px-4 py-2 border-t-1">
                <button
                  class="btn uppercase mr-2"
                  @click="close"
                >
                  cancel
                </button>
                <button
                  class="btn btn-primary uppercase"
                  :class="{'opacity-50 cursor-not-allowewd': disabled}"
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
<script src="./comparison-filter.ts" lang="ts" />
