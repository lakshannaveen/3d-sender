require('dotenv').config()
const mongoose = require('mongoose')

async function test() {
  const uri = process.env.MONGODB_URI
  if (!uri) {
    console.error('[test] MONGODB_URI missing')
    process.exit(1)
  }

  mongoose.set('strictQuery', true)
  try {
    await mongoose.connect(uri)
    console.log('[test] connected to mongodb')

    const admin = mongoose.connection.db.admin()
    const dbs = await admin.listDatabases()
    console.log('[test] databases:', dbs.databases.map((d) => d.name).join(', '))

    await mongoose.disconnect()
    process.exit(0)
  } catch (err) {
    console.error('[test] connection error', err.message || err)
    process.exit(1)
  }
}

test()
