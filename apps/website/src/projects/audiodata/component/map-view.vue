<template>
  <div
    v-if="isError"
    class="flex items-center justify-center h-screen text-center"
  >
    <span>
      It seems the map didn’t load as expected.<br>
      Please refresh your browser to give it another go.
    </span>
  </div>
  <div
    v-else
    ref="mapRoot"
    class="w-full h-full"
    :style="{ height: `100vh` }"
  />
</template>
<script setup lang="ts">
import type { FeatureCollection, Point } from 'geojson'
import type { GeoJSONSource, Map as MapboxMap, MapboxOptions } from 'mapbox-gl'
import { computed, onMounted, ref, watch } from 'vue'

import defaultMarkerIcon from '@/_assets/explore/map-marker.png'
import selectedMarkerIcon from '@/_assets/explore/map-marker-selected.png'
import { createMap } from '~/maps'

export interface MarkerItem {
  id: number
  slug: string
  name: string
  latitudeAvg: number
  longitudeAvg: number
}

const props = defineProps<{
  data: MarkerItem[],
  selectedLocationId?: number,
  isError: boolean
}>()

const emit = defineEmits<{(e: 'emitSelected', locationId: number): void}>()

const hoveredId = ref<number | null>(null)
const mapHasLoaded = ref(false)

const mapCenter = computed((): [number, number] => {
  if (props.data.length === 0) return [0, 0]
  const lat = props.data.reduce((acc: number, datum: MarkerItem) => acc + datum.latitudeAvg, 0) / props.data.length
  const lng = props.data.reduce((acc: number, datum: MarkerItem) => acc + datum.longitudeAvg, 0) / props.data.length
  return [lng, lat]
})

const mapBounds = computed((): [number, number, number, number] => {
  if (props.data.length === 0) return [-180, -90, 180, 90]
  const latNorth = Math.max(...props.data.map((datum: MarkerItem): number => datum.latitudeAvg))
  const latSouth = Math.min(...props.data.map((datum: MarkerItem): number => datum.latitudeAvg))
  const lngWest = Math.min(...props.data.map((datum: MarkerItem): number => datum.longitudeAvg))
  const lngEast = Math.max(...props.data.map((datum: MarkerItem): number => datum.longitudeAvg))
  return [lngWest, latSouth, lngEast, latNorth]
})

const mapConfig = computed((): MapboxOptions => ({
  style: 'mapbox://styles/mapbox/satellite-v9',
  center: mapCenter.value,
  attributionControl: false,
  container: 'mapRoot',
  bounds: mapBounds.value,
  preserveDrawingBuffer: true,
  zoom: 10,
  maxZoom: 13,
  minZoom: 2
}))

const mapRoot = ref<InstanceType<typeof HTMLElement> | null>(null)

let map!: MapboxMap

const toGeoJson = (mapData: MarkerItem[]): FeatureCollection => {
  // Define map data
  const data: FeatureCollection = {
    type: 'FeatureCollection',
    features: mapData.map(datum => ({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [datum.longitudeAvg, datum.latitudeAvg], id: datum.id },
      properties: {
        title: datum.name,
        id: datum.id,
        slug: datum.slug
        // radius: props.mapBaseFormatter.getRadius(Number(datum.values[props.dataKey])), // TODO Remove this once boolean is removed from type
        // popup: getPopup(datum)
      }
    }))
  }
  return data
}

