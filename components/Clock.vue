<template>
  <div class="">
    対局時計: {{players[0].displayTime}} : {{players[1].displayTime}}
    <button type="button" v-on:click="changeTurn(1)" v-bind:disabled="pause || turn === 1">先手側のボタン</button>
    <button type="button" v-on:click="changeTurn(0)" v-bind:disabled="pause || turn === 0">後手側のボタン</button>
    <button type="button" v-if="turn !== undefined" v-on:click="togglePause()">{{pause ? "再開" : "一時停止"}}</button>
    {{turn}}
    {{pause}}
    {{players}}
    {{master}}
    <hr>
    <div class="d-flex justify-content-around align-items-center">
      <InputSpinner
        v-model="nPlayers"
        v-bind:emit="emitNPlayers"
        v-bind:max="2"
        label="人数"
      ></InputSpinner>
      <InputSpinner
        v-model="master.time"
        v-bind:emit="emitMasterTime"
        v-bind:max="540"
        label="持ち時間（分）"
      ></InputSpinner>
      <InputSpinner
        v-model="master.countdown"
        v-bind:max="300"
        label="秒読み（秒）"
      ></InputSpinner>
    </div>
    <hr>
    <button type="button" v-bind:disabled="turn !== undefined && !pause && !zero" v-on:click="reset()">リセット</button>
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
    displayTime1: function() {
      console.log("displayTime1")
      console.log(this.players[0].time)
      return this.displayTime(this.players[0].time)
    },
    displayTime2: function() {
      return this.displayTime(this.players[1].time)
    },
    turn: function() {
      return this.$store.state.clock.turn
    },
    zero: function() {
      return this.players[0].time === 0 ||
             this.players[1].time === 0
    },
    ...mapState("clock", [
      //"playersTurn",
      "nPlayers",
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
      displayTimes: ["0:00", "0:00"],
    }
  },
  created() {
    //this.reset()
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
  },
  methods: {
    changeTurn(nextTurn) {
      if (this.pause === true) {
        return
      }
      if (this.turn === nextTurn) {
        return
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
      if (this.turn !== undefined && this.pause === false) {
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
      this.$store.commit("clock/reset")
    },
    emitNPlayers: function(newValue) {
      console.log("emitNPlayers: " + newValue)
      this.$store.commit("clock/emitNPlayers", {nPlayers: newValue})
    },
    emitMasterTime: function(newValue) {
      this.$store.commit("clock/emitMasterTime", {masterTime: newValue})
    },
  }
})
</script>
<style>
</style>
