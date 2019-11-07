<template>
  <div id="Ymap">
    <yandexMap ref="ym" />
  </div>
</template>

<script>
import yandexMap from "./components/yandexMap";
import RollupESMBundler from './components/RollupESMBundler.vue'

export default {
  name: "Ymap",
  data() {
    return {
      text: "reasdfas"
    };
  },

  components: {
    RollupESMBundler,
    yandexMap
  }
};
</script>

<style>
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
.map {
  height: 600px;
}
</style>
