<template>
  <div class="input-wrap">
    <input
      type="text"
      :id="'suggest'+index"
      :placeholder="point.placeholder"
      v-model="point.value"
      @keyup.enter="$emit('addRoute')"
    />
    <div class="input-close" @click="clearInput" />
  </div>
</template>

<script>
export default {
  props: ["point", "points", "index"],
  methods: {
    clearInput() {
      if (this.points.length > 2) {
        this.points.splice(this.index, 1);
        this.$emit("addRoute");
      } else this.point.value = "";
    }
  }
};
</script>

<style>
.input-wrap {
  position: relative;
  display: flex;
  width: 250px;
  height: 30px;
}
.input-wrap:not(:hover) > .input-close {
  display: none;
}
.input-wrap input {
  position: relative;
  width: 100%;
}
.input-close {
  position: absolute;
  width: 30px;
  height: 30px;
  right: 0;
  opacity: 0.7;
  cursor: pointer;
  background: url("../assets/close.svg") center no-repeat;
}
</style>