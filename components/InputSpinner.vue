<template>
  <div class="d-flex flex-column">
    <span class="text-center">{{label}}</span>
    <input type="text" class="form-control text-center" v-bind:value="value" readonly>
    <button class="btn btn-dark" type="button" v-if="max >= 10" v-on:click="add(10)" v-bind:disabled="value >= max">+10</button>
    <button class="btn btn-dark" type="button" v-if="max >= 5"  v-on:click="add(5)"  v-bind:disabled="value >= max">+5</button>
    <button class="btn btn-dark" type="button"                  v-on:click="add(1)"  v-bind:disabled="value >= max">+1</button>
    <button class="btn btn-dark" type="button"                  v-on:click="add(-1)"  v-bind:disabled="value <= min">-1</button>
    <button class="btn btn-dark" type="button" v-if="max >= 5"  v-on:click="add(-5)"  v-bind:disabled="value <= min">-5</button>
    <button class="btn btn-dark" type="button" v-if="max >= 10" v-on:click="add(-10)" v-bind:disabled="value <= min">-10</button>
    <span class="text-center" v-if="description"><small>{{description}}</small></span>
  </div>
</template>
<script>
import Vue from "vue"

export default Vue.extend({
  props: {
    value: Number,
    max: Number,
    min: Number,
    label: String,
    description: String,
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
      } else if (newValue < this.min) {
        newValue = this.min
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
