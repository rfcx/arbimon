<template>
  <div v-if="store.selectedProject">
    <div class="dashboard-wrapper">
      <div class="dashboard-metric">
        <dashboard-metrics
          v-if="generated"
          :metrics="generated"
        />
      </div>
      <div class="dashboard-species">
        <div class="dashboard-richness">
          <dashboard-sidebar-title
            title="Species highlights"
            :route="{ name: ROUTE_NAMES.activityPatterns, params: { projectSlug: store.selectedProject?.slug } }"
          />
          <horizontal-stacked-distribution
            :dataset="richnessByTaxon"
            :known-total-count="generated?.speciesCount ?? 0"
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
            :known-total-count="generated?.speciesCount ?? 0"
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
          <map-bubble-component
            :dataset="mapDataset"
            data-key="refactorThis"
            :get-popup-html="getPopupHtml"
            map-export-name="dashboard-map"
            :map-id="`dashboard-by-site`"
            :map-initial-bounds="mapInitialBounds"
            :circle-formatter="circleFormatter"
            :map-height="tabHeight"
            :circle-style-non-zero="circleStyle"
            class="map-bubble w-full"
          />
          <div class="line-chart relative">
            <line-chart-component
              dom-id="dashboard-line-chart"
              :config="lineChartConfig"
              :datasets="lineChartSeries"
            />
            <export-button
              v-if="lineChartSeries.length > 0"
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
          :page-subtitle="profile?.summary"
        />
        <dashboard-project-profile
          v-if="profile?.readme"
          :information="profile?.readme"
          class="mt-5"
        />
      </div>
    </div>
    <last-sync :sync-updated="store.projectFilters?.updatedList[0].updatedAt" />
  </div>
</template>
<script src="./dashboard-page" lang="ts"></script>
<style lang="scss">
@import './dashboard-page.scss';
</style>
