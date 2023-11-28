<template>
  <GridVue :data="data.grid"></GridVue>
</template>
<script>
import GridVue from '../contentTypes/Grid.vue';

export default {
  components: {
    GridVue
  },
  props: {
    data: Object
  },
}
</script>