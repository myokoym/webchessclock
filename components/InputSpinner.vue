<template>
  <div class="d-flex flex-column">
    <span>{{label}}</span>
    <button class="btn btn-dark" type="button" v-if="max >= 10" v-on:click="add(10)" v-bind:disabled="value >= max">+10</button>
    <button class="btn btn-dark" type="button" v-if="max >= 5"  v-on:click="add(5)"  v-bind:disabled="value >= max">+5</button>
    <button class="btn btn-dark" type="button"                  v-on:click="add(1)"  v-bind:disabled="value >= max">+1</button>
    <input type="text" class="form-control text-center" v-bind:value="value" readonly>
    <button class="btn btn-dark" type="button"                  v-on:click="add(-1)"  v-bind:disabled="value < 1">-1</button>
    <button class="btn btn-dark" type="button" v-if="max >= 5"  v-on:click="add(-5)"  v-bind:disabled="value < 5">-5</button>
    <button class="btn btn-dark" type="button" v-if="max >= 10" v-on:click="add(-10)" v-bind:disabled="value < 10">-10</button>
  </div>
</template>
<script>
import Vue from "vue"

export default Vue.extend({
  props: {
    value: Number,
    max: Number,
    label: String,
    emit: Function,
  },
  data() {
    return {
    }
  },
  methods: {
    add(diff) {
      let newValue = this.value + diff
      if (newValue < 0) {
        newValue = 0
      }
      if (newValue > this.max) {
        newValue = this.max
      }
      //this.$emit('input', newValue)
      if (this.emit) {
        this.emit(newValue)
      }
    },
  }
})
</script>
<style>
</style>
