<script lang="ts" setup>
import { useAppState } from '@/stores';

const appStore = useAppState()
</script>

<template>
  <header class="pico app-navbar ">
    <nav :class="`px-md pico-background-violet-${appStore.isDark ? 6: 5}00`">
      <ul>
        <li><h3 class="nav-title">AI Demos</h3></li>
      </ul>
      <ul>
        <li><a href="#">RAG</a></li>
        <li><a href="#">Services</a></li>
        <li><a href="#">Products</a></li>
        <li style="color: white; cursor: pointer;">
          <calcite-icon :icon="appStore.isDark ? 'brightness': 'moon'" @click="appStore.toggleDarkMode"></calcite-icon>
        </li>
      </ul>
    </nav>
  </header>
</template>

<style lang="scss">
.app-navbar {
  height: 72px;
}
.nav-title {
  color: var(--pico-color-violet-50) !important;
}
</style>