<template>
  <div v-if="pageData && pageData.content"> 
  
      <component :is="getComponentName(pageData.content.contentType)" :data="pageData"></component>
  </div>
</template>

<script>

import HeadlineBlock from './elements/HeadlineBlock.vue';
import RTEBlock from './elements/RTEBlock.vue';
import ImageBlock from './elements/ImageBlock.vue';
import ThreeThingsElement from './elements/ThreeThingsElement.vue';
export default {
  components: {
    HeadlineBlock,
    RTEBlock,
    ImageBlock,
    ThreeThingsElement
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
    console.log(this.pageData)
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
