<template>
  <div :style="'background-color:#' + settings.backgroundColor">
    <h2>{{content.text}}</h2>

    <img v-if="content.image && content.image.length" id="image" :src="content.image[0].url" />
    <br />
    
    {{ content.date }}

    Hejsa!
  </div>

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

<style>
    img {
        max-width:500px;
        border-radius: 25px;
    }
    h2 {
        background: grey;
    }
</style>