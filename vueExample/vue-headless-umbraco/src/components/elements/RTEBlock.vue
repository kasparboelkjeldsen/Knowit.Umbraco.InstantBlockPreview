<template>
  <div v-html="content.richText?.markup"/>
</template>
<script>
  export default {
    props: {
      data: Object
    },
    computed: {
      content() {
        return this.data.content.properties;
      }
    }
  }
</script>