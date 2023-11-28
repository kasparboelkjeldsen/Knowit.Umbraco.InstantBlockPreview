<template>
 <img v-if="content.image && content.image.length" :src="content.image[0].url" :alt="content.image[0].altText" />
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
<style scoped>
  img{
    max-width: 100%;
  }
</style>