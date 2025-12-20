<template>
  <div class="wrapper-container">
    <home-header v-model="value"></home-header>
    {{ value }}
    <!--  列表数据，  -->
  </div>
</template>
<script>
import homeHeader from "@/views/home/home-header.vue";

export default {
  components: {
    homeHeader,
  },
  data() {
    return {
      value: -1,
    }
  }
}
</script>