export const state = () => ({
  turn: null,
  pause: false,
  players: [
    {
      time: 0,
      displayTime: "0:00",
      countdown: 0,
    },
    {
      time: 0,
      displayTime: "0:00",
      countdown: 0,
    },
  ],
  master: {
    nPlayers: 2,
    time: 0,
    countdown: 0,
    additional: 0,
  },
})

export const mutations = {
  decreaseTime(state, payload) {
    // debug: console.log("decreaseTime")
    //console.log(state.turn)
    if (state.turn === undefined || state.turn === null || state.turn === NaN) {
      return
    }
    //console.log(payload.diff)
    if (!state.players[state.turn]) {
      return
    }
    if (state.players[state.turn].time === 0) {
      state.players[state.turn].countdown -= payload.diff
      if (state.players[state.turn].countdown < 0) {
        state.players[state.turn].countdown = 0
      }
    } else {
      state.players[state.turn].time -= payload.diff
      if (state.players[state.turn].time < 0) {
        state.players[state.turn].time = 0
      }
    }
  },
  updateDisplayTimes(state) {
    // debug: console.log("updateDisplaythTimes")
    // debug: console.log(state.players)
    state.players.forEach((player) => {
      // debug: console.log(player)
      if (player && player.time) {
        const timeSecond = Math.floor(player.time / 1000)
        const min = Math.floor(timeSecond / 60)
        let sec = timeSecond % 60
        if (sec < 10) {
          sec = "0" + sec
        }
        player.displayTime = min + ":" + sec
      } else if (player && player.countdown) {
        const sec = Math.floor(player.countdown / 1000)
        player.displayTime = String(sec)
      } else {
        player.displayTime = "0"
      }
    })
  },
  changeTurn(state, payload) {
    const nextTurn = payload.nextTurn
    if (state.turn === nextTurn) {
      return
    }
    if (!(state.turn === undefined || state.turn === null || state.turn === NaN) &&
        state.master.additional) {
      state.players[state.turn].time += state.master.additional * 1000
    }
    state.turn = nextTurn
    if (state.master.countdown) {
      state.players[state.turn].countdown = state.master.countdown * 1000
    }
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
    // debug: console.log("reset")
    state.turn = null
    state.players = []
    for (let i = 0; i < state.master.nPlayers; i++) {
      state.players.push({
        time: state.master.time * 60 * 1000,
        countdown: state.master.countdown * 1000,
      })
    }
    state.pause = false
  },
  emitNPlayers(state, payload) {
    // debug: console.log("emitNP")
    state.master.nPlayers = payload.nPlayers
  },
  emitMasterTime(state, payload) {
    state.master.time = payload.masterTime
  },
  emitMasterCountdown(state, payload) {
    state.master.countdown = payload.masterCountdown
  },
  emitMasterAdditional(state, payload) {
    state.master.additional = payload.masterAdditional
  },
  update(state, payload) {
    // debug: console.log("update")
    // debug: console.log(payload)
    if ("turn" in payload) {
      if (payload.turn !== undefined && payload.turn !== null) {
        state.turn = parseInt(payload.turn)
        // debug: console.log(state.turn)
      } else {
        state.turn = payload.turn
      }
    }
    if ("pause" in payload) {
      if (payload.pause === "false") {
        state.pause = false
      } else if (payload.pause === "true") {
        state.pause = true
      } else {
        state.pause = payload.pause
      }
    }
    if ("masterTime" in payload) {
      state.master.time = parseInt(payload.masterTime)
      if (!state.master.time) {
        state.master.time = 0
      }
    }
    if ("masterCountdown" in payload) {
      state.master.countdown = parseInt(payload.masterCountdown)
      if (!state.master.countdown) {
        state.master.countdown = 0
      }
    }
    if ("masterAdditional" in payload) {
      state.master.additional = parseInt(payload.masterAdditional)
      if (!state.master.additional) {
        state.master.additional = 0
      }
    }
    if ("nPlayers" in payload) {
      state.master.nPlayers = parseInt(payload.nPlayers)
      //state.players = []
      //console.log(payload)
      //for (let i = 0; i < state.master.nPlayers; i++) {
      //  state.players.push({
      //    time: payload["time" + (i + 1)],
      //  })
      //}
      //console.log(state.players)
    }
    if (("times" in payload) && payload.times) {
      const times = payload.times.split(",")
      if (times.length !== state.players.length) {
        state.players = []
        for (let i = 0, ren = times.length; i < ren; i++) {
          state.players.push({
            time: state.master.time * 60 * 1000,
            countdown: state.master.countdown * 1000,
          })
        }
      }
      for (let i = 0; i < times.length; i++) {
        state.players[i].time = parseInt(times[i])
      }
    }
    if (("countdowns" in payload) && payload.times) {
      const countdowns = payload.countdowns.split(",")
      for (let i = 0; i < countdowns.length; i++) {
        state.players[i].countdown = parseInt(countdowns[i])
      }
    }
  },
}
