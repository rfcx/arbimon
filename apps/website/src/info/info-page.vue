<template>
  <div class="page-container">
    <navbar-component />
    <!-- ====== Page content size related to project root ===== -->
    <div class="max-w-screen-2xl mx-auto px-2 py-4 sm:px-6 lg:px-8">
      <div class="grid gap-4 grid-cols-8">
        <div class="col-span-1">
          <div
            v-for="item in information"
            :key="'info-ref-' + item.slug"
            class="py-2 px-1 border-b hover:(cursor-pointer bg-steel-grey)"
            @click="onSelectedInfo(item.slug)"
          >
            <div :class="{ 'text-brand-primary': selectedInfo === item.slug }">
              {{ item.title }}
            </div>
          </div>
        </div>
        <div class="col-span-7">
          <div class="text-2xl">
            {{ currentContent?.title }}
          </div>
          <p class="mt-2 whitespace-pre-line">
            {{ currentContent?.content }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts" src="./info-page.ts"></script>
