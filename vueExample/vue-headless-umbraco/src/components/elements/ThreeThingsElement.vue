<template>
  <div class="three-things">
    <div v-for="item in content.things?.items" :key="item" class="thing" >
      <h3>{{ item.content.properties.headline }}</h3>
      <div v-html="item.content.properties.text?.markup"></div>
    </div>
  </div>
</template>
<script>
  export default {
    props: {
      data: Object,
    },
    computed: {
      content() {
        return this.data.content.properties;
      }
    }
  }
</script>
<style lang="postcss" scoped>
 .three-things {
  display: flex;
  flex-direction: row;
  width: 100%;
  gap: 25px;
  margin: 25px 0;
 }
 .thing {
  flex: 1;
  text-align: center;
  background: #eee;
  border-radius: 25px;

 }
</style>
