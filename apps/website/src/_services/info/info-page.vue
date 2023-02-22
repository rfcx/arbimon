<template>
  <article class="prose-sm">
    <h1>
      Supporting information
    </h1>
    <div>
      <h2>
        Tips &amp; Hints
      </h2>
      <ul class="list-disc list-inside">
        <li>There is no specific workflow to explore Arbimon Insights. Each page reflects a different and complementary ecological aspect of the project results.</li>
        <li>Only manually-validated detections made in Arbimon are used to create the insights.</li>
        <li>All maps are customizable, and can be displayed with or without different filters (e.g., heatmaps, satellite base-maps, labels).</li>
        <li>Temporal and spatial comparisons can be made in the Richness, Activity and Spotlight pages.</li>
        <li>All figures can be downloaded.</li>
      </ul>
    </div>
    <div>
      <h2>Dashboard</h2>
      <p>
        The home page presents an overview of the project, including background information, objectives, funding, and stakeholders. General results are also presented, such as the total number of detections, sampling sites, species detected, and the number of species in each threat category, according to the International Union for Conservation of Nature (IUCN). This page also features a map with all sampling sites, the number of species detected in each site, and a graph showing the number of species detected per hour.
      </p>
    </div>
    <div :class="selectedTopic === topics.activity ? 'selected' : ''">
      <h2>
        Richness (species richness perspective)
      </h2>
      <p>
        This page focuses on the spatial and temporal patterns of species richness (i.e., the total number of detected species), and results can be filtered and compared by region/site, date, and taxonomic group (e.g., birds). This page has three main components:
        <ul class="list-disc list-inside">
          <li>Bar plot indicating the number of detected species by the taxonomic group.</li>
          <li>Map displaying the number of detected species per site, with point size reflecting the number of species detected at each location. If the user hovers the cursor over the points on the map, it will display the number of species in each taxonomic group.</li>
          <li>Plot of the number of detected species across time (either time of day, day of the week, month, or date). In addition, detections can be visualized through heatmaps where the number of detections are depicted by color.</li>
          <li>Comparative species list table which can be sorted by species name and taxonomic group.</li>
        </ul>
        Species richness is the number of species of a given taxon in a sample, location or time period. It is one of the simplest, most common, and for many, most intuitive metrics to summarize biodiversity (Magurran 2004). Although a simple count of species exhibits several limitations when considering species composition, including essential characteristics of biological communities such as evolutionary history and functional diversity, it is widely used for ecological and conservation issues. For example, species richness has been used for a long time when identifying global hotspots of biodiversity, establishing priority areas for conservation, and assessing how biodiversity varies along environmental gradients.
      </p>
    </div>
    <div :class="selectedTopic === topics.richness ? 'selected' : ''">
      <h2>
        Activity (species community perspective)
      </h2>
      <p>
        This page overviews temporal and spatial vocal activity patterns. It can be used to summarize either detection frequency (i.e., number of detections of taxonomic groups divided by the total number of detections), number of detections (raw), or naive occupancy results (i.e., the proportion of occupied sites), with a focus given to general patterns at the community level. Occupancy models are explained further below. As with the Richness page, the user can use the filters to select results from taxonomic groups, sampling sites, or specific periods and visualize the results in a map or graphs that present the results according to the hour, day of the week, or month. The species list at the bottom of the page shows detection frequency data, the number of detections, occupied sites, and naive occupancy. If the user selects a species, they will be directed to the Spotlight menu.
      </p>
      <p>
        Patterns of vocal activity provide information about the vocalizations themselves and their function (Yoo et al. 2019). In many species, vocal activity can provide insight into breeding cycles since vocal activity often reaches its peak during the territorial and mating competition (Yoo et al. 2019). Knowledge of vocal activity patterns may assist with wildlife management decisions by
        <ul class="list-disc list-inside">
          <li>guiding when to focus monitoring efforts to coincide when species are most active</li>
          <li>providing a behavior baseline that can be used to track and understand responses to natural and human impacts</li>
          <li>providing information for periods in which to minimize disturbance from anthropogenic noises that may disrupt species' ability to communicate</li>
        </ul>
      </p>
      <h3>
        Occupancy Modeling
      </h3>
      <p>
        Occupancy is defined as the proportion of sites, patches, landscape or habitat units occupied by a taxon (MacKenzie et al. 2006). Occupancy models are statistical methods that use species detection and non-detection data to estimate the probability that a site is occupied by a species. Occupancy models are considered to be easier and more cost-effectively than abundance estimation methods (MacKenzie et al. 2006). Although it is considered less informative than abundance, it is a very widely and essential state variable applied in ecology, wildlife management and conservation biology. Occupancy models can incorporate several site characteristics, such as environmental variables (habitat type, tree cover, etc.), climatic variables (temperature, rainfall, etc.). Occupancy models are used to calculate species distribution/range, habitat or resource selection, wildlife disease dynamics, and metapopulation dynamics (MacKenzie et al. 2006; Kéry & Royle 2016). A major concern with presence-absence data of species is that detection probability of species is often below one, biasing the occupancy estimates and its relationship with predictor variables. The occupancy modeling approach can be used to account for the imperfect detection of species while estimating the "true" species occupancy.
      </p>
    </div>
    <div :class="selectedTopic === topics.spotlight ? 'selected' : ''">
      <h2>
        Spotlight (individual species perspective)
      </h2>
      <p>
        This page offers an in-depth look at individual species' detection and occupancy trends. The user can select the species detected in the project data on this page using either its scientific or common name. Basic information about the species, photo, call example, population status according to IUCN, detection frequency, and naive occupancy values are presented. The first map shows the detection results by site and allows for filtering by detection frequency, the number of detections (raw), and naive occupancy (i.e., the proportion of occupied sites). In addition, a graph displays either detection frequency or the number of detection results by the hour, day of the week, or month. Like the Richness and Activity pages, the dataset can be subset by selecting one or more sampling sites or sampling periods.
      </p>
    </div>
    <div>
      <h2>References</h2>
      <ul class="list-disc list-inside">
        <li>Kéry M, Royle JA. (2016). Applied Hierarchical Modeling in Ecology: Analysis of distribution, abundance and species richness in R and BUGS. Academic Press, London.</li>
        <li>MacKenzie, D. I., Nichols, J. D., Royle, J. A., Pollock, K. H., Bailey, L., & Hines, J. E. (2017). Occupancy estimation and modeling: inferring patterns and dynamics of species occurrence. Elsevier.</li>
        <li>Magurran AE. (2004). Measuring biological diversity. Blackwell Science Ltd, Malden.</li>
        <li>Yoo S, Kim HN, Lee JW, & Yoo JC. (2019). Seasonal and diurnal patterns of population vocal activity in avian brood parasites. Ibis 162, 1001–1011. </li>
      </ul>
    </div>
  </article>
</template>
<script lang="ts" src="./info-page.ts"></script>
