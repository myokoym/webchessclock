import io from "socket.io-client"

const webSocketPlugin = (store) => {
  const socket = io()

  store.subscribe((mutation, state) => {
    if (mutation.type === "clock/changeTurn" ||
        mutation.type === "clock/pause" ||
        mutation.type === "clock/cancelPause" ||
        mutation.type === "clock/reset") {
      console.log("send")
      console.log(state.clock.pause)
      socket.emit("send", {
        roomId: state.room.id,
        turn: state.clock.turn,
        timeLimitB: state.clock.current['b'].time,
        timeLimitW: state.clock.current['w'].time,
        pause: state.clock.pause,
      })
    } else if (mutation.type === "room/setId") {
      console.log("room/setId")
      const id = mutation.payload.id
      socket.on("update", (params) => {
        console.log("update")
        console.log(params)
        store.commit("clock/setTurn", {turn: params.turn})
        store.commit("clock/setTimeLimitB", {timeLimit: params.timeLimitB})
        store.commit("clock/setTimeLimitW", {timeLimit: params.timeLimitW})
        store.commit("clock/setPause", {pause: params.pause})
      })
      socket.emit("enterRoom", id)
    } else if (mutation.type === "clock/emitChangeTurn") {
      console.log("emit clockChangeTurn: " + state.clock.nextTurn)
      socket.emit("clockChangeTurn", {
        nextTurn: state.clock.nextTurn,
      })
    } else if (mutation.type === "clock/emitPause") {
      socket.emit("clockPause")
    } else if (mutation.type === "clock/emitCancelPause") {
      socket.emit("clockCancelPause")
    } else if (mutation.type === "clock/emitReset") {
      socket.emit("clockReset")
    }
  })
}

export const plugins = [
  webSocketPlugin,
]