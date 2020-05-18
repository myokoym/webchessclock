export const state = () => ({
  turn: undefined,
  pause: false,
  current: {
    b: {
      time: 0,
      countdown: 0,
    },
    w: {
      time: 0,
      countdown: 0,
    },
  },
  master: {
    b: {
      time: 0,
      countdown: 0,
      additional: 0,
    },
    w: {
      time: 0,
      countdown: 0,
      additional: 0,
    },
  },
})

export const mutations = {
  defaultTimeLimits(state) {
    //const timeLimit = 5 * 60 * 1000
    //state.timeLimits['b'] = timeLimit
    //state.timeLimits['w'] = timeLimit
  },
  decreaseTimeLimit(state, payload) {
    if (!state.turn) {
      return
    }
    state.current[state.turn].time -= payload.diff
    if (state.current[state.turn].time < 0) {
      state.current[state.turn].time = 0
    }
  },
  changeTurn(state, payload) {
    const nextTurn = payload.nextTurn
    if (state.turn === nextTurn) {
      return
    }
    state.turn = nextTurn
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
    state.turn = undefined
    const timeLimit = 5 * 60 * 1000
    state.current['b'].time = timeLimit
    state.current['w'].time = timeLimit
    state.pause = false
  },
  setTurn(state, payload) {
    state.turn = payload.turn
  },
  setTimeLimitB(state, payload) {
    state.current['b'].time = payload.timeLimit
  },
  setTimeLimitW(state, payload) {
    state.current['w'].time = payload.timeLimit
  },
  setPause(state, payload) {
    console.log(payload)
    state.pause = payload.pause
  },
}
