<template>
  <div v-html="content.richText.markup"></div>
</template>
<script>
export default {
  props: {
    data: Object
  },
  computed: {
    content() { return this.data.content.properties },
    settings() { return this.data.settings.properties }
  },
}
</script>