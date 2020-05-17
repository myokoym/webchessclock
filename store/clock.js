export const state = () => ({
  mode: undefined,
  countdown: 0,
  currentTurn: undefined,
  timeLimits: {
    b: 0,
    w: 0,
  },
  pause: false,
})

export const mutations = {
  defaultTimeLimits(state) {
    //const timeLimit = 5 * 60 * 1000
    //state.timeLimits['b'] = timeLimit
    //state.timeLimits['w'] = timeLimit
  },
  decreaseTimeLimit(state, payload) {
    state.timeLimits[state.currentTurn] -= payload.diff
    if (state.timeLimits[state.currentTurn] < 0) {
      state.timeLimits[state.currentTurn] = 0
    }
  },
  changeTurn(state, payload) {
    const nextTurn = payload.nextTurn
    if (state.currentTurn === nextTurn) {
      return
    }
    state.currentTurn = nextTurn
  },
  pause(state) {
    state.pause = true
  },
  cancelPause(state) {
    state.pause = false
  },
  reset(state) {
    console.log("emitReset")
    state.requestID = undefined
    state.currentTurn = undefined
    const timeLimit = 5 * 60 * 1000
    state.timeLimits['b'] = timeLimit
    state.timeLimits['w'] = timeLimit
    state.pause = false
  },
  //emitChangeTurn(state, payload) {
  //  this.commit("clock/changeTurn", {nextTurn: payload.nextTurn})
  //},
  //emitPause(state) {
  //  this.commit("clock/pause")
  //},
  //emitCancelPause(state) {
  //  this.commit("clock/cancelPause")
  //},
  //emitReset(state) {
  //  this.commit("clock/reset")
  //},
  setCurrentTurn(state, payload) {
    state.currentTurn = payload.currentTurn
  },
  setTimeLimitB(state, payload) {
    state.timeLimits['b'] = payload.timeLimit
  },
  setTimeLimitW(state, payload) {
    state.timeLimits['w'] = payload.timeLimit
  },
  setPause(state, payload) {
    state.pause = payload.pause
  },
}
