<script lang="ts" setup>
import BrandLogo from "../components/BrandLogo.vue";
</script>

<template>
  <div class="slidev-layout center center-bmi">
    <div class="flex flex-col justify-center text-center bmi-layout--center">
      <slot></slot>
    </div>
    <div class="bg-bmi-footer">
      <BrandLogo />
    </div>
  </div>
</template>

<style lang="scss">
.bmi-layout--center {
   > * img {
    margin: 0 auto;
  }
}
.bg-bmi-footer {
  z-index: 1;
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 48px;
  width: 100%;
  background-color: var(--bmi-green) !important;
}
</style>