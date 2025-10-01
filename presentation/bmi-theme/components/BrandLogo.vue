<script lang="ts" setup>
import { computed } from 'vue'

interface Props {
  /**
   * option to show logo with tagline
   * @default false
   */
  tagline?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  tagline: false,
});
const logoUrl = computed(()=> new URL(`/images/bmi_white${props.tagline ? '_tagline': ''}.png`, import.meta.url).href);

const width = computed(()=> props.tagline ? 120 : 96);
</script>

<template>
  <div class="brand-logo z-3">
    <img :src="logoUrl" :width="width" alt="Bolton & Menk Logo" />
  </div>
</template>

<style lang="scss" scoped>
.brand-logo {
  position: absolute;
  bottom: 0.5rem;
  left: 1.2rem;
}
</style>