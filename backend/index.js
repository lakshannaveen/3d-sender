require('dotenv').config()

const http = require('http')
const path = require('path')
const express = require('express')
const cors = require('cors')
const { Server } = require('socket.io')

const { connectDb } = require('./src/config/db')
const { authSocket } = require('./src/middleware/authSocket')
const authRoutes = require('./src/routes/auth')
const shopRoutes = require('./src/routes/shops')
const orderRoutes = require('./src/routes/orders')
const { registerSocketHandlers } = require('./src/socket')

const app = express()
app.use(express.json({ limit: '2mb' }))
// Support one or more allowed client origins (comma-separated in CLIENT_ORIGIN)
const clientOrigins = (process.env.CLIENT_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((s) => s.trim())

app.use(
  cors({
    origin: clientOrigins,
    credentials: true,
  }),
)

app.get('/api/health', (_req, res) => res.json({ ok: true }))

app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

app.use('/api/auth', authRoutes)
app.use('/api/shops', shopRoutes)
app.use('/api/orders', orderRoutes)

app.use((err, _req, res, _next) => {
  const msg = typeof err?.message === 'string' ? err.message : 'Server error'
  const status = msg.toLowerCase().includes('only pdf') ? 400 : 500
  res.status(status).json({ error: msg })
})

const server = http.createServer(app)
const io = new Server(server, {
  cors: {
    origin: clientOrigins,
    credentials: true,
  },
})

io.use(authSocket)
registerSocketHandlers(io)

const port = Number(process.env.PORT || 8080)

connectDb()
  .then(() => {
    server.listen(port, () => {
      console.log(`[backend] listening on http://localhost:${port}`)
    })
  })
  .catch((err) => {
    console.error('[backend] failed to start', err)
    process.exit(1)
  })

