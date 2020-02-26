<template>
  <div class="input-group mb-3">
    <input
      type="text"
      class="form-control"
      @keyup.enter="onInput"
      :autofocus="index == 0"
      aria-describedby="adress-input"
      :id="'suggest' + index"
      :placeholder="point.placeholder"
      ref="input"
      :required="index < 2 ? true : false"
    />

    <div class="input-group-append">
      <button
        class="btn btn-outline-secondary"
        aria-label="Close"
        type="button"
        @click="clearField"
      >удалить</button>
    </div>
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
.form-control {
  border-top-left-radius: 0.25rem !important ;
  border-bottom-left-radius: 0.25rem !important ;
}
</style>
