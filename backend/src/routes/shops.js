const express = require('express')
const { z } = require('zod')

const { requireAuth, requireRole } = require('../middleware/auth')
const { Shop } = require('../models/Shop')

const router = express.Router()

router.get('/', async (req, res) => {
  const q = String(req.query.q || '').trim()

  const filter = q
    ? { $text: { $search: q } }
    : {}

  const shops = await Shop.find(filter).sort({ createdAt: -1 }).limit(50)
  res.json({ shops })
})

router.get('/:id', async (req, res) => {
  const shop = await Shop.findById(req.params.id)
  if (!shop) return res.status(404).json({ error: 'Shop not found' })
  res.json({ shop })
})

router.post('/', requireAuth, requireRole(['shopOwner', 'admin']), async (req, res) => {
  const schema = z.object({
    name: z.string().min(2).max(120),
    description: z.string().max(1000).optional(),
    address: z.string().max(300).optional(),
    phone: z.string().max(40).optional(),
    services: z.array(z.string().max(60)).max(30).optional(),
    location: z.object({ lat: z.number(), lng: z.number() }).optional(),
  })

  const parsed = schema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() })

  const shop = await Shop.create({ ownerId: req.user._id, ...parsed.data })
  res.status(201).json({ shop })
})

router.put('/:id', requireAuth, requireRole(['shopOwner', 'admin']), async (req, res) => {
  const schema = z.object({
    name: z.string().min(2).max(120).optional(),
    description: z.string().max(1000).optional(),
    address: z.string().max(300).optional(),
    phone: z.string().max(40).optional(),
    services: z.array(z.string().max(60)).max(30).optional(),
    location: z.object({ lat: z.number(), lng: z.number() }).optional(),
  })

  const parsed = schema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() })

  const shop = await Shop.findById(req.params.id)
  if (!shop) return res.status(404).json({ error: 'Shop not found' })

  if (req.user.role !== 'admin' && shop.ownerId.toString() !== req.user._id.toString()) {
    return res.status(403).json({ error: 'Forbidden' })
  }

  Object.assign(shop, parsed.data)
  await shop.save()
  res.json({ shop })
})

module.exports = router

