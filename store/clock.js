export const state = () => ({
  turn: undefined,
  pause: false,
  players: [
    {
      time: 0,
      countdown: 0,
    },
    {
      time: 0,
      countdown: 0,
    },
  ],
  nPlayers: 2,
  master: {
    time: 0,
    countdown: 0,
  },
})

export const mutations = {
  decreaseTimeLimit(state, payload) {
    if (typeof state.turn !== "number") {
      return
    }
    state.players[state.turn].time -= payload.diff
    if (state.players[state.turn].time < 0) {
      state.players[state.turn].time = 0
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
  init(state) {
  },
  reset(state) {
    console.log("reset")
    state.requestID = undefined
    state.turn = undefined
    state.players = []
    for (let i = 0; i < state.nPlayers; i++) {
      state.players.push({
        time: state.master.time * 60 * 1000,
        countdown: state.master.countdown * 1000,
      })
    }
    state.pause = false
  },
  emitNPlayers(state, payload) {
    console.log("emitNP")
    state.nPlayers = payload.nPlayers
  },
  emitMasterTime(state, payload) {
    state.master.time = payload.masterTime
  },
  emitMasterCountdown(state, payload) {
    //state.master.countdown = payload
  },
  update(state, payload) {
    state.turn = payload.turn
    state.pause = payload.pause
    if (payload.masterTime !== undefined) {
      state.master.time = payload.masterTime
    }
    if (payload.nPlayers !== undefined) {
      state.nPlayers = payload.nPlayers
      state.players = []
      for (let i = 0; i < state.nPlayers; i++) {
        state.players.push({
          time: payload["time" + (i + 1)] * 60 * 1000,
        })
      }
      console.log(state.players)
    }
  },
}
