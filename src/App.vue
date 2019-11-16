<template>
  <div id="Ymap">
    <div id="map">
      <div v-if="!mapIsLoaded" class="spinner">
        <div class="cube1"></div>
        <div class="cube2"></div>
      </div>
    </div>

    <routeInput
      v-for="(point, index) in points"
      :key="index"
      :point="point"
      :points="points"
      :index="index"
      @addRoute="addRoute"
    />
    <button @click="addPoint">Добавить точку назначения</button>
    <button @click="toCount">Рассчитать</button>
  </div>
</template>

<script>
import routeInput from "./components/routeInput";
export default {
  name: "Ymap",
  data() {
    return {
      mapIsLoaded: false,
      points: [
        { placeholder: "Укажите точку отправления", value: "" },
        { placeholder: "Укажите точку назначения", value: "" }
      ]
    };
  },
  components: {
    routeInput
  },
  computed: {
    pointsArray() {
      return this.points.map(item => item.value);
    }
  },
  methods: {
    addEventOnSuggest(point, index) {
      const suggestView = new this.ymaps.SuggestView("suggest" + index);
      suggestView.events.add("select", event => {
        point.value = event.get("item").displayName;
        this.addRoute();
      });
    },
    addRoute() {
      //внести изменения в маршрут
      this.route.model.setReferencePoints(this.pointsArray);
      //изменить маштаб карты в соотвествии маршруту единожды
      this.route.events.once("boundschange", () => {
        this.myMap.setBounds(this.route.getBounds(), {
          checkZoomRange: true
        });
      });
    },
    addPoint() {
      this.points.push({ placeholder: "Укажите точку назначения", value: "" });
      const i = this.points.length - 1;
      this.$nextTick().then(() => this.addEventOnSuggest(this.points[i], i));
    },
    toCount() {
      // Получение ссылки на активный маршрут.
      const activeRoute = this.route.getActiveRoute() || null;
      // Вывод информации о маршруте.
      if (!activeRoute) return;

      fetch("./moscow.json")
        .then(res => res.json())
        .then(json => {
          const moscowPolygon = new this.ymaps.Polygon(json.coordinates);
          moscowPolygon.options.set("visible", false);
          this.myMap.geoObjects.add(moscowPolygon);
          const pathsObjects = activeRoute.getPaths(),
            edges = [];

          // Переберем все сегменты и разобьем их на отрезки.
          pathsObjects.each(path => {
            const coordinates = path.properties.get("coordinates");
            for (var i = 1, l = coordinates.length; i < l; i++) {
              edges.push({
                type: "LineString",
                coordinates: [coordinates[i], coordinates[i - 1]]
              });
            }
          });

          const routeObjects = this.ymaps
              .geoQuery(edges)
              .add(this.route.getWayPoints())
              .setOptions("visible", false)
              .addToMap(this.myMap),
            objectsInMoscow = routeObjects.searchInside(moscowPolygon);
          // boundaryObjects = routeObjects.searchIntersect(moscowPolygon);

          const zamkad =
            this.getMeters(routeObjects) - this.getMeters(objectsInMoscow);
          console.log(zamkad);
        });
    },
    getMeters(geoObj) {
      let distance = 0;
      for (let i = 0; i < geoObj.getLength(); i++) {
        const coords = geoObj.get(i).geometry.getCoordinates();
        distance += this.ymaps.coordSystem.geo.getDistance(
          coords[0],
          coords[1]
        );
      }
      return distance.toFixed(0);
    }
  },
  mounted() {
    function send() {
      return new Promise(res => {
        this.yandexMapScript = document.createElement("SCRIPT");
        const apiKey = "931c09e3-a95f-458e-ad4a-bfd52f0a7338",
          lang = "ru_RU",
          version = "2.1",
          coordorder = "latlong",
          debug = false;
        const mode = debug ? "debug" : "release";
        const settingsPart = `lang=${lang}${apiKey &&
          `&apikey=${apiKey}`}&mode=${mode}&coordorder=${coordorder}`;
        const link = `https://api-maps.yandex.ru/${version}/?${settingsPart}`;
        this.yandexMapScript.setAttribute("src", link);
        this.yandexMapScript.setAttribute("async", "");
        this.yandexMapScript.setAttribute("defer", "");
        this.$el.appendChild(this.yandexMapScript);
        this.yandexMapScript.onload = () => {
          res();
        };
      });
    }

    send.call(this).then(() => {
      this.ymaps = window.ymaps;
      this.ymaps.ready(() => {
        this.myMap = new this.ymaps.Map("map", {
          center: [55.76, 37.64],
          zoom: 10,
          controls: []
        });
        //создать пустой маршрут
        this.route = new this.ymaps.multiRouter.MultiRoute(
          {
            referencePoints: ["метро сокол", "сукромка 6"],
            params: {
              avoidTrafficJams: false
            }
          },
          {
            // Автоматически устанавливать границы карты так,
            // чтобы маршрут был виден целиком.
            boundsAutoApply: true
          }
        );
        this.route.editor.start();
        this.myMap.geoObjects.add(this.route, 1);
        //навесить подсказки на поля ввода
        this.points.forEach((point, index) =>
          this.addEventOnSuggest(point, index)
        );
        this.mapIsLoaded = true;
      });
    });
  }
};
</script>

<style>
#app {
  position: absolute;
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
  height: 600px;
  width: 600px;
}
#map {
  position: relative;
  width: 600px;
  height: 600px;
}
.spinner {
  margin: 0 auto;
  width: 80px;
  height: 80px;
  position: relative;
  top: calc(50% - 40px);
}

.cube1,
.cube2 {
  background-color: #333;
  width: 30px;
  height: 30px;
  position: absolute;
  top: 0;
  left: 0;

  -webkit-animation: sk-cubemove 1.8s infinite ease-in-out;
  animation: sk-cubemove 1.8s infinite ease-in-out;
}

.cube2 {
  -webkit-animation-delay: -0.9s;
  animation-delay: -0.9s;
}

@-webkit-keyframes sk-cubemove {
  25% {
    -webkit-transform: translateX(42px) rotate(-90deg) scale(0.5);
  }
  50% {
    -webkit-transform: translateX(42px) translateY(42px) rotate(-180deg);
  }
  75% {
    -webkit-transform: translateX(0px) translateY(42px) rotate(-270deg)
      scale(0.5);
  }
  100% {
    -webkit-transform: rotate(-360deg);
  }
}

@keyframes sk-cubemove {
  25% {
    transform: translateX(42px) rotate(-90deg) scale(0.5);
    -webkit-transform: translateX(42px) rotate(-90deg) scale(0.5);
  }
  50% {
    transform: translateX(42px) translateY(42px) rotate(-179deg);
    -webkit-transform: translateX(42px) translateY(42px) rotate(-179deg);
  }
  50.1% {
    transform: translateX(42px) translateY(42px) rotate(-180deg);
    -webkit-transform: translateX(42px) translateY(42px) rotate(-180deg);
  }
  75% {
    transform: translateX(0px) translateY(42px) rotate(-270deg) scale(0.5);
    -webkit-transform: translateX(0px) translateY(42px) rotate(-270deg)
      scale(0.5);
  }
  100% {
    transform: rotate(-360deg);
    -webkit-transform: rotate(-360deg);
  }
}
</style>
