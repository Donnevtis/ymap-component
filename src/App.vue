<template>
  <div
    id="Ymap"
    class="container py-3 px-1 d-md-flex flex-md-row justify-content-between"
    style="height:100vh"
  >
    <div class="col-md-4 col-sm-12 mb-3">
      <routeInput
        v-for="(point, index) in points"
        :key="point.id"
        :point="point"
        :index="index"
        v-model="point.adress"
        @input="addRoute"
        @clearInput="clearInput"
        @focus="focus"
        ref="routeInput"
      />

      <button
        class="btn btn-secondary btn-md btn-block"
        @click.prevent="addPoint"
      >Добавить точку назначения</button>

      <br />
      <h6>
        Общее расстояние:
        <span>{{distance.all + ' км'}}</span>
      </h6>
      <h6 v-if="distance.inside">Расстояние в пределах МКАД: {{distance.inside + ' км'}}</h6>
      <h6 v-if="distance.outside">Расстояние за МКАД: {{distance.outside + ' км'}}</h6>
      <h6>
        Сумма:
        <span v-if="isSubmit">{{sum + '₽'}}</span>
        <div v-else class="spinner-border text-secondary spinner-border-sm" role="status">
          <span class="sr-only">Loading...</span>
        </div>
      </h6>

      <form v-if="isCounted" @submit.prevent="submit">
        <div class="form-group">
          <label for="inputEmail">Введите адрес для получения данных о заказе</label>
          <input
            type="email"
            class="form-control"
            id="inputEmail"
            aria-describedby="emailHelp"
            placeholder="email@example.com"
            name="email"
            required
            v-model="email"
          />
        </div>

        <input
          :disabled="isSuccess|| loading"
          type="submit"
          class="btn btn-primary"
          value="Отправить"
        />

        <div v-if="isSuccess" class="mt-3 alert alert-success" role="alert">Заявка принята</div>

        <div v-else-if="loading" class="d-flex justify-content-center">
          <div class="spinner-grow text-secondary" role="status">
            <span class="sr-only">Loading...</span>
          </div>
        </div>
      </form>
    </div>
    <div id="map" class="col-md-8 mb-3">
      <div v-if="!mapIsLoaded" class="spinner">
        <div class="cube1"></div>
        <div class="cube2"></div>
      </div>
    </div>
  </div>
</template>

<script>
import routeInput from "./components/RouteInput.vue";
import Coordinates from "./assets/moscow.json";
import { v4 as uuid } from "uuid";
import axios from "axios";
const countUrl = process.env.VUE_APP_COUNTURL,
      submitUrl = process.env.VUE_APP_SUBMITURL;

export default {
  name: "Ymap",
  components: {
    routeInput
  },
  data() {
    return {
      email: "",
      mapIsLoaded: false,
      isSuccess: false,
      isSubmit: true,
      isCounted: false,
      loading: false,
      points: [
        { placeholder: "Укажите точку отправления", adress: "", id: uuid() },
        { placeholder: "Укажите точку назначения", adress: "", id: uuid() }
      ],
      distance: {
        inside: 0,
        outside: 0,
        all: 0
      },
      sum: 0
    };
  },

  computed: {
    pointsArray() {
      return this.points
        .map(item => (item.adress ? item.adress : null))
        .filter(item => item !== null);
    },
    routeLength() {
      return this.points.length;
    }
  },

  watch: {
    routeLength(n, o) {
      if (n < o) this.addRoute();
    }
  },

  methods: {
    clearInput(index) {
      this.isCounted = false;
      if (this.points.length > 2) {
        this.points.splice(index, 1);
        if (index == 0) {
          this.points[0].placeholder = "Укажите точку отправления";
        }
      } else {
        this.points[index].adress = "";
        this.distance = {
          inside: 0,
          outside: 0,
          all: 0
        };
        this.sum = 0;
        this.addRoute();
      }
    },

    focus() {
      const targets = this.$refs.routeInput;
      const empty = targets.find(item => !item.point.adress);
      if (empty) empty.focus();
    },

    addRoute() {
      this.isSuccess = false;
      //внести изменения в маршрут
      if (!this.pointsArray.length) return;
      this.route.model.setReferencePoints(this.pointsArray);
      //изменить маштаб и просчитать маршрут карты в соотвествии маршруту
      if (this.pointsArray.length >= 2)
        this.route.model.events.once("requestsuccess", () => this.toCount());
      this.route.events.once("boundschange", () => {
        this.myMap.setBounds(this.route.getBounds(), {
          checkZoomRange: true
        });
      });
    },

    addPoint() {
      this.isCounted = false;
      this.points.push({
        placeholder: "Укажите точку назначения",
        adress: "",
        id: uuid()
      });
      const refs = this.$refs.routeInput;
      this.$nextTick().then(() => refs[refs.length - 1].focus());
    },

    getSum() {
      this.isSubmit = false;
      axios(
        countUrl,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          data: JSON.stringify(this.distance)
        }
      ).then(res => {
        this.sum = res.data;
        this.isSubmit = this.isCounted = true;
      });
    },

    submit() {
      const { inside, outside } = this.distance;
      this.loading = true;
      axios(
        submitUrl,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          data: JSON.stringify({
            inside,
            outside,
            adresses: this.pointsArray,
            email: this.email
          })
        }
      ).then(res => {
        if (res.status == 200) {
          this.loading = false;
          this.isSuccess = true;
        }
      });
    },

    toCount() {
      // Получение ссылки на активный маршрут.
      const activeRoute = this.route.getActiveRoute() || null;
      if (!activeRoute) return;

      // Вывод информации о маршруте.
      const moscowPolygon = new this.ymaps.Polygon(Coordinates);
      moscowPolygon.options.set("visible", false);
      this.myMap.geoObjects.add(moscowPolygon);
      const pathsObjects = activeRoute.getPaths(),
        edges = [];

      // Перебрать все сегменты и разобить их на отрезки.
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
      this.distance = this.getMeters(
        routeObjects,
        objectsInMoscow,
        activeRoute
      );
      this.getSum();
    },

    getMeters(geoAll, geoInside, activeRoute) {
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
      const all = activeRoute.properties.get("distance").value;
      const inside = generateDistance.call(this, geoInside);
      const outside = all - inside;
      const distances = { all, inside, outside };
      for (let prop in distances) {
        distances[prop] = +(distances[prop] / 1000).toFixed(1);
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
