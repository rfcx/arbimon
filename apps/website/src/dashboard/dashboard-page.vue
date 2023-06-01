<template>
  <div v-if="store.selectedProject">
    <!-- <draft-banner
      current-mode="Draft"
      :sync-updated="store.projectFilters?.latestSync?.updatedAt ?? null"
      :project-slug="store.selectedProject?.slug"
    /> -->
    <div class="dashboard-wrapper">
      <div class="dashboard-metric">
        <dashboard-metrics
          :loading="metrics === null"
          :metrics="metrics"
        />
      </div>
      <div class="dashboard-species">
        <div class="dashboard-richness">
          <dashboard-sidebar-title
            title="Species highlights"
          />
          <horizontal-stacked-distribution
            :dataset="richnessByTaxon"
            :loading="richnesses?.richnessByTaxon == null"
            :known-total-count="metrics?.speciesCount ?? 0"
            class="mt-4"
          />
          <dashboard-highlighted-species
            :species="speciesHighlighted"
            class="mt-5"
          />
        </div>
        <div class="threatened-species">
          <dashboard-sidebar-title
            title="Threatened species"
            :route="{ name: ROUTE_NAMES.activityPatterns, params: { projectSlug: store.selectedProject?.slug } }"
            class="mt-5 sm:mt-0 lg:mt-5"
          />
          <horizontal-stacked-distribution
            :dataset="richnessByRisk"
            :loading="richnesses?.richnessByRisk === null"
            :known-total-count="metrics?.speciesCount ?? 0"
            class="mt-4"
          />
          <dashboard-threatened-species
            :species="speciesThreatened"
            class="mt-5"
          />
        </div>
      </div>
      <div class="dashboard-graphic">
        <div class="graphic-tabs">
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
        <div class="dashboard-graphic-content inline-grid w-full gap-2 mt-2 xl:grid-cols-2">
          <map-base-component
            :dataset="mapDataset"
            data-key="refactorThis"
            :loading="generated === null"
            :get-popup-html="getPopupHtml"
            map-export-name="dashboard-map"
            :map-id="`dashboard-by-site`"
            :map-initial-bounds="mapInitialBounds"
            :map-base-formatter="circleFormatter"
            :map-height="tabHeight"
            :style-non-zero="circleStyle"
            class="map-bubble w-full"
          />
          <div class="line-chart relative">
            <line-chart-component
              dom-id="dashboard-line-chart"
              :config="lineChartConfig"
              :datasets="lineChartSeries"
              :loading="generated === null"
            />
            <export-button
              v-if="hasLineChartData"
              class="absolute top-2 right-2"
              @click="downloadLineChart"
            />
          </div>
        </div>
      </div>
      <div class="dashboard-content">
        <page-title
          class="dashboard-title mt-5"
          :page-title="store.selectedProject.name"
          :page-subtitle="content?.summary"
        />
        <dashboard-project-profile
          :information="content?.readme"
          :loading="content === null"
          class="mt-5"
        />
      </div>
    </div>
  </div>
</template>
<script src="./dashboard-page" lang="ts">
</script>
<style lang="scss">
@import './dashboard-page.scss';
</style>
