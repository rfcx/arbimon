<template>
  <section class="bg-white dark:bg-echo">
    <div class="py-8 px-4 mx-auto max-w-screen-xl sm:py-16 lg:px-6">
      <div class="grid pt-8 text-left gap-10 md:gap-16 dark:border-gray-700 md:grid-cols-2">
        <div>
          <h1 class="mb-8 text-gray-900 dark:text-frequency">
            Frequently Asked Questions
          </h1>
          <p>Questions about Arbimon? Our FAQ page has you covered.</p>
        </div>
        <div
          id="accordion-open"
          data-accordion="collapse"
          data-active-classes="dark:bg-moss text-insight border-b-0 border-gray-200 dark:border-gray-700"
          data-inactive-classes="text-insight"
        >
          <faq-accordion item-id="1">
            <template #question>
              Why is Arbimon free?
            </template>
            <template #answer>
              // TODO: add answer
            </template>
          </faq-accordion>
          <faq-accordion item-id="2">
            <template #question>
              Is it really unlimited storage and analysis?
            </template>
            <template #answer>
              Yes!  With a free account, you can store as many files and run as many analyses as you want.  However, there are some technical limits in terms of file and job size. For storage, the platform will not accept single files over 200MB.

              For some analyses (e.g. Pattern Matching, Random Forest), you can create jobs of any size, but others (e.g. Audio Event Detection and Clustering) have a cap on the number of recordings or data points that can be analyzed in a single job. You can see the limits in the table below. We have introduced a cap because it enables us to provide sufficient resources and cover the costs of running analyses for all projects
              // TODO: add link
              // TODO: add table
            </template>
          </faq-accordion>
          <faq-accordion item-id="3">
            <template #question>
              How much does it cost to run a job?
            </template>
            <template #answer>
              ...
            </template>
          </faq-accordion>
        </div>
      </div>
    </div>
  </section>
  <faq-cta />
  <footer-contact />
</template>
<script setup lang="ts">
import FooterContact from '@/_layout/components/landing-footer-contact.vue'
import faqCta from './blocks/faq-cta.vue'
import faqAccordion from './components/faq-accordion.vue'
</script>
