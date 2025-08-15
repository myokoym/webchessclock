const express = require('express')
const consola = require('consola')
const { Nuxt, Builder } = require('nuxt')
const app = express()

const moment = require('moment')

// Import health check routes
const healthRoutes = require('./api/health')

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

  // Mount health check routes before Nuxt middleware
  app.use('/api', healthRoutes)

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

const RedisClient = require('./lib/redis-client');
const redis = new RedisClient();

// Make Redis instance available to health check routes
app.locals.redis = redis

// Input validation helpers
function validateRoomId(roomId) {
  // Allow only alphanumeric, hyphen, and underscore, 1-50 characters
  if (!roomId || typeof roomId !== 'string') {
    return false;
  }
  return /^[a-zA-Z0-9_-]{1,50}$/.test(roomId);
}

function validateFieldValue(value) {
  // Prevent excessively large values
  if (typeof value === 'string' && value.length > 10000) {
    return false;
  }
  if (typeof value === 'object' && JSON.stringify(value).length > 10000) {
    return false;
  }
  return true;
}

function getRoomKey(roomId) {
  // Add consistent prefix to prevent key collision
  return `room:${roomId}`;
}

function socketStart(server) {
  const io = require("socket.io").listen(server)
  io.on("connection", (socket) => {
    let roomId = ""
    socket.on("enterRoom", (id) => {
      // debug: console.log("enterRoom id: " + id)
      // Validate room ID
      if (!validateRoomId(id)) {
        socket.emit("error", { message: "Invalid room ID format" });
        return;
      }
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
      redis.hmget(getRoomKey(roomId), keys).then((result) => {
        // debug: console.log(result)
        const params = {}
        result.forEach((value, index) => {
          if (value !== null) {
            params[keys[index]] = value
          }
        })
        io.to(socket.id).emit("update", params)
      }).catch((err) => {
        console.error('Redis hmget error:', err)
        // Send empty update if Redis fails
        io.to(socket.id).emit("update", {})
      })
    })
    socket.on("send", (params) => {
      // debug: console.log("send")
      // debug: console.log(params)
      
      // Validate params object
      if (!params || typeof params !== 'object') {
        socket.emit("error", { message: "Invalid parameters" });
        return;
      }
      
      if (!roomId) {
        // Validate room ID from params
        if (!validateRoomId(params.roomId)) {
          socket.emit("error", { message: "Invalid room ID format" });
          return;
        }
        roomId = params.roomId
        socket.join(roomId)
      }
      // Batch Redis operations for optimal performance
      const fieldsToUpdate = {}
      
      // Collect all fields that need updating with validation
      const validFields = ["turn", "pause", "nPlayers", "masterTime", "masterCountdown", "masterAdditional", "times", "countdowns"]
      for (const field of validFields) {
        if (field in params) {
          // Validate field value size
          if (!validateFieldValue(params[field])) {
            console.warn(`Field ${field} value too large, skipping`);
            continue;
          }
          fieldsToUpdate[field] = params[field]
        }
      }
      
      // Execute batch update without blocking
      if (Object.keys(fieldsToUpdate).length > 0) {
        redis.hsetBatch(getRoomKey(roomId), fieldsToUpdate).catch((err) => {
          console.error('Redis hsetBatch error:', err)
        })
      }
      socket.broadcast.to(roomId).emit("update", params)
      //io.to(roomId).emit("update", params)
    })
  })
}

start()

// Graceful shutdown handling
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...')
  await redis.disconnect()
  process.exit(0)
})

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully...')
  await redis.disconnect()
  process.exit(0)
})
