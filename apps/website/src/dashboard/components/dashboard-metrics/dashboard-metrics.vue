<template>
  <div class="metric_wrapper <sm:text-center">
    <numeric-metric
      :value="metrics.detectionCount"
      subtitle="detections"
      class="detections_metric"
    />
    <numeric-metric
      class="sites_metric"
      :value="metrics.siteCount"
      subtitle="sites"
    />
    <numeric-metric
      class="threatened_metric"
      :value="metrics.speciesThreatenedCount"
      :total-value="metrics.speciesCount"
      subtitle="threatened"
    />
    <div class="dataset_range mr-3">
      <span class="text-gray-400">Dataset Date Range</span>
      <p class="text-subtle">
        April 27, 2020 - June 26, 2020
      </p>
    </div>
  </div>
</template>
<script lang="ts" src="./dashboard-metrics.ts"></script>

<style lang="scss">
.metric_wrapper {
  display: grid;
  grid-gap: 1rem;
  grid-template-areas:
    "detections_metric sites_metric threatened_metric dataset_range";
  grid-template-columns: min(8rem) min(8rem) min(8rem) 1fr;

  @media (max-width: 700px) {
    place-content: center;
    grid-template-areas:
    "detections_metric sites_metric threatened_metric"
    "dataset_range dataset_range dataset_range";
    grid-template-columns: repeat(3, min(8rem));
    grid-template-rows: auto;
  }

  .detections_metric {
    grid-area: detections_metric;
  }

  .sites_metric {
    grid-area: sites_metric;
  }

  .threatened_metric {
    grid-area: threatened_metric;
  }

  .dataset_range {
    grid-area: dataset_range;
    justify-self: end;
    text-align: end;

    span {
      display: inline-block;
      padding: .25rem 0;
    }

    @media (max-width: 700px) {
      justify-self: center;
      text-align: center;
      margin: 0;

      span {
        padding: 0;
      }

      p {
        display: inline-block;
        padding-left: .5rem;
      }
    }
  }

}
</style>
