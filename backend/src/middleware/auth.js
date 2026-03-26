const { verifyAccessToken } = require('../utils/tokens')
const { User } = require('../models/User')

async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || ''
    const token = header.startsWith('Bearer ') ? header.slice('Bearer '.length) : null
    if (!token) return res.status(401).json({ error: 'Missing token' })

    const decoded = verifyAccessToken(token)
    const user = await User.findById(decoded.sub).select('-passwordHash')
    if (!user) return res.status(401).json({ error: 'Invalid token' })

    req.user = user
    next()
  } catch (_err) {
    res.status(401).json({ error: 'Invalid token' })
  }
}

function requireRole(roles) {
  return (req, res, next) => {
    const role = req.user?.role
    if (!role) return res.status(401).json({ error: 'Not authenticated' })
    if (!roles.includes(role)) return res.status(403).json({ error: 'Forbidden' })
    next()
  }
}

module.exports = { requireAuth, requireRole }

