const express = require('express')
const consola = require('consola')
const { Nuxt, Builder } = require('nuxt')
const app = express()

const moment = require('moment')

// Import and Set Nuxt.js options
const config = require('../nuxt.config.js')
config.dev = process.env.NODE_ENV !== 'production'

async function start () {
  // Init Nuxt.js
  const nuxt = new Nuxt(config)

  const { host, port } = nuxt.options.server

  await nuxt.ready()
  // Build only in dev mode
  if (config.dev) {
    const builder = new Builder(nuxt)
    await builder.build()
  }

  // Give nuxt middleware to express
  app.use(nuxt.render)

  // Listen the server
  let server = app.listen(port, host)
  consola.ready({
    message: `Server listening on http://${host}:${port}`,
    badge: true
  })

  socketStart(server)
  console.log("Socket.IO starts")
}

const Redis = require('ioredis');
//console.log(Redis)
let redis = undefined
if (process.env.REDIS_URL) {
  redis = new Redis(process.env.REDIS_URL);
} else {
  redis = new Redis();
}
//console.log(redis)

function socketStart(server) {
  const io = require("socket.io").listen(server)
  io.on("connection", (socket) => {
    let roomId = ""
    socket.on("enterRoom", (id) => {
      console.log("enterRoom id: " + id)
      roomId = id
      socket.join(roomId)
      redis.hmget(roomId, [
        "currentTurn",
        "timeLimitB",
        "timeLimitW",
        "pause",
      ], function(err, result) {
        console.log(result)
        io.to(roomId).emit("update", {
          currentTurn: result[0],
          timeLimitB: result[1],
          timeLimitW: result[2],
          pause: result[3],
        })
      })
      //Redis.Command.setReplyTransformer("hgetall", function(result) {
      //  if (Array.isArray(result)) {
      //    var obj = {};
      //    for (var i = 0; i < result.length; i += 2) {
      //      obj[result[i]] = result[i + 1];
      //    }
      //    return obj;
      //  }
      //  return result;
      //});
      //if (err) {
      //  console.log(err)
      //}
        //if (result) {
        //  io.to(socket.id).emit("update", result)
        //    currentTurn: undefined,
        //    timeLimits: {
        //      b: 0,
        //      w: 0,
        //    },
        //    pause: false,
        //}
        //socket.broadcast.to(roomId).emit("update", params)
      //})
    })
    socket.on("send", (params) => {
      console.log("send")
      console.log(params)
      if (!roomId) {
        roomId = params.roomId
        socket.join(roomId)
      }
      if ("currentTurn" in params) {
        redis.hset(roomId, "currentTurn", params.currentTurn)
      }
      if ("timeLimitB" in params) {
        redis.hset(roomId, "timeLimitB", params.timeLimitB)
      }
      if ("timeLimitW" in params) {
        redis.hset(roomId, "timeLimitW", params.timeLimitW)
      }
      if ("pause" in params) {
        redis.hset(roomId, "pause", params.pause)
      }
      socket.broadcast.to(roomId).emit("update", params)
      //io.to(roomId).emit("update", params)
    })

    //socket.on("sendComment", (params) => {
    //  const time = moment(new Date()).utcOffset('+09:00').format('H:mm:ss')
    //  io.to(roomId).emit("receiveComment", {
    //    time: time,
    //    name: params.name,
    //    comment: params.comment,
    //  })
    //})

    //socket.on("clockChangeTurn", (params) => {
    //  // debug: console.log("on clockChangeTurn: " + params.nextTurn)
    //  io.to(roomId).emit("clock", {
    //    type: "changeTurn",
    //    nextTurn: params.nextTurn,
    //  })
    //})
    //socket.on("clockPause", () => {
    //  // debug: console.log("on clockPause")
    //  io.to(roomId).emit("clock", {type: "pause"})
    //})
    //socket.on("clockCancelPause", () => {
    //  // debug: console.log("on clockCancelPause")
    //  io.to(roomId).emit("clock", {type: "cancelPause"})
    //})
    //socket.on("clockReset", () => {
    //  // debug: console.log("on clockReset")
    //  io.to(roomId).emit("clock", {type: "reset"})
    //})
    //socket.on("clockEnable", () => {
    //  console.log("on clockEnable")
    //  io.to(roomId).emit("clock", {type: "enable"})
    //})
    //socket.on("clockDisable", () => {
    //  console.log("on clockDisable")
    //  io.to(roomId).emit("clock", {type: "disable"})
    //})
  })
}

start()
