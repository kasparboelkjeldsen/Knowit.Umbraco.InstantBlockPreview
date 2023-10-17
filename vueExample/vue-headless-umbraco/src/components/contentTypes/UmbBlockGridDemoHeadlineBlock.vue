<template>
  <h1>{{content.headline}}</h1>
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