<script lang="ts" setup>
import BottomRight from '../components/BottomRight.vue';
import BrandLogo from '../components/BrandLogo.vue';

</script>
<template>
  <div class="slidev-layout cover cover-bmi">
    <div class="my-auto w-full cover-bmi--content">
      <BottomRight />
      <BrandLogo />
      <slot />
    </div>
  </div>
</template>

<style lang="scss">

.cover-bmi {
  background: url('../images/bmi-cover-bg-green.png') center/cover no-repeat;
  &--content > h1, h2, h3, h4, h5, h6 {
    text-shadow: 2px 2px 4px rgba(0,0,0,0.6);
  } &--content > * {
    color: white !important;
  }
}

</style>