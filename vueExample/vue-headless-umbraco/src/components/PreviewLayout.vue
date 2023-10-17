<template>
  <div v-if="formattedData">
    <component :is="getComponentName(formattedData.content.contentType)" :data="formattedData" ></component>
  </div>
</template>

<script>
import GridTest from './contentTypes/GridTest.vue'
import UmbBlockGridDemoHeadlineBlock from './contentTypes/UmbBlockGridDemoHeadlineBlock.vue';
import UmbBlockGridDemoRichTextBlock from './contentTypes/UmbBlockGridDemoRichTextBlock.vue';
export default {
  props: {
    data: Object
  },
  components: {
    UmbBlockGridDemoHeadlineBlock,
    UmbBlockGridDemoRichTextBlock,
    GridTest,
  },
  data: function() {
    return {
      formattedData: null,
    }
  },
  watch: {
    data: function() {
      this.formattedData = this.convertJson(this.data);
    }
  },
  methods: {
    lowerCaseKeys(obj) {
      if (obj instanceof Array) {
        return obj.map(value => this.lowerCaseKeys(value));
      } else if (obj !== null && obj.constructor === Object) {
        return Object.fromEntries(
          Object.entries(obj).map(([key, value]) => [key.charAt(0).toLowerCase() + key.slice(1), this.lowerCaseKeys(value)])
        );
      } else {
        return obj;
      }
    },
    convertJson(originalJson) {
      const item = originalJson.Items[0];
      const content = this.lowerCaseKeys(item.Content);
      const settings = this.lowerCaseKeys(item.Settings);
      return { content, settings };
    },
    getComponentName(propertyName) {
      // Convert the property name to PascalCase to match the component name
      const componentName = propertyName.charAt(0).toUpperCase() + propertyName.slice(1);
      return componentName;
    }
  },
  mounted() {
    this.formattedData = this.convertJson(this.data);
  }
}
</script>
