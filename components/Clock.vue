<template>
  <div class="">
    <div v-for="(player, index) in players">
      <span>{{player.displayTime}}</span>
      <button
        type="button"
        v-on:click="changeTurn(index + 1)"
        v-bind:disabled="pause || (turn !== null && turn !== index)"
      >プレイヤー{{index + 1}}のボタン</button>
    </div>
    <button type="button" v-if="turn !== undefined && turn !== null && turn !== NaN" v-on:click="togglePause()">{{pause ? "再開" : "一時停止"}}</button>
    {{turn}}
    {{pause}}
    {{players}}
    {{master}}
    <hr>
    <div class="d-flex justify-content-around align-items-center">
      <InputSpinner
        v-model="master.nPlayers"
        v-bind:emit="emitNPlayers"
        v-bind:max="8"
        v-bind:min="2"
        label="人数"
      ></InputSpinner>
      <InputSpinner
        v-model="master.time"
        v-bind:emit="emitMasterTime"
        v-bind:max="540"
        v-bind:min="0"
        label="持ち時間（分）"
      ></InputSpinner>
      <InputSpinner
        v-model="master.countdown"
        v-bind:emit="emitMasterCountdown"
        v-bind:max="300"
        v-bind:min="0"
        label="秒読み（秒）"
      ></InputSpinner>
    </div>
    <hr>
    <button type="button" v-bind:disabled="turn !== undefined && turn !== null && turn !== NaN && !pause && !zero" v-on:click="reset()">リセット</button>
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
    zero: function() {
      return this.players[0].time === 0 ||
             this.players[1].time === 0
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
      if (this.turn !== undefined && this.turn !== null && this.turn !== NaN && this.pause === false) {
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
      this.$store.commit("clock/reset")
    },
    emitNPlayers: function(newValue) {
      console.log("emitNPlayers: " + newValue)
      this.$store.commit("clock/emitNPlayers", {nPlayers: newValue})
    },
    emitMasterTime: function(newValue) {
      this.$store.commit("clock/emitMasterTime", {masterTime: newValue})
    },
    emitMasterCountdown: function(newValue) {
      this.$store.commit("clock/emitMasterCountdown", {countdown: newValue})
    },
  }
})
</script>
<style>
</style>
