<template>
  <div class="">
    <div class="d-flex flex-row flex-wrap">
      <div class="mt-3 mr-3 d-flex flex-column" v-for="(player, index) in players">
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
    <button
      type="button"
      class="btn btn-light"
      v-bind:disabled="turn === undefined || turn === null || turn === NaN"
      v-on:click="togglePause()"
    >{{pause ? "　再開　" : "一時停止"}}</button>
    <hr>
    <div class="d-flex justify-content-around">
      <InputSpinner
        class="mx-1"
        v-model="master.nPlayers"
        v-bind:emit="emitNPlayers"
        v-bind:max="8"
        v-bind:min="2"
        label="プレイヤー人数"
      ></InputSpinner>
      <InputSpinner
        class="mx-1"
        v-model="master.time"
        v-bind:emit="emitMasterTime"
        v-bind:max="540"
        v-bind:min="0"
        label="持ち時間（分）"
      ></InputSpinner>
      <InputSpinner
        class="mx-1"
        v-model="master.countdown"
        v-bind:emit="emitMasterCountdown"
        v-bind:max="300"
        v-bind:min="0"
        label="秒読み（秒）"
      ></InputSpinner>
      <InputSpinner
        class="mx-1"
        v-model="master.additional"
        v-bind:emit="emitMasterAdditional"
        v-bind:max="300"
        v-bind:min="0"
        label="追加時間（秒）"
        description="フィッシャーモード用"
      ></InputSpinner>
    </div>
    <button
      type="button"
      class="my-2 btn btn-light btn-block"
      v-bind:disabled="turn !== undefined && turn !== null && turn !== NaN && !pause"
      v-on:click="reset()"
    >設定を反映して時計をリセット</button>
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
      // debug: console.log("emitNPlayers: " + newValue)
      this.$store.commit("clock/emitNPlayers", {nPlayers: newValue})
    },
    emitMasterTime: function(newValue) {
      this.$store.commit("clock/emitMasterTime", {masterTime: newValue})
    },
    emitMasterCountdown: function(newValue) {
      this.$store.commit("clock/emitMasterCountdown", {masterCountdown: newValue})
    },
    emitMasterAdditional: function(newValue) {
      this.$store.commit("clock/emitMasterAdditional", {masterAdditional: newValue})
    },
  }
})
</script>
<style>
</style>
