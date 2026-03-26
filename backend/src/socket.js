const { Order } = require('./models/Order')
const { Shop } = require('./models/Shop')
const { Message } = require('./models/Message')

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

function registerSocketHandlers(io) {
  io.on('connection', (socket) => {
    socket.on('order:join', async (orderId, ack) => {
      try {
        const order = await Order.findById(orderId)
        if (!order) return ack?.({ ok: false, error: 'Order not found' })
        const ok = await canAccessOrder(socket.user, order)
        if (!ok) return ack?.({ ok: false, error: 'Forbidden' })

        socket.join(`order:${order._id}`)
        ack?.({ ok: true })
      } catch (_err) {
        ack?.({ ok: false, error: 'Join failed' })
      }
    })

    socket.on('message:send', async (payload, ack) => {
      try {
        const orderId = payload?.orderId
        const text = String(payload?.text || '').trim()
        if (!orderId || !text) return ack?.({ ok: false, error: 'Missing data' })

        const order = await Order.findById(orderId)
        if (!order) return ack?.({ ok: false, error: 'Order not found' })
        const ok = await canAccessOrder(socket.user, order)
        if (!ok) return ack?.({ ok: false, error: 'Forbidden' })

        const msg = await Message.create({ orderId: order._id, senderId: socket.user._id, text })

        const dto = {
          id: msg._id,
          orderId: msg.orderId,
          senderId: msg.senderId,
          text: msg.text,
          createdAt: msg.createdAt,
        }
        io.to(`order:${order._id}`).emit('message:new', dto)
        ack?.({ ok: true, message: dto })
      } catch (_err) {
        ack?.({ ok: false, error: 'Send failed' })
      }
    })
  })
}

module.exports = { registerSocketHandlers }

