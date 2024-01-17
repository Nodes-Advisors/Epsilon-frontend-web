/* eslint-disable no-undef */
/* eslint-disable no-console */
import express from 'express'
import { MongoClient } from 'mongodb'
import cors from 'cors'

const app = express()
app.use(cors())

const uri =
  'mongodb+srv://GraceLTQ:Apple_030711@outboundemailcluster.xapxelz.mongodb.net/'
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})

const dbName = 'EpsilonEmailDB'
const InboundCollectionName = 'KPIExcelSheet'

async function connectToMongoDB() {
  try {
    await client.connect()
    console.log('Connected successfully to MongoDB KPI')
  } catch (error) {
    console.error('Failed to connect to MongoDB', error)
    process.exit(1) // Exit in case of connection failure
  }
}

app.get('/deals', async (req, res) => {
  try {
    const database = client.db(dbName)
    const collection = database.collection(InboundCollectionName)

    // Check if the 'deal_name' field exists in at least one document
    const sample = await collection.findOne({ deal_name: { $exists: true } })
    console.log('Sample document with deal_name field:', sample)

    const counts = await collection
      .aggregate([
        {
          $group: {
            _id: '$deal_name',
            totalOutreach: { $sum: 1 },
            newFund: { $sum: '$new_fund' },
            respondOrNot: { $sum: '$repond_or_not' },
          },
        },
        {
          $project: {
            _id: 0,
            dealName: '$_id',
            totalOutreach: 1,
            newFund: 1,
            respondOrNot: 1,
          },
        },
        { $sort: { totalOutreach: -1 } },
      ])
      .toArray()

    res.json(counts)

    // res.json(inboundEmails)
  } catch (error) {
    console.error('Error fetching data:', error)
    res.status(500).send('Error fetching data')
  }
})

app.get('/account-holders', async (req, res) => {
  try {
    const database = client.db(dbName)
    const collection = database.collection(InboundCollectionName)

    const accountHolderCounts = await collection
      .aggregate([
        {
          $group: {
            _id: '$account_holder', // Group by the account_holder field
            totalOutreach: { $sum: 1 },
            newFund: { $sum: '$new_fund' }, // Assuming new_fund is a number
            respondOrNot: { $sum: '$repond_or_not' }, // Assuming repond_or_not is a number
            newRespond: { $sum: '$new_respond' }, // Assuming new_respond is a number
          },
        },
        {
          $project: {
            _id: 0,
            accountHolder: '$_id',
            totalOutreach: 1,
            newFund: 1,
            respondOrNot: 1,
            newRespond: 1,
          },
        },
        { $sort: { totalOutreach: -1 } },
      ])
      .toArray()

    res.json(accountHolderCounts)
  } catch (error) {
    console.error('Error fetching data:', error)
    res.status(500).send('Error fetching data')
  }
})

app.get('/monthly-totals', async (req, res) => {
  try {
    const database = client.db(dbName)
    const collection = database.collection(InboundCollectionName)

    const monthlyTotals = await collection
      .aggregate([
        {
          $group: {
            _id: {
              month: { $month: '$date' },
              year: { $year: '$date' },
            },
            totalOutreach: { $sum: 1 },
            totalNewFund: { $sum: '$new_fund' },
            totalResponse: { $sum: '$repond_or_not' },
            averageResponse: { $avg: '$repond_or_not' },
          },
        },
        {
          $project: {
            _id: 0,
            month: {
              $arrayElemAt: [
                [
                  'Jan',
                  'Feb',
                  'Mar',
                  'Apr',
                  'May',
                  'Jun',
                  'Jul',
                  'Aug',
                  'Sep',
                  'Oct',
                  'Nov',
                  'Dec',
                ],
                { $subtract: ['$_id.month', 1] },
              ],
            },
            year: '$_id.year',
            totalOutreach: 1,
            totalNewFund: 1,
            totalResponse: 1,
          },
        },
        { $sort: { year: 1, month: 1 } }, // Sort by year then month
      ])
      .toArray()

    res.json(
      monthlyTotals.map((item) => ({
        month: item.month,
        year: item.year,
        totalOutreach: item.totalOutreach,
        totalNewFund: item.totalNewFund,
        totalResponse: item.totalResponse,
        averageResponse: item.averageResponse,
      })),
    )
  } catch (error) {
    console.error('Error fetching monthly totals:', error)
    res.status(500).send('Error fetching data')
  }
})

app.get('/total-outreach-per-account-holder', async (req, res) => {
  try {
    const database = client.db(dbName)
    const collection = database.collection(InboundCollectionName)

    const totalOutreach = await collection
      .aggregate([
        {
          $group: {
            _id: '$account_holder',
            totalOutreach: { $sum: 1 },
          },
        },
        {
          $project: {
            _id: 0,
            accountHolder: '$_id',
            totalOutreach: 1,
          },
        },
        { $sort: { totalOutreach: -1 } },
      ])
      .toArray()

    res.json(totalOutreach)
  } catch (error) {
    console.error('Error fetching total outreach per account holder:', error)
    res.status(500).send('Error fetching data')
  }
})

app.get('/account-holder-kpis', async (req, res) => {
  try {
    const database = client.db(dbName)
    const collection = database.collection(InboundCollectionName)

    const accountHolderKPIs = await collection
      .aggregate([
        {
          $group: {
            _id: {
              accountHolder: '$account_holder',
              month: { $month: '$date' },
              year: { $year: '$date' },
            },
            totalOutreach: { $sum: 1 },
            newFund: { $sum: '$new_fund' },
            respondOrNot: { $sum: '$repond_or_not' },
            newRespond: { $sum: '$new_respond' },
          },
        },
        {
          $project: {
            _id: 0,
            accountHolder: '$_id.accountHolder',
            month: '$_id.month',
            year: '$_id.year',
            totalOutreach: 1,
            newFund: 1,
            respondOrNot: 1,
            newRespond: 1,
          },
        },
        { $sort: { accountHolder: 1, year: 1, month: 1 } },
      ])
      .toArray()

    res.json(accountHolderKPIs)
  } catch (error) {
    console.error('Error fetching account holder KPIs:', error)
    res.status(500).send('Error fetching data')
  }
})

app.listen(5002, async () => {
  console.log('API is working! KPI')
  await connectToMongoDB()
})

process.on('SIGINT', async () => {
  await client.close()
  console.log('MongoDB disconnected on app termination')
  process.exit(0)
})
