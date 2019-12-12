<template>
  <div id="Ymap" class="container">
    <div class="row">
      <div id="map" class="col-md-8 col-sm-12 mb-4 mt-4 order-md-4">
        <div v-if="!mapIsLoaded" class="spinner">
          <div class="cube1"></div>
          <div class="cube2"></div>
        </div>
      </div>
      <div class="col-md-4 col-sm-12 mt-4 mb-4">
        <div class="row">
          <routeInput
            v-for="(point, index) in points"
            :key="index"
            :point="point"
            :points="points"
            :index="index"
            @focus="focus"
            ref="routeInput"
          />
        </div>

        <div class="row">
          <button
            class="btn btn-secondary btn-md btn-block"
            @click="addPoint"
          >Добавить точку назначения</button>
          <button class="btn btn-primary btn-md btn-block" @click="toCount">Рассчитать</button>
        </div>
        <br />
        <h6>Общее расстояние: {{distance.all + ' км'}}</h6>
        <h6 v-if="distance.inside">Расстояние в пределах МКАД: {{distance.inside + ' км'}}</h6>
        <h6 v-if="distance.outside">Расстояние за МКАД: {{distance.outside + ' км'}}</h6>
      </div>
    </div>
    <forma />
  </div>
</template>

<script>
import routeInput from "./components/routeInput";

export default {
  name: "Ymap",
  components: {
    routeInput
  },

  data() {
    return {
      mapIsLoaded: false,
      adress: "",
      points: [
        { placeholder: "Укажите точку отправления", adress: "" },
        { placeholder: "Укажите точку назначения", adress: "" }
      ],
      distance: {
        inside: 0,
        outside: 0,
        all: 0
      }
    };
  },

  computed: {
    pointsArray() {
      return this.points
        .map(item => (item.adress ? item.adress : null))
        .filter(item => item !== null);
    }
  },
  watch: {
    pointsArray() {
      this.addRoute();
    }
  },
  methods: {
    focus() {
      const targets = this.$refs.routeInput;
      const empty = targets.find(item => !item.point.adress);
      if (empty) empty.focus();
    },

    addRoute() {
      //внести изменения в маршрут
      if (!this.pointsArray.length) return;
      this.route.model.setReferencePoints(this.pointsArray);
      //изменить маштаб карты в соотвествии маршруту единожды
      this.route.events.once("boundschange", () => {
        this.myMap.setBounds(this.route.getBounds(), {
          checkZoomRange: true
        });
      });
    },
    addPoint() {
      this.points.push({ placeholder: "Укажите точку назначения", adress: "" });
      const refs = this.$refs.routeInput;
      this.$nextTick().then(() => refs[refs.length - 1].focus());
    },
    toCount() {
      // Получение ссылки на активный маршрут.
      const activeRoute = this.route.getActiveRoute() || null;
      // Вывод информации о маршруте.
      if (!activeRoute) return;
      const json = require("./assets/moscow.json");

      const moscowPolygon = new this.ymaps.Polygon(json.coordinates);
      moscowPolygon.options.set("visible", false);
      this.myMap.geoObjects.add(moscowPolygon);
      const pathsObjects = activeRoute.getPaths(),
        edges = [];

      // Переберем все сегменты и разобьем их на отрезки.
      pathsObjects.each(path => {
        const coordinates = path.properties.get("coordinates");
        for (let i = 1, l = coordinates.length; i < l; i++) {
          edges.push({
            type: "LineString",
            coordinates: [coordinates[i], coordinates[i - 1]]
          });
        }
      });

      const routeObjects = this.ymaps
          .geoQuery(edges)
          .setOptions("visible", false)
          .addToMap(this.myMap),
        objectsInMoscow = routeObjects.searchInside(moscowPolygon);

      this.distance = this.getMeters(routeObjects, objectsInMoscow);
    },
    getMeters(geoAll, geoInside) {
      function* generatePathLength(geoObj) {
        for (let i = 0; i < geoObj.getLength(); i++) {
          const coords = geoObj.get(i).geometry.getCoordinates();
          yield this.ymaps.coordSystem.geo.getDistance(coords[0], coords[1]);
        }
      }
      function generateDistance(geoObj) {
        let distance = 0;
        for (const key of generatePathLength.call(this, geoObj)) {
          distance += key;
        }
        return distance;
      }
      const all = generateDistance.call(this, geoAll);
      const inside = generateDistance.call(this, geoInside);
      const outside = all - inside;
      const distances = { all, inside, outside };
      for (let prop in distances) {
        distances[prop] = (distances[prop].toFixed(0) / 1000).toFixed(1);
      }

      return distances;
    }
  },
  mounted() {
    window.ymaps.ready(() => {
      this.ymaps = window.ymaps;
      this.myMap = new this.ymaps.Map("map", {
        center: [55.76, 37.64],
        zoom: 10,
        controls: []
      });
      //  создать пустой маршрут
      this.route = new this.ymaps.multiRouter.MultiRoute(
        {
          referencePoints: [],
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
      this.mapIsLoaded = true;
    });
  },
  beforeDestroy() {
    this.myMap.destroy();
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
#map {
  height: 60vh;
}
@media (max-width: 768px) {
  #map {
    height: 100vmin;
  }
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
