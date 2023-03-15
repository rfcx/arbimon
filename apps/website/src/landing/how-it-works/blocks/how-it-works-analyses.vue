<template>
  <section class="bg-white dark:bg-mirage-gray">
    <div class="py-8 px-4 mx-auto max-w-screen-xl lg:py-24 lg:px-6">
      <div class="mx-auto max-w-screen-md text-center mb-8 lg:mb-12">
        <h2 class="mb-4 text-4xl tracking-tight font-extrabold text-gray-900 dark:text-white">
          Types of analyses available on Arbimon
        </h2>
        <p class="text-gray-500 sm:text-xl dark:text-gray-400">
          Lorem ipsum dolor sit amet consectetur adipiscing elit tortor eu egestas morbi sem vulputate etiam facilisis pellentesque ut quis.
        </p>
      </div>
      <div class="space-y-4 md:grid md:grid-cols-3 lg:grid-cols-4 md:gap-4 md:space-y-0">
        <div class="max-w-sm bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
          <img
            class="rounded-t-lg"
            src="https://flowbite.com/docs/images/blog/image-1.jpg"
            alt=""
          >
          <div class="p-5">
            <span class="bg-blue-100 text-blue-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full dark:bg-blue-900 dark:text-blue-300">Supervised</span>
            <h5 class="my-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              Regional CNN
            </h5>
            <p class="mb-3 font-normal text-gray-700 dark:text-gray-400">
              RFCx trains a CNN classifier model using positive and negative examples for each class (usually species) collected during PM.
            </p>
          </div>
        </div>
        <div class="max-w-sm bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
          <img
            class="rounded-t-lg"
            src="https://flowbite.com/docs/images/blog/image-1.jpg"
            alt=""
          >
          <div class="p-5">
            <span class="bg-blue-100 text-blue-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full dark:bg-blue-900 dark:text-blue-300">Supervised</span>
            <h5 class="my-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              Pattern Matching (PM)
            </h5>
            <p class="mb-3 font-normal text-gray-700 dark:text-gray-400">
              PM is an analytical method where example of a species-specific call is fed into a statistical model that detects similar matches in other recordings.
            </p>
          </div>
        </div>
        <div class="max-w-sm bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
          <img
            class="rounded-t-lg"
            src="https://flowbite.com/docs/images/blog/image-1.jpg"
            alt=""
          >
          <div class="p-5">
            <span class="bg-blue-100 text-blue-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full dark:bg-blue-900 dark:text-blue-300">Supervised</span>
            <h5 class="my-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              Random Forest Model
            </h5>
            <p class="mb-3 font-normal text-gray-700 dark:text-gray-400">
              RFM is a type of machine learning model consisting of multiple decision trees. The RFM module is designed for single-species detection.
            </p>
          </div>
        </div>
        <div class="max-w-sm bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
          <img
            class="rounded-t-lg"
            src="https://flowbite.com/docs/images/blog/image-1.jpg"
            alt=""
          >
          <div class="p-5">
            <span class="bg-indigo-100 text-indigo-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full dark:bg-indigo-900 dark:text-indigo-300">Unsupervised</span>
            <h5 class="my-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              Clustering
            </h5>
            <p class="mb-3 font-normal text-gray-700 dark:text-gray-400">
              The Audio Event Detection (AED) and Clustering analyses aim to automatically detect and categorize sounds in large audio datasets without supervision.
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
