/* eslint-disable no-undef */
/* eslint-disable no-console */
import express from 'express'
import { MongoClient } from 'mongodb'
import cors from 'cors'

const app = express()
app.use(cors())

const uri = 'mongodb+srv://GraceLTQ:Apple_030711@outboundemailcluster.xapxelz.mongodb.net/'
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true })

const dbName = 'EpsilonEmailDB'
const InboundCollectionName = 'InboundEmails'

async function connectToMongoDB() {
  try {
    await client.connect()
    console.log('Connected successfully to MongoDB')
  } catch (error) {
    console.error('Failed to connect to MongoDB', error)
    process.exit(1) // Exit in case of connection failure
  }
}

app.get('/', async (req, res) => {
  const { q } = req.query
  const keys = ['subject', 'sender', 'isInvestorEmail', 'isInterested', 'deckRequested', 'meetingRequested', 'proposalAccepted', 'project']

  const searchQuery = q ? {
    $or: keys.map(key => ({ [key]: new RegExp(q, 'i') })),
  } : {}

  try {
    const database = client.db(dbName)
    const inboundCollection = database.collection(InboundCollectionName)

    const inboundEmails = await inboundCollection.find(searchQuery).limit(100).toArray()
    res.json(inboundEmails)
  } catch (error) {
    console.error('Error fetching data:', error)
    res.status(500).send('Error fetching data')
  }
})

app.listen(5001, async () => {
  console.log('API is working!')
  await connectToMongoDB()
})

process.on('SIGINT', async () => {
  await client.close()
  console.log('MongoDB disconnected on app termination')
  process.exit(0)
})

