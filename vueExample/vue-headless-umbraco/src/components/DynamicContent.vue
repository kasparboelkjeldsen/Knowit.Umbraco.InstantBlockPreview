<template>
  <div v-if="pageData && pageData.content"> 
  
      <component :is="getComponentName(pageData.content.contentType)" :data="pageData"></component>
  </div>
</template>

<script>

import GridTest from './contentTypes/GridTest.vue'
import UmbBlockGridDemoHeadlineBlock from './contentTypes/UmbBlockGridDemoHeadlineBlock.vue';
import UmbBlockGridDemoRichTextBlock from './contentTypes/UmbBlockGridDemoRichTextBlock.vue';
export default {
  components: {
    
    UmbBlockGridDemoHeadlineBlock,
    UmbBlockGridDemoRichTextBlock,
    GridTest,
  },
  props: {
      data: Object
  },
  data() {
      return {
          pageData: null
      };
  },
  mounted() {
    this.pageData = this.data 
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
