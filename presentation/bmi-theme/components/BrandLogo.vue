<script lang="ts" setup>
const logoUrl = new URL('../images/bmi_white.png', import.meta.url).href;
</script>

<template>
  <div class="brand-logo">
    <img :src="logoUrl" alt="Bolton & Menk Logo" />
  </div>
</template>

<style lang="scss" scoped>
.brand-logo {
  z-index: 20;
  position: absolute;
  bottom: 1.1rem;
  left: 1.45rem;
  width: 96px;
}
</style>