<script setup lang="ts">
// This component is used to display the BMI logo in the bottom right corner of each slide.
// import WhiteTripod from '../images/white-tripod.svg'
const whiteTripod = new URL('../images/white-tripod-opacity.svg', import.meta.url).href;
const yellowBar = new URL('../images/yellow-bar.svg', import.meta.url).href;
const grayBar = new URL('../images/gray-bar.svg', import.meta.url).href;
const grayTriangle = new URL('../images/gray-triangle.svg', import.meta.url).href;
</script>
<template>
  <div class="logo-bottom-right">
    <img :src="whiteTripod" class="white-tripod"/>
    <div class="corner-graphics">
      <img :src="whiteTripod" class="white-tripod" />
      <img :src="grayTriangle" class="corner-graphic triangle" />
      <img :src="grayBar" class="corner-graphic gray-bar" />
      <img :src="yellowBar" class="corner-graphic yellow-bar" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.logo-bottom-right {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 340px; // Adjust as needed
  height: 180px; // Adjust as needed
  pointer-events: none;
  z-index: 10;
}


.white-tripod {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 280px;
  height: auto;
  z-index: 1;
  margin-right: 14px;
  opacity: 0.8;
}

.corner-graphic {
  position: absolute;
  bottom: 0;
  height: auto;
}

.triangle {
  right: 0;
  width: 150px;
  z-index: 2;
  opacity: 0.85;
  mix-blend-mode: multiply;
}

.gray-bar {
  right: 20px;
  width: 150px;
  z-index: 3;
  opacity: 0.85;
  mix-blend-mode: exclusion;
}

.yellow-bar {
  right: 42px;
  width: 140px;
  z-index: 4;
  opacity: 0.9;
  mix-blend-mode: hard-light;
}
</style>