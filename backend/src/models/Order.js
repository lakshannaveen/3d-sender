const mongoose = require('mongoose')

const StatusEventSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: ['requested', 'accepted', 'printing', 'ready', 'out_for_delivery', 'delivered', 'cancelled'],
      required: true,
    },
    at: { type: Date, default: Date.now },
    byUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    note: { type: String, default: '', trim: true },
  },
  { _id: false },
)

const OrderSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    shopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true, index: true },
    status: {
      type: String,
      enum: ['requested', 'accepted', 'printing', 'ready', 'out_for_delivery', 'delivered', 'cancelled'],
      default: 'requested',
      index: true,
    },
    statusHistory: { type: [StatusEventSchema], default: [] },
    pdf: {
      originalName: { type: String },
      filename: { type: String },
      path: { type: String },
      mime: { type: String },
      size: { type: Number },
    },
    notes: { type: String, default: '', trim: true },
  },
  { timestamps: true },
)

const Order = mongoose.models.Order || mongoose.model('Order', OrderSchema)

module.exports = { Order }

