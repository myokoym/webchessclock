<template>
  <div class="">
    対局時計: {{displayBTime}} : {{displayWTime}}
    <button type="button" v-on:click="changeTurn('w')" v-bind:disabled="pause || turn === 'w'">先手側のボタン</button>
    <button type="button" v-on:click="changeTurn('b')" v-bind:disabled="pause || turn === 'b'">後手側のボタン</button>
    <button type="button" v-if="turn" v-on:click="togglePause()">{{pause ? "再開" : "一時停止"}}</button>
    <button type="button" v-bind:disabled="turn && !pause && !zero" v-on:click="reset()">リセット</button>
    {{turn}}
    {{$store.state.clock.turn}}
    {{pause}}
  </div>
</template>
<script>
import Vue from "vue"
import { mapState } from "vuex"

export default Vue.extend({
  computed: {
    displayBTime: function() {
      //console.log("displayBTime")
      return this.displayTime(this.current['b'].time)
    },
    displayWTime: function() {
      return this.displayTime(this.current['w'].time)
    },
    turn: function() {
      return this.$store.state.clock.turn
    },
    zero: function() {
      return this.current['b'].time === 0 ||
             this.current['w'].time === 0
    },
    ...mapState("clock", [
      //"currentTurn",
      "current",
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
  mounted() {
    this.startLoop()
  },
  watch: {
    turn: function() {
      this.subtotal = 0
    },
  },
  methods: {
    displayTime(timeLimit) {
      const timeLimitSecond = Math.floor(timeLimit / 1000)
      const min = Math.floor(timeLimitSecond / 60)
      let sec = timeLimitSecond % 60
      if (sec < 10) {
        sec = "0" + sec
      }
      return min + ":" + sec
    },
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
      if (this.pause === false) {
        this.subtotal += timestamp - this.performanceNow
        if (this.subtotal >= 100) {
          const rem = this.subtotal % 100
          this.$store.commit("clock/decreaseTimeLimit", {
            diff: this.subtotal - rem,
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
  }
})
</script>
<style>
</style>
