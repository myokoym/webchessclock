<template>
  <div class="container d-flex flex-row justify-content-center">
    <div class="d-flex flex-column">
      <div>
        <h1>
          webchessclock
        </h1>
      </div>
      <div class="row">
        <div class="input-group">
          <div class="input-group-prepend">
            <span class="input-group-text" id="roomId">ルームID</span>
          </div>
          <input
            type="text"
            class="form-control"
            aria-describedby="roomId"
            v-model="roomId"
          >
          <button
            type="button"
            class="btn btn-light btn-sm"
            @click="generateId"
          >自動生成</button>
        </div>
      </div>
      <div class="row">
        <div class="input-group input-group-sm">
          <div class="input-group-prepend">
            <span class="input-group-text" id="roomUrl">URL</span>
          </div>
          <input
            type="text"
            class="form-control"
            aria-describedby="roomUrl"
            v-model="roomUrl"
            readonly
          >
          <button
            type="button"
            class="btn btn-light btn-sm"
            v-clipboard:copy="this.roomUrl"
            v-bind:disabled="!this.roomId"
          >コピー</button>
        </div>
      </div>
      <div class="row">
        <button
          type="button"
          class="btn btn-primary btn-lg btn-block"
          @click="enterRoom"
          v-bind:disabled="!this.roomId"
        >入室</button>
      </div>
      <hr>
      <Usage></Usage>
    </div>
  </div>
</template>

<script>
import Vue from "vue"
import cryptoRandomString from "crypto-random-string"
import VueClipboard from "vue-clipboard2"
Vue.use(VueClipboard)
import Usage from '~/components/Usage.vue'

export default Vue.extend({
  components: {
    Usage,
  },
  data() {
    return {
      origin: "",
      roomId: "",
    }
  },
  mounted() {
    this.origin = location.origin
  },
  computed: {
    roomPath: function() {
      return "/rooms/" + this.roomId
    },
    roomUrl: function() {
      if (!this.roomId) {
        return
      }
      return this.origin + this.roomPath
    },
  },
  methods: {
    generateId() {
      this.roomId = cryptoRandomString({length: 16})
    },
    enterRoom() {
      if (!this.roomId) {
        return
      }
      this.$router.push(this.roomPath)
    },
  }
})
</script>
<style>
body {
  background-color: #7EC6FC;
}
.container {
  max-width: 768px;
}
img.title-logo {
  max-width: 100%;
  height: auto;
}
.row {
  margin: 2%;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
}
</style>