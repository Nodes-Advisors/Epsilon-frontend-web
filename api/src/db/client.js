/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
/* eslint-disable no-console */
/* eslint-disable no-undef */
import { MongoClient } from 'mongodb'

const uri = 'mongodb+srv://GraceLTQ:Apple_030711@outboundemailcluster.xapxelz.mongodb.net/'
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true })

async function connectToMongoDB() {
  try {
    await client.connect()
    console.log('Connected successfully to MongoDB')
  } catch (error) {
    console.error('Failed to connect to MongoDB', error)
    process.exit(1)
  }
}

process.on('SIGINT', async () => {
  await client.close()
  console.log('MongoDB disconnected on app termination')
  process.exit(0)
})

// afterAll(async () => {
//   await client.close()
// })

export default client
