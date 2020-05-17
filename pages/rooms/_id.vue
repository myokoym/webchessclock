<template>
  <div class="row">
    <div class="col-xl-8 container">
      <Clock></Clock>
    </div>
  </div>
</template>

<script>
import io from "socket.io-client"
import Vue from "vue"
import Clock from '~/components/Clock.vue'

export default Vue.extend({
  components: {
    Clock,
  },
  data() {
    return {
    }
  },
  created() {
    console.log(this.$route.params.id)
    if (!this.$route.params.id) {
      this.$router.replace("/")
      return
    }
    this.$store.commit("room/setId", {id: this.$route.params.id})
    console.log(this.$store.state.room.id)
  },
})
</script>
<style>
body {
  background-color: #7EC6FC;
}
.container {
  max-width: 640px;
}
</style>