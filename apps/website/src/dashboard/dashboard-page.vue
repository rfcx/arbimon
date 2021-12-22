<template>
  <div v-if="store.selectedProject">
    <p class="text-center opacity-50">
      <!-- TODO: Update after have api -->
      Last generated/synced at: November 18, 2021 16:03
    </p>
    <div class="grid gap-4 grid-cols-8">
      <!-- Left content -->
      <div class="col-span-6 mt-5">
        <dashboard-metrics
          v-if="generated"
          :metrics="generated"
        />
        <div class="flex flex-row flex-1 items-center mt-5">
          <p
            v-for="tab in tabs"
            :key="'dashboard-data-display-' + tab.value"
            class="text-lg capitalize py-2 px-4 cursor-pointer"
            :class="tab.value === selectedTab ? 'border-b-4 border-brand-primary' : 'border-b-1 border-steel-grey'"
            @click="selectedTab = tab.value"
          >
            {{ tab.label }}
          </p>
        </div>
        <div class="grid gap-2 mt-2 xl:grid-cols-2">
          <dashboard-sitemap />
          <dashboard-line-chart :time-data="lineChartData" />
        </div>
        <page-title
          class="mt-5"
          :page-title="store.selectedProject.name"
          :page-subtitle="profile?.description"
        />
        <dashboard-project-profile
          v-if="profile?.readme"
          :information="profile?.readme"
          class="mt-5"
        />
      </div>
      <!-- Right content -->
      <div class="col-span-2 mt-5">
        <dashboard-top-taxons
          v-if="generated?.richnessByTaxon"
          :dataset="generated?.richnessByTaxon ?? {}"
          :colors="taxonColors"
          :known-total-count="generated?.speciesCount ?? 0"
        />
        <dashboard-highlighted-species :species="speciesHighlighted" />
        <dashboard-endangered-species :species="speciesThreatened" />
      </div>
    </div>
  </div>
</template>
<script src="./dashboard-page" lang="ts"></script>
