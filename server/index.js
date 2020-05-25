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
  // debug: console.log("Socket.IO starts")
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
      // debug: console.log("enterRoom id: " + id)
      roomId = id
      socket.join(roomId)
      const keys = [
        "turn",
        "pause",
        "nPlayers",
        "masterTime",
        "masterCountdown",
        "masterAdditional",
        "times",
        "countdowns",
      ]
      redis.hmget(roomId, keys, function(err, result) {
        // debug: console.log(result)
        const params = {}
        result.forEach((value, index) => {
          if (value !== null) {
            params[keys[index]] = value
          }
        })
        io.to(socket.id).emit("update", params)
      })
    })
    socket.on("send", (params) => {
      // debug: console.log("send")
      // debug: console.log(params)
      if (!roomId) {
        roomId = params.roomId
        socket.join(roomId)
      }
      if ("turn" in params) {
        redis.hset(roomId, "turn", params.turn)
      }
      if ("pause" in params) {
        redis.hset(roomId, "pause", params.pause)
      }
      if ("nPlayers" in params) {
        redis.hset(roomId, "nPlayers", params.nPlayers)
      }
      if ("masterTime" in params) {
        redis.hset(roomId, "masterTime", params.masterTime)
      }
      if ("masterCountdown" in params) {
        redis.hset(roomId, "masterCountdown", params.masterCountdown)
      }
      if ("masterAdditional" in params) {
        redis.hset(roomId, "masterAdditional", params.masterAdditional)
      }
      if ("times" in params) {
        redis.hset(roomId, "times", params.times)
      }
      if ("countdowns" in params) {
        redis.hset(roomId, "countdowns", params.countdowns)
      }
      socket.broadcast.to(roomId).emit("update", params)
      //io.to(roomId).emit("update", params)
    })
  })
}

start()
