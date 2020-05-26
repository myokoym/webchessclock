<template>
  <div class="">
    <div class="d-flex flex-row flex-wrap justify-content-around">
      <div class="mt-3 mx-2 d-flex flex-column" v-for="(player, index) in players">
        <input
          type="text"
          class="form-control text-center font-weight-bold"
          size="5"
          v-bind:value="player.displayTime"
          readonly>
        <button
          type="button"
          class="btn btn-primary"
          v-on:click="changeTurn(index + 1)"
          v-bind:disabled="pause || (turn !== null && turn !== index)"
        >プレイヤー{{index + 1}}</button>
      </div>
    </div>
    <hr>
    <div class="d-flex flex-row justify-content-center">
      <button
        type="button"
        class="btn btn-light"
        v-bind:disabled="turn === undefined || turn === null || turn === NaN"
        v-on:click="togglePause()"
      >{{pause ? "　再開　" : "一時停止"}}</button>
    </div>
    <hr>
    <div class="d-flex justify-content-around">
      <InputSpinner
        class="mx-1"
        v-model="localMaster.nPlayers"
        v-bind:max="100"
        v-bind:min="2"
        label="プレイヤー人数"
      ></InputSpinner>
      <InputSpinner
        class="mx-1"
        v-model="localMaster.time"
        v-bind:max="720"
        v-bind:min="0"
        label="持ち時間（分）"
      ></InputSpinner>
      <InputSpinner
        class="mx-1"
        v-model="localMaster.countdown"
        v-bind:max="600"
        v-bind:min="0"
        label="秒読み（秒）"
      ></InputSpinner>
      <InputSpinner
        class="mx-1"
        v-model="localMaster.additional"
        v-bind:max="600"
        v-bind:min="0"
        label="追加時間（秒）"
        description="フィッシャーモード用"
      ></InputSpinner>
    </div>
    <button
      type="button"
      class="my-2 btn btn-light btn-block"
      v-bind:disabled="turn !== undefined && turn !== null && !isNaN(turn) && !pause"
      v-on:click="reset()"
    >時計をリセット / 設定を反映</button>
  </div>
</template>
<script>
import Vue from "vue"
import { mapState } from "vuex"
import InputSpinner from '~/components/InputSpinner.vue'

export default Vue.extend({
  components: {
    InputSpinner,
  },
  computed: {
    turn: function() {
      return this.$store.state.clock.turn
    },
    masterNPlayers: function() {
      return this.master.nPlayers
    },
    masterTime: function() {
      // debug: console.log("computed masterTime")
      return this.master.time
    },
    masterCountdown: function() {
      return this.master.countdown
    },
    masterAdditional: function() {
      return this.master.additional
    },
    ...mapState("clock", [
      //"playersTurn",
      "players",
      "master",
      "pause",
    ]),
  },
  data() {
    return {
      performanceNow: undefined,
      requestID: undefined,
      subtotal: 0,
      localMaster: {
        nPlayers: 2,
        time: 0,
        countdown: 0,
        additional: 0,
      },
    }
  },
  created() {
    // debug: console.log(this.localMaster)
    // debug: console.log(this.master)
    Object.assign(this.localMaster, this.master)
  },
  mounted() {
    this.startLoop()
    //this.masterTime = 5
    //this.masterCountdown = 30
  },
  watch: {
    turn: function() {
      this.subtotal = 0
    },
    masterNPlayers: function() {
      this.localMaster.nPlayers = this.master.nPlayers
    },
    masterTime: function() {
      this.localMaster.time = this.master.time
    },
    masterCountdown: function() {
      this.localMaster.countdown = this.master.countdown
    },
    masterAdditional: function() {
      this.localMaster.additional = this.master.additional
    },
  },
  methods: {
    changeTurn(nextTurn) {
      if (this.pause === true) {
        return
      }
      if (this.turn === nextTurn) {
        return
      }
      if (nextTurn >= this.players.length) {
        nextTurn = 0
      }
      //if (this.pause) {
      //  this.togglePause()
      //}
      this.$store.commit("clock/changeTurn", {
        nextTurn: nextTurn,
      })
    },
    startLoop() {
      if (!this.requestID) {
        this.performanceNow = performance.now()
        this.requestID = requestAnimationFrame(this.step)
      }
    },
    //stopLoop() {
    //  cancelAnimationFrame(this.requestID)
    //  this.performanceNow = undefined
    //  this.requestID = undefined
    //},
    step(timestamp) {
      if (this.turn !== undefined && this.turn !== null && !isNaN(this.turn) && this.pause === false) {
        //console.log(new Date(timestamp))
        //console.log(new Date(this.performanceNow))
        //console.log("step: " + timestamp)
        this.subtotal += timestamp - this.performanceNow
        //console.log("subtotal: " + this.subtotal)
        if (this.subtotal >= 100) {
          const rem = this.subtotal % 100
          this.$store.commit("clock/decreaseTime", {
            diff: this.subtotal - rem,
            turn: this.turn,
          })
          this.subtotal = rem
        }
      }
      this.performanceNow = timestamp
      requestAnimationFrame(this.step)
    },
    togglePause() {
      if (this.pause) {
        this.$store.commit("clock/cancelPause")
      } else {
        this.$store.commit("clock/pause")
      }
    },
    reset() {
      this.$store.commit("clock/setNPlayers", this.localMaster.nPlayers)
      this.$store.commit("clock/setMasterTime", this.localMaster.time)
      this.$store.commit("clock/setMasterCountdown", this.localMaster.countdown)
      this.$store.commit("clock/setMasterAdditional", this.localMaster.additional)
      this.$store.commit("clock/reset")
    },
    //emitNPlayers: function(newValue) {
    //  // debug: console.log("emitNPlayers: " + newValue)
    //  // debug: console.log(this.localMaster)
    //  this.localMaster.nPlayers = newValue
    //  // debug: console.log(this.localMaster)
    //},
    //emitMasterTime: function(newValue) {
    //  this.localMaster.time = newValue
    //},
    //emitMasterCountdown: function(newValue) {
    //  this.localMaster.countdown = newValue
    //},
    //emitMasterAdditional: function(newValue) {
    //  this.localMaster.additional = newValue
    //},
  }
})
</script>
<style>
</style>
