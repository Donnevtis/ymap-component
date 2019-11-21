import Vue from 'vue'
import App from './App.vue'


function link() {
    const apiKey = "931c09e3-a95f-458e-ad4a-bfd52f0a7338",
        lang = "ru_RU",
        version = "2.1",
        coordorder = "latlong",
        debug = false;
    const mode = debug ? "debug" : "release";
    const settingsPart = `lang=${lang}${apiKey &&
        `&apikey=${apiKey}`}&mode=${mode}&coordorder=${coordorder}`;
    return `https://api-maps.yandex.ru/${version}/?${settingsPart}`;
}

fetch(link())
    .then(res => res.text())
    .then(res => {
        eval.call(window, res)
        Vue.config.productionTip = false
        new Vue({
            render: h => h(App),
        }).$mount('#app')

    })