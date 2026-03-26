const mongoose = require('mongoose')

const ShopSchema = new mongoose.Schema(
  {
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '', trim: true },
    address: { type: String, default: '', trim: true },
    phone: { type: String, default: '', trim: true },
    services: { type: [String], default: [] },
    location: {
      lat: { type: Number },
      lng: { type: Number },
    },
  },
  { timestamps: true },
)

ShopSchema.index({ name: 'text', description: 'text', address: 'text', services: 'text' })

const Shop = mongoose.models.Shop || mongoose.model('Shop', ShopSchema)

module.exports = { Shop }

