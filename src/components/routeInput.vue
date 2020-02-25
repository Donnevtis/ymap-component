<template>
  <div class="input-group mb-3">
    <div class="input-group-prepend"></div>
    <input
      @keyup.enter="onInput"
      class="form-control"
      :autofocus="index == 0"
      aria-describedby="adress-input"
      type="text"
      :id="'suggest' + index"
      :placeholder="point.placeholder"
      ref="input"
      :required="index < 2 ? true : false"
    />
    <button class="btn btn-outline-secondary" @click="clearField" type="button">удалить</button>
  </div>
</template>

<script>
export default {
  props: ["point", "index"],
  methods: {
    onInput() {
      //вызвать событие, если не выбрана подсказка
      if (this.suggestView.state.get("panelClosed")) {
        this.$emit("input", this.$refs.input.value);
        this.blur();
      }
    },
    focus() {
      this.$refs.input.focus();
    },
    blur() {
      this.$emit("focus");
      this.$refs.input.blur();
    },
    clearField() {
      this.$refs.input.value = "";
      this.$emit("clearInput", this.index);
    }
  },
  created() {
    window.ymaps.ready(() => {
      this.suggestView = new window.ymaps.SuggestView(this.$refs.input.id);
      this.suggestView.events.add("select", event => {
        this.$emit("input", event.get("item").value);
        this.blur();
      });
    });
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
