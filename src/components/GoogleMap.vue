<template>
  <div class="map">
    <h1>Google Map - Point of Interest</h1>
    <button @click="chiduong()">Click</button>
    <GmapAutocomplete @place_changed="setPlace" />
    <span>Chọn thành phố</span>

    <select v-model="selectedCity" @change="onCityChange($event)">
      <option
        v-for="(city, index) in cityInfo"
        v-bind:value="city.name"
        v-bind:key="index"
      >
        {{ city.name }}
      </option>
    </select>
    <span>Chọn loại địa điểm</span>

    <select v-model="typeOfPlace" @change="onPlaceTypeChange($event)">
      <option
        v-for="(place, index) in placeInfo"
        v-bind:value="place.type"
        v-bind:key="index"
      >
        {{ place.name }}
      </option>
    </select>
    <p v-if="!loadMap">Loading map...</p>
    <div>
      <b-table
        hover
        :items="hotelListOfCity"
        :fields="usergroupTable.fields"
        responsive="sm"
        striped
        @row-clicked="myRowClickHandler"
      ></b-table>
    </div>

    <GmapMap
      v-if="loadMap"
      ref="map"
      :center="{ lat: this.position.lat, lng: this.position.lng }"
      :zoom="16"
      map-type-id="hybrid"
      style="width: 99vw; height: 550px"
      gestureHandling="greedy"
    >
      <DirectionsRenderer
        travelMode="DRIVING"
        :origin="position"
        :destination="endLocation"
      />
      <GmapMarker
        :key="this.position.lng"
        :position="this.position"
        :clickable="true"
        :draggable="true"
        @click="center = this.position"
      />
      <GmapMarker
        :key="index"
        v-for="(m, index) in markers"
        :position="m"
        @click="directions(m)"
      />
    </GmapMap>
  </div>
</template>

