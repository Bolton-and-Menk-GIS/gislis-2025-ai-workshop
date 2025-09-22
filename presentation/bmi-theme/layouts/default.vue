<script setup lang="ts">
import { ref } from 'vue'
import { onSlideLeave } from '@slidev/client'
import BottomRight from '../components/BottomRight.vue';
import BrandLogo from '../components/BrandLogo.vue';

const showBottomRight = ref(true);

onSlideLeave(() => {
  showBottomRight.value = false;
  setTimeout(() => {
    showBottomRight.value = true;
  }, 500);
}); 
</script>

<template>
  <div
    class="slidev-layout bmi-default default"
    :class="{ grid: $attrs.center }"
  >
    <div class="bmi-default--overlay absolute"></div>
    <BottomRight triangle-color="secondary" v-if="showBottomRight" />
    <BrandLogo />
    <div class="my-auto z-12 relative">
      <slot></slot>
    </div>
  </div>
</template>

<style lang="scss">
.bmi-default {
  background: url('../images/bmi-cover-bg-green.png') center/cover no-repeat;
  padding: 1rem 2rem;
  &--overlay {
    background-color: var(--slidev-theme-background);
    top: 0;
    left: 0;
    right: 0;
    bottom: 48px;
  }
}
</style>