import { ROUTE_NAMES } from '~/router';

<template>
  <section class="bg-white dark:bg-echo">
    <div class="text-center px-8 mt-20">
      <h2 class="mb-4 text-2xl md:text-3xl lg:text-4xl tracking-tight font-medium text-gray-900 dark:text-white">
        What we do
      </h2>
      <p class="mb-6 text-gray-500 md:text-lg dark:text-gray-400 mt-6 max-w-3xl mx-auto text-lg">
        At Arbimon, our mission is to empower scientists and conservationists with innovative AI-powered ecoacoustic tools and data-driven insights to better understand and protect the world's biodiversity.
      </p>
    </div>
    <div class="flex flex-col gap-2 lg:flex-row py-4 px-4 items-center mx-auto max-w-screen-xl gap-2 lg:py-8 lg:px-6">
      <div class="w-full max-w-240 lg:w-168 xl:w-200">
        <div class="p-4">
          <h3 class="mb-2 text-md font-medium">
            The platform
          </h3>
          <p class="mb-4">
            Arbimon is an open-source ecoacoustic analysis platform empowering scientists and conservationists with an efficient way to upload, store, and analyze mass amounts of acoustic data, enabling the ability to derive insights about the ecosystem at scale.
          </p>
          <a
            href="#"
            class="inline-flex items-center justify-center btn btn-primary"
          >
            Start analyzing
          </a>
        </div>
        <div class="p-4">
          <h3 class="mb-2 text-md font-medium">
            The service
          </h3>
          <p class="mb-4">
            We’re also a team of experts providing a full-suite of services for ecoacoustic health measurement projects worldwide.
          </p>
          <a
            href="#"
            class="inline-flex items-center justify-center btn btn-secondary"
          >
            See our featured projects
          </a>
        </div>
      </div>
      <div>
        <img
          class="w-full"
          src="@/_assets/landing/what-we-do.png"
          alt="dashboard image"
        >
      </div>
    </div>
  </section>
</template>
<script setup lang="ts">
</script>
