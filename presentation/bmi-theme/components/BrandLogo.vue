<script lang="ts" setup>
const logoUrl = new URL('../images/bmi_white.png', import.meta.url).href;
</script>

<template>
  <div class="brand-logo z-3">
    <img :src="logoUrl" alt="Bolton & Menk Logo" />
  </div>
</template>

<style lang="scss" scoped>
.brand-logo {
  position: absolute;
  bottom: 0.5rem;
  left: 1.2rem;
  width: 96px;
}
</style>