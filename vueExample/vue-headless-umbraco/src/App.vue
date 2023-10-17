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
      window.reloadPreview = this.reloadPreview;
    }
  },
  methods: {
    reloadPreview(data) {
      this.previewData = data;
      console.log(this.previewData);
    }
  },
  components: {
    PreviewLayout,
  }
}
</script>

<style>
/* Add your styles here */
</style>
