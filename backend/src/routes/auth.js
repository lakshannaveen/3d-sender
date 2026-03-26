const express = require('express')
const bcrypt = require('bcrypt')
const { z } = require('zod')

const { User } = require('../models/User')
const { signAccessToken } = require('../utils/tokens')
const { requireAuth } = require('../middleware/auth')

const router = express.Router()

router.post('/register', async (req, res) => {
  const schema = z.object({
    name: z.string().min(2).max(80),
    email: z.string().email().max(200),
    password: z.string().min(6).max(200),
    role: z.enum(['user', 'shopOwner']).optional(),
  })

  const parsed = schema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() })

  const { name, email, password, role } = parsed.data
  const existing = await User.findOne({ email: email.toLowerCase() })
  if (existing) return res.status(409).json({ error: 'Email already exists' })

  const passwordHash = await bcrypt.hash(password, 12)
  const user = await User.create({ name, email, passwordHash, role: role || 'user' })

  const token = signAccessToken({ sub: user._id.toString(), role: user.role })
  res.json({
    token,
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  })
})

router.post('/login', async (req, res) => {
  const schema = z.object({
    email: z.string().email().max(200),
    password: z.string().min(1).max(200),
  })

  const parsed = schema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() })

  const { email, password } = parsed.data
  const user = await User.findOne({ email: email.toLowerCase() })
  if (!user) return res.status(401).json({ error: 'Invalid credentials' })

  const ok = await bcrypt.compare(password, user.passwordHash)
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' })

  const token = signAccessToken({ sub: user._id.toString(), role: user.role })
  res.json({
    token,
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  })
})

router.get('/me', requireAuth, async (req, res) => {
  res.json({ user: req.user })
})

module.exports = router

