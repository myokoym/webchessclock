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
        currentTurn: state.clock.currentTurn,
        timeLimitB: state.clock.timeLimits['b'],
        timeLimitW: state.clock.timeLimits['w'],
        pause: state.clock.pause,
      })
    } else if (mutation.type === "room/setId") {
      console.log("room/setId")
      const id = mutation.payload.id
      socket.on("update", (params) => {
        console.log("update")
        console.log(params)
        store.commit("clock/setCurrentTurn", {currentTurn: params.currentTurn})
        store.commit("clock/setTimeLimitB", {timeLimit: params.timeLimitB})
        store.commit("clock/setTimeLimitW", {timeLimit: params.timeLimitW})
        store.commit("clock/setPause", {pause: params.pause})
      })
      //socket.on("clock", (params) => {
      //  if (params.type === "changeTurn") {
      //    store.commit("clock/onChangeTurn", {
      //      nextTurn: params.nextTurn,
      //    })
      //  } else if (params.type === "pause") {
      //    store.commit("clock/onPause")
      //  } else if (params.type === "cancelPause") {
      //    store.commit("clock/onCancelPause")
      //  } else if (params.type === "reset") {
      //    store.commit("clock/onReset")
      //  } else if (params.type === "enable") {
      //    console.log("commit onEnable")
      //    store.commit("clock/onEnable")
      //  } else if (params.type === "disable") {
      //    store.commit("clock/onDisable")
      //  }
      //})
      socket.emit("enterRoom", id)
    } else if (mutation.type === "chat/sendComment") {
      socket.emit("sendComment", {
        id: state.sfen.roomId,
        name: state.chat.name,
        comment: state.chat.comment,
      })
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
    } else if (mutation.type === "clock/emitEnable") {
      socket.emit("clockEnable")
    } else if (mutation.type === "clock/emitDisable") {
      socket.emit("clockDisable")
    }
  })
}

export const plugins = [
  webSocketPlugin,
]