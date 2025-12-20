<template>
  <div class="wrapper-container">
    <div class="home-header">
      <img src="@/assets/logo.png"/>
      <van-dropdown-menu>
        <van-dropdown-item :options="options" :value="value" @change="change"></van-dropdown-item>
      </van-dropdown-menu>
    </div>
  </div>

</template>

<script>
export default {
  props: {
    value: Number
  },
  methods: {
    change(newValue) {
      this.$emit("input", newValue);
    }
  },
  data() {
    return {
      options: [
        {text: '全部课程', value: -1},
        {text: 'node 课程', value: 0},
        {text: 'react 课程', value: 1},
        {text: 'vue 课程', value: 2},
      ]
    }
  }
}
</script>
<style lang="scss" scoped>
.home-header {
  display: flex;
  justify-content: space-between;
  height: 48px;
  background-color: $background-color;
  padding: 0 20px;
  align-items: center;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  box-sizing: border-box;

  img {
    width: 30px;
    height: 30px;
  }
}

.wrapper-container {
  padding-top: 48px;
}
</style>