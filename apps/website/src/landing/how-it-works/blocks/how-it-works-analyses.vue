<template>
  <section class="bg-white dark:bg-echo">
    <div class="py-8 px-4 mx-auto max-w-screen-xl lg:py-24 lg:px-6">
      <div class="mx-auto max-w-screen-md text-center mb-8 lg:mb-12">
        <h1 class="mb-4 text-gray-900 dark:text-insight">
          Types of analyses available on Arbimon
        </h1>
        <p class="text-gray-500 sm:text-xl dark:text-insight">
          We offer a range of analyses to fit a wide variety of research needs.
        </p>
      </div>
      <div class="space-y-4 md:grid md:grid-cols-3 lg:grid-cols-4 md:gap-4 md:space-y-0">
        <div class="max-w-sm bg-white border border-gray-200 rounded-lg shadow dark:(bg-pitch border-frequency)">
          <img
            class="rounded-t-lg"
            src="https://flowbite.com/docs/images/blog/image-1.jpg"
            alt=""
          >
          <div class="p-5 border-t border-frequency">
            <span class="text-insight text-xs font-display uppercase mr-2 px-2.5 py-0.5 rounded-full dark:(border-1 border-spoonbill text-insight)">Supervised</span>
            <h5 class="my-2 text-2xl tracking-tight text-gray-900 dark:text-insight">
              Regional CNN
            </h5>
            <p class="mb-3 font-normal text-gray-700 dark:text-insight">
              RFCx trains a CNN classifier model using positive and negative examples for each class (usually species) collected during PM.
            </p>
          </div>
        </div>
        <div class="max-w-sm bg-white border border-gray-200 rounded-lg shadow dark:(bg-pitch border-frequency)">
          <img
            class="rounded-t-lg"
            src="https://flowbite.com/docs/images/blog/image-1.jpg"
            alt=""
          >
          <div class="p-5 border-t border-frequency ">
            <span class="text-insight text-xs font-display uppercase mr-2 px-2.5 py-0.5 rounded-full dark:(border-1 border-spoonbill text-insight)">Supervised</span>
            <h5 class="my-2 text-2xl tracking-tight text-gray-900 dark:text-insight">
              Pattern Matching (PM)
            </h5>
            <p class="mb-3 font-normal text-gray-700 dark:text-insight">
              PM is an analytical method where example of a species-specific call is fed into a statistical model that detects similar matches in other recordings.
            </p>
          </div>
        </div>
        <div class="max-w-sm bg-white border border-gray-200 rounded-lg shadow dark:(bg-pitch border-frequency)">
          <img
            class="rounded-t-lg"
            src="https://flowbite.com/docs/images/blog/image-1.jpg"
            alt=""
          >
          <div class="p-5 border-t border-frequency ">
            <span class="text-insight text-xs font-display uppercase mr-2 px-2.5 py-0.5 rounded-full dark:(border-1 border-spoonbill text-insight)">Supervised</span>
            <h5 class="my-2 text-2xl tracking-tight text-gray-900 dark:text-insight">
              Random Forest Model
            </h5>
            <p class="mb-3 font-normal text-gray-700 dark:text-insight">
              RFM is a type of machine learning model consisting of multiple decision trees. The RFM module is designed for single-species detection.
            </p>
          </div>
        </div>
        <div class="max-w-sm bg-white border border-gray-200 rounded-lg shadow dark:(bg-pitch border-frequency)">
          <img
            class="rounded-t-lg"
            src="https://flowbite.com/docs/images/blog/image-1.jpg"
            alt=""
          >
          <div class="p-5 border-t border-frequency ">
            <span class="text-insight text-xs font-display uppercase mr-2 px-2.5 py-0.5 rounded-full  dark:(border-1 border-flamingo text-insight)">Unsupervised</span>
            <h5 class="my-2 text-2xl tracking-tight text-gray-900 dark:text-insight">
              Clustering
            </h5>
            <p class="mb-3 font-normal text-gray-700 dark:text-insight">
              The Audio Event Detection (AED) and Clustering analyses aim to automatically detect and categorize sounds in large audio datasets without supervision.
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
