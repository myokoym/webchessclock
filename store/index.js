import io from "socket.io-client"

const webSocketPlugin = (store) => {
  const socket = io()

  store.subscribe((mutation, state) => {
    if (mutation.type === "clock/update" ||
        mutation.type === "clock/decreaseTime" ||
        mutation.type === "clock/reset") {
      store.commit("clock/updateDisplayTimes")
    } else if (mutation.type === "room/setId") {
      // debug: console.log("room/setId")
      const id = mutation.payload.id
      socket.on("update", (params) => {
        // debug: console.log("update")
        // debug: console.log(params)
        store.commit("clock/update", params)
      })
      socket.emit("enterRoom", id)
    }

    //if (!state.readySend) {
    //  return
    //}

    if (mutation.type === "clock/changeTurn") {
      // debug: console.log(state.clock.players)
      socket.emit("send", {
        roomId: state.room.id,
        turn: state.clock.turn,
        times: state.clock.players.map((player) => {return player.time}).join(","),
        countdowns: state.clock.players.map((player) => {return player.countdown}).join(","),
      })
    } else if (mutation.type === "clock/pause" ||
               mutation.type === "clock/cancelPause") {
      socket.emit("send", {
        roomId: state.room.id,
        pause: state.clock.pause,
        times: state.clock.players.map((player) => {return player.time}).join(","),
        countdowns: state.clock.players.map((player) => {return player.countdown}).join(","),
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
    } else if (mutation.type === "clock/emitMasterCountdown") {
      socket.emit("send", {
        roomId: state.room.id,
        masterCountdown: state.clock.master.countdown,
      })
    } else if (mutation.type === "clock/emitMasterAdditional") {
      socket.emit("send", {
        roomId: state.room.id,
        masterAdditional: state.clock.master.additional,
      })
    } else if (mutation.type === "clock/reset") {
      socket.emit("send", {
        roomId: state.room.id,
        turn: state.clock.turn,
        pause: state.clock.pause,
        nPlayers: state.clock.nPlayers,
        masterTime: state.clock.master.time,
        masterCountdown: state.clock.master.countdown,
        masterAdditional: state.clock.master.additional,
        times: state.clock.players.map((player) => {return player.time}).join(","),
        countdowns: state.clock.players.map((player) => {return player.countdown}).join(","),
      })
    }
  })
}

export const plugins = [
  webSocketPlugin,
]