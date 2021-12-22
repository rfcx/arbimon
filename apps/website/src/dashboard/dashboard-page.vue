<template>
  <div v-if="store.selectedProject">
    <div class="grid gap-4 grid-cols-8">
      <!-- Left content -->
      <div class="col-span-6">
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
      <div class="col-span-2">
        <dashboard-sidebar-title
          v-if="generated?.richnessByTaxon && generated?.speciesCount"
          title="Richness"
          :subtitle="`${generated?.speciesCount ?? 0} species`"
          :route="{ name: ROUTE_NAMES.speciesRichness, params: { id: store.selectedProject?.id } }"
        />
        <horizontal-stacked-distribution
          v-if="generated?.richnessByTaxon && generated?.speciesCount"
          :dataset="generated?.richnessByTaxon ?? []"
          :colors="taxonColors"
          :known-total-count="generated?.speciesCount ?? 0"
        />
        <dashboard-sidebar-title
          title="Highlighted species"
          :route="{ name: ROUTE_NAMES.activityOverview, params: { projectId: store.selectedProject?.id } }"
        />
        <dashboard-highlighted-species
          :species="speciesHighlighted"
        />
        <dashboard-sidebar-title
          title="Threatened species"
          :route="{ name: ROUTE_NAMES.activityOverview, params: { projectId: store.selectedProject?.id } }"
        />
        <horizontal-stacked-distribution
          v-if="generated?.richnessByExtinction && generated?.speciesCount"
          :dataset="generated?.richnessByExtinction ?? []"
          :colors="extinctionColors"
          :known-total-count="generated?.speciesCount ?? 0"
        />
        <dashboard-threatened-species
          :species="speciesThreatened"
          class="mt-5"
        />
      </div>
    </div>
    <p class="text-center opacity-50">
      <!-- TODO: Update after have api -->
      Last generated/synced at: November 18, 2021 16:03
    </p>
  </div>
</template>
<script src="./dashboard-page" lang="ts"></script>
