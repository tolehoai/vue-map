import Vue from "vue";
import App from "./App.vue";

Vue.config.productionTip = false;

import VueGeolocation from 'vue-browser-geolocation';
Vue.use(VueGeolocation);

import * as VueGoogleMaps from "vue2-google-maps";
import VModal from 'vue-js-modal';
Vue.use(VModal)

import { BootstrapVue, IconsPlugin } from 'bootstrap-vue'

// Import Bootstrap an BootstrapVue CSS files (order is important)
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'

// Make BootstrapVue available throughout your project
Vue.use(BootstrapVue)
// Optionally install the BootstrapVue icon components plugin
Vue.use(IconsPlugin)

Vue.use(VueGoogleMaps, {
  load: {
    // key: "AIzaSyCjtuhrYRCNX2BISz_gnebCWbGvY5pxrfk",
    key: "AIzaSyCqd1XS0Jt-VUrhm_x1nY9bmQEk5xwf8Sc", //Dung OK
    // key: "AIzaSyB_WhUHEz1vlPiBEC4-9Z2Xf6TvrJ2gZjI",
    libraries: "places", // This is required if you use the Autocomplete plugin
  },
});

new Vue({
  render: (h) => h(App),
}).$mount("#app");

