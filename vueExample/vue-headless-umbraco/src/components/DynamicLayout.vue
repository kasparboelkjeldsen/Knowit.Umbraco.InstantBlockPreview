<template>
  <div v-if="pageData && pageData.properties"> 
    <div v-for="(propertyValue, propertyName) in pageData.properties" :key="propertyName">
      
      <component :is="getComponentName(propertyName)" :data="propertyValue"></component>
    </div>
  </div>
</template>

<script>
import Grid from './contentTypes/Grid.vue'
import { GetContent } from './../util/getContent'
export default {
  components: {
    Grid
  },
  props: {
      url: {
          type: String,
      },
      data: Object
  },
  data() {
      return {
          pageData: null
      };
  },
  created() {
    this.pageData = this.$route.params.data
  },
  watch: {
    async $route(to, from) {
      // Only fetch new pageData if the route has changed
      if (to.fullPath !== from.fullPath) {
        this.pageData = await GetContent(to.href);
      }
    },
  },
  methods: {
    getComponentName(propertyName) {
      // Convert the property name to PascalCase to match the component name
      const componentName = propertyName.charAt(0).toUpperCase() + propertyName.slice(1);
      return componentName;
    }
  }
};
</script>
