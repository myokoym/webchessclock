import io from "socket.io-client"

const webSocketPlugin = (store) => {
  const socket = io()

  store.subscribe((mutation, state) => {
    if (mutation.type === "clock/changeTurn") {
      console.log(state.clock.players)
      socket.emit("send", {
        roomId: state.room.id,
        turn: state.clock.turn,
        time1: state.clock.players[0].time,
        time2: state.clock.players[1].time,
      })
    } else if (mutation.type === "clock/pause" ||
               mutation.type === "clock/cancelPause") {
      socket.emit("send", {
        roomId: state.room.id,
        pause: state.clock.pause,
        time1: state.clock.players[0].time,
        time2: state.clock.players[1].time,
      })
    } else if (mutation.type === "clock/emitNPlayers") {
      socket.emit("send", {
        roomId: state.room.id,
        nPlayers: state.clock.master.nPlayers,
      })
    } else if (mutation.type === "clock/emitMasterTime") {
      socket.emit("send", {
        roomId: state.room.id,
        masterTime: state.clock.master.time,
      })
    } else if (mutation.type === "clock/reset") {
      socket.emit("send", {
        roomId: state.room.id,
        turn: state.clock.turn,
        pause: state.clock.pause,
        nPlayers: state.clock.nPlayers,
        masterTime: state.clock.master.time,
        time1: state.clock.players[0].time,
        time2: state.clock.players[1].time,
      })
    } else if (mutation.type === "room/setId") {
      console.log("room/setId")
      const id = mutation.payload.id
      socket.on("update", (params) => {
        console.log("update")
        console.log(params)
        store.commit("clock/update", params)
      })
      socket.emit("enterRoom", id)
    }
    if (mutation.type === "clock/update" ||
        mutation.type === "clock/decreaseTime" ||
        mutation.type === "clock/reset") {
      store.commit("clock/updateDisplayTimes")
    }
  })
}

export const plugins = [
  webSocketPlugin,
]