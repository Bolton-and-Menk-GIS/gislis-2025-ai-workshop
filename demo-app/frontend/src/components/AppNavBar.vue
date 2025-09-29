<script lang="ts" setup>
import { useAppState } from '@/stores';
import { useRouter } from 'vue-router';

const router = useRouter()

const appStore = useAppState()

const links = [
  { name: 'Ask', path: 'ask' },
  { name: 'Survey', path: 'survey' },
  { name: 'RAG', path: 'rag' },
]
</script>

<template>
  <header class="pico app-navbar">
    <nav class="px-md pico-background-violet-600">
      <ul>
        <li @click="router.push('/')"><h3 class="nav-title">AI Demos</h3></li>
      </ul>
      <ul>
        <li v-for="link in links" :key="link.name">
          <RouterLink 
            :to="`/${link.path}`" 
            active-class="active-link"
          >{{ link.name }}</RouterLink>
        </li>
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
  cursor: pointer;
  color: var(--pico-color-violet-50) !important;
  &:hover {
    color: var(--pico-color-violet-100) !important;
  }
}

.active-link {
  font-weight: bold;
  text-decoration: underline !important;
  color: var(--pico-color-violet-50) !important;
}
</style>