<script setup lang="ts">
import { mapboxSetup } from '../business/mapbox';
import { anyMapSetup } from '../business/cesium';
import { mapSync, MapboxEventHander, CesiumEventHandler } from '../../../src';
import { onMounted, ref } from 'vue';

const mboxMapEle = ref<HTMLDivElement>();
const anyMapEle = ref<HTMLDivElement>();

onMounted(async () => {
    const mapboxMap = await mapboxSetup({ container: mboxMapEle.value });
    const anyMap = await anyMapSetup({ container: anyMapEle.value });

    const synchronizer = mapSync({ 
        map: mapboxMap,
        Handler: MapboxEventHander,
     }, {
        map: anyMap,
        Handler: CesiumEventHandler
      }, {
        initFrom: 'mapbox'
      })
})
</script>

<template>
  <div class="container">
    <div ref="mboxMapEle" class="mapbox-map"></div>
    <div ref="anyMapEle" class="any-map"></div>
  </div>
</template>

<style scoped>
.container {
    width: 100%;
    height: 100%;

    display: flex;
    align-items: stretch;

    .mapbox-map {
        flex: 1;
    }

    .any-map {
        flex: 1;
    }
}
</style>
