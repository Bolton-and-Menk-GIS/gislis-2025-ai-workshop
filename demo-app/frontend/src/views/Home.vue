<script lang="ts" setup>
const baseUrl = import.meta.env.VITE_API_URL || '';
</script>

<template>

  <section>
    <div class="home pico pa-lg">
      <h2 class="pico my-xl">✨ Embracing AI in GIS Web Development ✨</h2>
      <div class="pico grid pa-xl">
        <article class="pico">
          <h2>View Presentation</h2>
          <p>Slides and materials from the workshop.</p>
          <a href="https://bolton-and-menk-gis.github.io/gislis-2025-ai-workshop" class="contrast" target="_blank">Open Presentation</a>
        </article>
        <article>
          <h2>API Docs</h2>
          <p>Explore the demo API for LLM-powered GIS tools.</p>
          <a :href="`${baseUrl}/docs`" class="contrast" target="_blank">View API Docs</a>
        </article>
        <article>
          <h2>Explore the Code</h2>
          <p>Clone the code and play around with the examples</p>
          <a href="https://github.com/Bolton-and-Menk-GIS/gislis-2025-ai-workshop" class="contrast" target="_blank">Github Repo</a>
        </article>
        <article>
          <h2>Live Demos</h2>
          <p>Try context-enriched prompts and RAG retrieval in the demo app.</p>
          <RouterLink to="/ask" class="contrast">Explore Demos</RouterLink>
        </article>
      </div>
    </div>
  </section>

</template>