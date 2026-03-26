const express = require('express')
const path = require('path')
const multer = require('multer')
const { z } = require('zod')

const { requireAuth, requireRole } = require('../middleware/auth')
const { Order } = require('../models/Order')
const { Shop } = require('../models/Shop')
const { Message } = require('../models/Message')

const router = express.Router()

const upload = multer({
  dest: path.join(process.cwd(), 'uploads', 'pdfs'),
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ok = file.mimetype === 'application/pdf'
    cb(ok ? null : new Error('Only PDF files are allowed'), ok)
  },
})

async function canAccessOrder(user, order) {
  if (!order) return false
  if (user.role === 'admin') return true
  if (order.userId.toString() === user._id.toString()) return true
  if (user.role === 'shopOwner') {
    const shop = await Shop.findById(order.shopId)
    return shop && shop.ownerId.toString() === user._id.toString()
  }
  return false
}

router.get('/mine', requireAuth, async (req, res) => {
  let filter = { userId: req.user._id }
  if (req.user.role === 'shopOwner') {
    const shops = await Shop.find({ ownerId: req.user._id }).select('_id')
    filter = { shopId: { $in: shops.map((s) => s._id) } }
  }
  if (req.user.role === 'admin') filter = {}

  const orders = await Order.find(filter).sort({ createdAt: -1 }).limit(50)
  res.json({ orders })
})

router.post('/', requireAuth, requireRole(['user', 'admin']), async (req, res) => {
  const schema = z.object({
    shopId: z.string().min(1),
    notes: z.string().max(2000).optional(),
    firstMessage: z.string().max(2000).optional(),
  })
  const parsed = schema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() })

  const shop = await Shop.findById(parsed.data.shopId)
  if (!shop) return res.status(404).json({ error: 'Shop not found' })

  const order = await Order.create({
    userId: req.user._id,
    shopId: shop._id,
    notes: parsed.data.notes || '',
    status: 'requested',
    statusHistory: [
      { status: 'requested', byUserId: req.user._id, note: 'Order created' },
    ],
  })

  if (parsed.data.firstMessage?.trim()) {
    await Message.create({ orderId: order._id, senderId: req.user._id, text: parsed.data.firstMessage.trim() })
  }

  res.status(201).json({ order })
})

router.get('/:id', requireAuth, async (req, res) => {
  const order = await Order.findById(req.params.id)
  if (!order) return res.status(404).json({ error: 'Order not found' })
  if (!(await canAccessOrder(req.user, order))) return res.status(403).json({ error: 'Forbidden' })

  const messages = await Message.find({ orderId: order._id }).sort({ createdAt: 1 }).limit(300)
  res.json({ order, messages })
})

router.post('/:id/upload-pdf', requireAuth, upload.single('pdf'), async (req, res) => {
  const order = await Order.findById(req.params.id)
  if (!order) return res.status(404).json({ error: 'Order not found' })
  if (!(await canAccessOrder(req.user, order))) return res.status(403).json({ error: 'Forbidden' })
  if (!req.file) return res.status(400).json({ error: 'Missing file' })

  order.pdf = {
    originalName: req.file.originalname,
    filename: req.file.filename,
    path: `/uploads/pdfs/${req.file.filename}`,
    mime: req.file.mimetype,
    size: req.file.size,
  }
  await order.save()

  await Message.create({
    orderId: order._id,
    senderId: req.user._id,
    text: `Uploaded PDF: ${req.file.originalname}`,
  })

  res.json({ order })
})

router.post('/:id/status', requireAuth, async (req, res) => {
  const schema = z.object({
    status: z.enum(['accepted', 'printing', 'ready', 'out_for_delivery', 'delivered', 'cancelled']),
    note: z.string().max(200).optional(),
  })
  const parsed = schema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() })

  const order = await Order.findById(req.params.id)
  if (!order) return res.status(404).json({ error: 'Order not found' })

  const ok = await canAccessOrder(req.user, order)
  if (!ok) return res.status(403).json({ error: 'Forbidden' })

  if (req.user.role === 'user' && order.userId.toString() !== req.user._id.toString()) {
    return res.status(403).json({ error: 'Forbidden' })
  }

  if (req.user.role === 'user' && parsed.data.status !== 'cancelled') {
    return res.status(403).json({ error: 'Users can only cancel' })
  }

  order.status = parsed.data.status
  order.statusHistory.push({
    status: parsed.data.status,
    byUserId: req.user._id,
    note: parsed.data.note || '',
  })
  await order.save()

  res.json({ order })
})

module.exports = router

