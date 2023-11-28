<template>
    <router-view v-if="!isBackoffice"></router-view>
    <PreviewLayout v-if="isBackoffice && previewData" :data="previewData"></PreviewLayout>
</template>

<script>
import PreviewLayout from './components/PreviewLayout.vue';
export default {
  name: 'App',
  data: function() {
    return {
      isBackoffice: process.env.VUE_APP_BACKOFFICE === 'true',
      previewData:  null,
    }
  },
  mounted() {
    if (this.isBackoffice) {
      window.addEventListener(`event-${this.$seed}`, data => {
        this.reloadPreview(JSON.parse(data.detail));
      })
    }
  },
  methods: {
    reloadPreview(data) {
      this.previewData = data;
    }
  },
  components: {
    PreviewLayout,
  }
}
</script>

<style lang="postcss">
  html, body, .vueapp {
    height: 100%;
  }
  body {
    background: #e6e2ff;
  }
  main {
    margin: auto;
    max-width: 1024px;
    background: white;
    height: 100%;
  }
</style>
