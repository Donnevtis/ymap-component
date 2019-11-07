<template>
  <div id="map" style="width: 600px; height: 600px"></div>
</template>

<script>
export default {
  name: "yandex-map",
  data() {
    return {};
  },
  mounted() {
    function send() {
      return new Promise(res => {
        const yandexMapScript = document.createElement("SCRIPT");
        const apiKey = "",
          lang = "ru_RU",
          version = "2.1",
          coordorder = "latlong",
          debug = false;
        const mode = debug ? "debug" : "release";
        const settingsPart = `lang=${lang}${apiKey &&
          `&apikey=${apiKey}`}&mode=${mode}&coordorder=${coordorder}`;
        const link = `https://api-maps.yandex.ru/${version}/?${settingsPart}`;
        yandexMapScript.setAttribute("src", link);
        // yandexMapScript.setAttribute("async", "");
        // yandexMapScript.setAttribute("defer", "");
        this.$el.appendChild(yandexMapScript);
        console.log(window.document);
        yandexMapScript.onload = () => {
          res();
        };
      });
    }
    send.call(this).then(() => {
      window.ymaps.ready(() => {
        this.ymaps = window.ymaps;
        new this.ymaps.Map(this.$el, {
          center: [55.76, 37.64],
          zoom: 10,
          controls: ["default", "routeButtonControl"]
        });
      });
    });
  }
};
</script>

<style>
</style>