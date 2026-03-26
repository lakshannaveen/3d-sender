require('dotenv').config()
const { connectDb } = require('../config/db')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

const { User } = require('../models/User')
const { Shop } = require('../models/Shop')
const { Order } = require('../models/Order')
const { Message } = require('../models/Message')

async function seed() {
  const uri = process.env.MONGODB_URI
  if (!uri) {
    console.error('[seed] MONGODB_URI missing')
    process.exit(1)
  }

  await connectDb()

  try {
    // Clear existing data (safe for demo/local use)
    await Message.deleteMany({})
    await Order.deleteMany({})
    await Shop.deleteMany({})
    await User.deleteMany({})

    const pw = 'password123'
    const saltRounds = 10
    const passwordHash = await bcrypt.hash(pw, saltRounds)

    // Create users
    const admin = await User.create({ name: 'Admin User', email: 'admin@example.com', passwordHash, role: 'admin' })
    const ownerAlice = await User.create({ name: 'Alice Owner', email: 'alice.owner@example.com', passwordHash, role: 'shopOwner' })
    const ownerBob = await User.create({ name: 'Bob Owner', email: 'bob.owner@example.com', passwordHash, role: 'shopOwner' })
    const userJane = await User.create({ name: 'Jane Customer', email: 'jane.customer@example.com', passwordHash, role: 'user' })
    const userTom = await User.create({ name: 'Tom Customer', email: 'tom.customer@example.com', passwordHash, role: 'user' })

    // Create shops
    const shop1 = await Shop.create({
      ownerId: ownerAlice._id,
      name: "Rapid Prints - Alice",
      description: 'Fast 3D printing and finishing',
      address: '12 Maker St, Fabrication City',
      phone: '+1-555-0101',
      services: ['PLA', 'ABS', 'Resin', 'Finishing'],
      location: { lat: 40.7128, lng: -74.006 },
    })

    const shop2 = await Shop.create({
      ownerId: ownerBob._id,
      name: "Precision Layers - Bob",
      description: 'High-detail resin printing for miniatures',
      address: '98 Print Ave, Modeltown',
      phone: '+1-555-0202',
      services: ['Resin', 'Post-processing', 'Painting'],
      location: { lat: 51.5074, lng: -0.1278 },
    })

    // Create orders
    const order1 = await Order.create({
      userId: userJane._id,
      shopId: shop1._id,
      status: 'printing',
      statusHistory: [
        { status: 'requested', byUserId: userJane._id, note: 'Initial request' },
        { status: 'accepted', byUserId: ownerAlice._id, note: 'Accepted by shop' },
        { status: 'printing', byUserId: ownerAlice._id, note: 'Started printing' },
      ],
      pdf: {
        originalName: 'demo-design.pdf',
        filename: 'demo-design.pdf',
        path: '/uploads/pdfs/demo-design.pdf',
        mime: 'application/pdf',
        size: 123456,
      },
      notes: 'Please use 0.2mm layer height and PLA',
    })

    const order2 = await Order.create({
      userId: userTom._id,
      shopId: shop2._id,
      status: 'ready',
      statusHistory: [
        { status: 'requested', byUserId: userTom._id, note: 'Request for resin print' },
        { status: 'accepted', byUserId: ownerBob._id, note: 'Accepted' },
        { status: 'printing', byUserId: ownerBob._id, note: 'Resin print in progress' },
        { status: 'ready', byUserId: ownerBob._id, note: 'Ready for pickup' },
      ],
      pdf: {
        originalName: 'miniatures.pdf',
        filename: 'miniatures.pdf',
        path: '/uploads/pdfs/miniatures.pdf',
        mime: 'application/pdf',
        size: 654321,
      },
      notes: 'Handle with care; paint afterwards if possible',
    })

    // Create messages
    await Message.create({ orderId: order1._id, senderId: userJane._id, text: 'Hi, can you confirm the filament color?' })
    await Message.create({ orderId: order1._id, senderId: ownerAlice._id, text: 'We have white and black PLA; white is available.' })
    await Message.create({ orderId: order2._id, senderId: ownerBob._id, text: 'Your order is ready for pickup.' })

    console.log('[seed] done')
    console.log(`[seed] users: ${await User.countDocuments()}`)
    console.log(`[seed] shops: ${await Shop.countDocuments()}`)
    console.log(`[seed] orders: ${await Order.countDocuments()}`)
    console.log(`[seed] messages: ${await Message.countDocuments()}`)

    await mongoose.disconnect()
    process.exit(0)
  } catch (err) {
    console.error('[seed] error', err)
    await mongoose.disconnect()
    process.exit(1)
  }
}

seed()
