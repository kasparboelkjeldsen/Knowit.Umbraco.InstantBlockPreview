<template>
  <h1 v-if="content.hSize == 'h1'">{{content.text}}</h1>
  <h2 v-if="content.hSize == 'h2'">{{content.text}}</h2>
  <h3 v-if="content.hSize == 'h3'">{{content.text}}</h3>
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