<script>
import axios from "axios";
import DirectionsRenderer from "./DirectionsRenderer";
const es = new EventSource(`http://10.233.6.135:8081/events/poi`);
export default {
  name: "GoogleMap",
  components: { DirectionsRenderer },
  props: {
    msg: String,
  },

  data() {
    return {
      currentPositionOfCity: {},
      usergroupTable: {
        fields: [
          { key: "address", label: "Address" },
          { key: "cityName", label: "City Name" },
          { key: "hotelName", label: "Hotel Name" },
          { key: "icaoCode", label: "ICAO" },
        ],
      },
      hotelListOfCity: [],
      // startLocation: {
      //   lat: 10.0299337,
      //   lng: 105.7706153,
      // },
      endLocation: null,
      markers: [],
      typeOfPlace: "",
      loadMap: false,
      location: null,
      gettingLocation: false,
      errorStr: null,
      position: {
        lat: 0,
        lng: 0,
      },
      cityInfo: [],
      placeInfo: [
        {
          type: "school",
          name: "Trường học",
        },
        {
          type: "hotel",
          name: "Khách sạn",
        },
        {
          type: "restaurant",
          name: "Nhà hàng",
        },
        {
          type: "amt",
          name: "Cây ATM",
        },
      ],
      selectedCity: "",
      poi: [],
    };
  },
  methods: {
    myRowClickHandler(record, index) {
      console.log("row poi: ", this.poi);
      console.log(record.hotelId, index); // This will be the item data for the row
      axios
        .get(
          `http://10.233.6.135:8081/records/hotels/byIdOnCity/${record.hotelId}`
        )
        .then((response) => {
          console.log("hotel info ", response);
          console.log("object: ", response.data.rows[0].hotel.geo);
          this.$refs.map.panTo({
            lat: response.data.rows[0].hotel.geo.lat,
            lng: response.data.rows[0].hotel.geo.lon,
          });
          axios
            .post(
              "http://10.233.6.135:8081/records/select/geo",
              response.data.rows[0].hotel.geo
            )
            .then(() => {
              // console.log("aroud: ", this.poi);
            })
            .catch((error) => {
              console.log(error);
            });
        })
        .catch((e) => {
          this.errors.push(e);
        });
    },
    directions(destination) {
      console.log(destination);

      this.endLocation = {
        lat: destination.lat,
        lng: destination.lng,
      };
    },

    async getLocation() {
      return new Promise((resolve, reject) => {
        if (!("geolocation" in navigator)) {
          reject(new Error("Geolocation is not available."));
        }

        navigator.geolocation.getCurrentPosition(
          (pos) => {
            resolve(pos);
          },
          (err) => {
            reject(err);
          }
        );
      });
    },
    async locateMe() {
      this.gettingLocation = true;
      try {
        this.gettingLocation = false;
        this.location = await this.getLocation();
        this.position.lat = this.location.coords.latitude;
        this.position.lng = this.location.coords.longitude;
        this.loadMap = true;
      } catch (e) {
        this.gettingLocation = false;
        this.errorStr = e.message;
      }
    },
    getCurrentPosition() {
      const success = (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        this.position.lat = latitude;
        this.position.lng = longitude;
        // Do something with the position
      };

      const error = (err) => {
        console.log(err);
      };
      // This will open permission popup
      navigator.geolocation.getCurrentPosition(success, error);
    },

    onCityChange(event) {
      // this.selectedCity = event.target.value;
      // console.log(event.target.value);
      // let citySelected = this.cityInfo.find(
      //   (city) => city.value === this.selectedCity
      // );

      // this.position.lat = citySelected.position.lat;
      // this.position.lng = citySelected.position.lng;
      console.log(event.target.value);
      this.selectedCity = event.target.value;
      axios
        .get(
          `http://10.233.6.135:8081/records/hotels/byCity/${this.selectedCity}`
        )
        .then((response) => {
          console.log("result ", response.data.rows);
          this.hotelListOfCity = [];
          response.data.rows.map((item) => {
            return this.hotelListOfCity.push({
              hotelName: item.hotel.name,
              address: item.hotel.address,
              cityName: item.hotel.city,
              icaoCode: item.airport.icao,
              hotelId: item.hotel.id,
            });
          });
          console.log("state: ", this.hotelListOfCity);
          // this.hotelListOfCity.hotelName = response.data.rows.hotel.name;

          //   this.hotelListOfCity=[
          // {
          //   hotelName: response.data.rows.hotel.name,
          //   address: response.data.rows.hotel.address,
          //   cityName: response.data.rows.hotel.city,
          //   icaoCode: response.data.rows.airport.icao,
          // },
          // ],
        })
        .catch((e) => {
          this.errors.push(e);
        });
    },
    onPlaceTypeChange(event) {
      console.log(event.target.value);
      axios
        .get(
          `https://places.sit.ls.hereapi.com/places/v1/discover/search?apikey=Y3lgBBhn3TgZ1IeXplemk9SdhSTg9V6KlbL0Mh3SEBE&at=${this.position.lat},${this.position.lng}&q=${this.typeOfPlace}&pretty`
        )
        .then((response) => {
          console.log(response);
          const newResponse = JSON.parse(JSON.stringify(response));
          newResponse.data.results.items.forEach((value) => {
            var position = {
              lat: value.position[0],
              lng: value.position[1],
            };
            this.markers.push(position);
          });

          console.log(this.markers);
        })
        .catch((e) => {
          this.errors.push(e);
        });
    },

    setPlace(place) {
      console.log("info: ", place);
      console.log("lat: ", place.geometry.location.lat());
      console.log("lng: ", place.geometry.location.lng());
    },
  },
  created() {
    this.locateMe();
    console.log(this.markers);
  },
  mounted() {
    es.addEventListener("poi", (event) => {
      this.markers = [];
      // console.log("return: ", JSON.parse(JSON.parse(event.data)));
      this.poi = JSON.parse(JSON.parse(event.data));
      this.poi.forEach((value) => {
        var position = {
          lat: value.position[0],
          lng: value.position[1],
        };
        this.markers.push(position);
      });
      console.log("poi: ", this.poi);
      console.log("marker: ", this.markers);
    });
    axios
      .get(`http://10.233.6.135:8081/records/destinations`)
      .then((response) => {
        console.log(response);
        this.cityInfo = response.data.rows;
      })
      .catch((e) => {
        this.errors.push(e);
      });
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
