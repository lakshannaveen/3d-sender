const { verifyAccessToken } = require('../utils/tokens')
const { User } = require('../models/User')

async function authSocket(socket, next) {
  try {
    const token =
      socket.handshake.auth?.token ||
      (typeof socket.handshake.headers.authorization === 'string' &&
        socket.handshake.headers.authorization.startsWith('Bearer ')
        ? socket.handshake.headers.authorization.slice('Bearer '.length)
        : null)

    if (!token) return next(new Error('Missing token'))

    const decoded = verifyAccessToken(token)
    const user = await User.findById(decoded.sub).select('-passwordHash')
    if (!user) return next(new Error('Invalid token'))

    socket.user = user
    next()
  } catch (_err) {
    next(new Error('Invalid token'))
  }
}

module.exports = { authSocket }

