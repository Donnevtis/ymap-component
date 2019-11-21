<template>
  <div class="input-group mb-3">
    <div class="input-group-prepend"></div>
    <input
      class="form-control"
      :autofocus="index==0"
      aria-label
      aria-describedby="basic-addon1"
      type="text"
      :id="'suggest'+index"
      :placeholder="point.placeholder"
      ref="input"
      @change="input"
    />

    <button class="btn btn-outline-secondary" @click="clearInput" type="button">close</button>
  </div>
</template>

<script>
export default {
  props: ["point", "points", "index"],
  data() {
    return {
      adress: ""
    };
  },
  directives: {
    focus: {
      // определение директивы
      componentUpdated: function(el) {
        console.log(el.value);
      }
    }
  },
  methods: {
    input() {
      this.point.adress = this.$refs.input.value;
    },
    clearInput() {
      if (this.points.length > 2) {
        this.points.splice(this.index, 1);
        if (this.index == 0) {
          this.points[0].placeholder = "Укажите точку отправления";
        }
      } else {
        this.$refs.input.value = "";
        this.point.adress = "";
      }
    },

    focus() {
      this.$refs.input.focus();
    },
    blur() {
      this.$emit("focus");
      this.$refs.input.blur();
    }
  },
  mounted() {
    window.ymaps.ready(() => {
      const suggestView = new window.ymaps.SuggestView(this.$refs.input.id);
      suggestView.events.add("select", event => {
        this.point.adress = event.get("item").displayName;
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