onMounted(() => {
  map = createMap({ ...mapConfig.value, container: mapRoot.value as HTMLElement })
  const markers: Record<string, string> = {
    'selected-marker': selectedMarkerIcon,
    'default-marker': defaultMarkerIcon
  }

  map.on('load', () => {
    mapHasLoaded.value = true
    // load image for markers
    Object.entries(markers).forEach(([name, imagePath]) => {
      map.loadImage(imagePath, (error, image) => {
        if (error) throw error
        if (map.hasImage(name) || image === undefined) return
        map.addImage(name, image)
      })
    })
    map.addSource('projects', {
      type: 'geojson',
      data: toGeoJson(props.data),
      cluster: true,
      clusterMinPoints: 10,
      generateId: true,
      clusterMaxZoom: 14, // Max zoom to cluster points on
      clusterRadius: 50 // Radius of each cluster when clustering points (defaults to 50)
    })

    setSelectedLocation(props.selectedProjectId ?? -1)

    map.addLayer({
      id: 'unclustered-point',
      type: 'symbol',
      source: 'projects',
      layout: {
        'icon-image': 'default-marker',
        'icon-size': 0.6
      },
      paint: {
        'icon-opacity': [
          'case',
          ['boolean', ['feature-state', 'hover'], false],
          0.85,
          1
        ]
      }
    })

    map.addLayer({
      id: 'selected-location',
      type: 'symbol',
      source: 'selected-location',
      layout: {
        'icon-image': 'selected-marker',
        'icon-size': 0.6
      },
      paint: {
        'icon-opacity': [
          'case',
          ['boolean', ['feature-state', 'hover'], false],
          0.85,
          1
        ]
      }
    })

    // Add cluser layers
    map.addLayer({
      id: 'clusters',
      type: 'circle',
      source: 'projects',
      filter: ['has', 'point_count'],
      paint: {
        'circle-color': '#050608',
        'circle-radius': [
          'step',
          ['get', 'point_count'],
          20,
          100,
          25,
          750,
          35
       ]
      }
    })

    map.addLayer({
      id: 'cluster-count',
      type: 'symbol',
      source: 'projects',
      filter: ['has', 'point_count'],
      layout: {
        'text-field': [
          'case',
          ['<', ['get', 'point_count'], 10],
          ['to-string', ['get', 'point_count']],
          ['concat', ['to-string', ['*', ['ceil', ['/', ['get', 'point_count'], 10]], 10]], '+']
        ],
        'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
        'text-size': 12
      },
      paint: {
        'text-color': '#FFFEFC'
      }
    })
  })

  map.on('mousemove', 'unclustered-point', (e) => {
    const features = map.queryRenderedFeatures(e.point, { layers: ['unclustered-point'] })
    if (features.length > 0) {
      const { id } = features[0]?.properties ?? {}
      if (hoveredId.value !== null) {
        map.removeFeatureState(
          { source: 'projects', id: hoveredId.value }
        )
      }
      hoveredId.value = id
      map.setFeatureState(
        { source: 'projects', id },
        { hover: true }
      )
    }
  })

  map.on('mouseleave', 'unclustered-point', () => {
    if (hoveredId.value !== null) {
      map.removeFeatureState(
        { source: 'projects', id: hoveredId.value }
      )
    }
    hoveredId.value = null
  })

  map.on('click', 'clusters', (e) => {
    const features = map.queryRenderedFeatures(e.point, { layers: ['clusters'] })
    const clusterId = features[0]?.properties?.cluster_id ?? ''
    if (clusterId === undefined || clusterId === '') return
    (map.getSource('projects') as GeoJSONSource).getClusterExpansionZoom(clusterId, (err, zoom) => {
      const coordinates = (features[0]?.geometry as Point).coordinates.slice() as [number, number]
      if (err === null) {
        map.easeTo({
          padding: { top: 0, bottom: 0, left: 500, right: 0 },
          center: coordinates,
          zoom
        })
      }
    })
  })

  map.on('click', 'unclustered-point', (e) => {
    const features = map.queryRenderedFeatures(e.point, { layers: ['unclustered-point'] })
    const { id } = features[0]?.properties ?? {}
    goToLocation(id)
    emit('emitSelected', id)
  })

  map.on('click', 'selected-location', (e) => {
    const features = map.queryRenderedFeatures(e.point, { layers: ['selected-location'] })
    const { id } = features[0]?.properties ?? {}
    emit('emitSelected', id)
  })
})

watch(() => props.selectedLocationId, (id) => {
  setSelectedLocation(id ?? -1)
  if (id === undefined) { return }
  goToLocation(id)
})

// TODO: if the props.data updated, the data source of the map should be updated as well
watch(() => props.data, (newData) => {
  // adjust map center
  map.easeTo({
    center: mapCenter.value
  })
  if (mapHasLoaded.value === false) { return }
  if (map.getSource('projects') === undefined) {
    map.addSource('projects', { type: 'geojson', data: toGeoJson(newData) })
  } else {
    (map.getSource('projects') as GeoJSONSource).setData(toGeoJson(newData))
  }
})

const setSelectedLocation = (id: number) => {
  const selectedLocationGeoJson = toGeoJson(props.data.filter((datum: MarkerItem) => datum.id === id))
  if (map.getSource('selected-location') === undefined) {
    map.addSource('selected-location', {
    type: 'geojson',
    data: selectedLocationGeoJson
  })
  } else {
    (map.getSource('selected-location') as GeoJSONSource).setData(selectedLocationGeoJson)
  }
}

const goToLocation = (id: number) => {
  const project = props.data.find((datum: MarkerItem) => datum.id === id)
  const coordinates = [project?.longitudeAvg ?? 0, project?.latitudeAvg ?? 0] as [number, number]

  // check if already at coordinates
  const currentCenter = map.getCenter()
  if (currentCenter.lng === coordinates[0] && currentCenter.lat === coordinates[1]) return

  map.flyTo({
    center: coordinates,
    zoom: 12,
    duration: 3000,
    essential: true
  })
}
</script>
