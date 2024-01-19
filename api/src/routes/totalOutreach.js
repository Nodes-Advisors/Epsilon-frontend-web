import express from 'express'
import client from '../db/client.js'

const router = express.Router()
const dbName = 'EpsilonEmailDB'
const collectionName = 'KPIExcelSheet'

router.get('/total-outreach-per-account-holder', async (req, res) => {
  try {
    const database = client.db(dbName)
    const collection = database.collection(collectionName)

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
    console.error('Error fetching data:', error)
    res.status(500).send('Error fetching data')
  }
})

export default router
