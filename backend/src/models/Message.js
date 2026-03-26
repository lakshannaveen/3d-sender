const mongoose = require('mongoose')

const MessageSchema = new mongoose.Schema(
  {
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true, index: true },
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    text: { type: String, default: '', trim: true },
  },
  { timestamps: true },
)

const Message = mongoose.models.Message || mongoose.model('Message', MessageSchema)

module.exports = { Message }

