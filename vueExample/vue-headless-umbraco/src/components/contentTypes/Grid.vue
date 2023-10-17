<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div v-if="data">
  <section class="grid" v-for="item in data.items" :key="item">
    <div :class="'grid-col-'+item.columnSpan">
      <DynamicContent :data="item"></DynamicContent>
      <!--handle areas-->
      <section class="grid" v-if="item.areas.length">
        <div :class="'grid-col-'+area.columnSpan" v-for="area in item.areas" :key="area">
          <div v-for="areaItem in area.items" :key="areaItem">
          <DynamicContent :data="areaItem"></DynamicContent>
          </div>
        </div>
      </section>
    </div>
  </section>
  </div>
</template>

<script>
import DynamicContent from './../DynamicContent.vue';
export default {
  components: {
    DynamicContent
  },
  props: {
    data: Object
  },
  
}
</script>
<style lang="postcss" scoped>
.grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);

  /* Nested column classes */
  .grid-col-1 { grid-column: span 1; }
  .grid-col-2 { grid-column: span 2; }
  .grid-col-3 { grid-column: span 3; }
  .grid-col-4 { grid-column: span 4; }
  .grid-col-5 { grid-column: span 5; }
  .grid-col-6 { grid-column: span 6; }
  .grid-col-7 { grid-column: span 7; }
  .grid-col-8 { grid-column: span 8; }
  .grid-col-9 { grid-column: span 9; }
  .grid-col-10 { grid-column: span 10; }
  .grid-col-11 { grid-column: span 11; }
  .grid-col-12 { grid-column: span 12; }

  .grid {
    display: grid;
    grid-template-columns: repeat(12, 1fr);
  }
}

</style>