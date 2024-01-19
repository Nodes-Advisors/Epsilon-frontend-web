/* eslint-disable no-console */
import express from 'express'
import client from '../db/client.js'

const router = express.Router()
const dbName = 'EpsilonEmailDB'
const collectionName = 'KPIExcelSheet'

router.get('/deals', async (req, res) => {
  try {
    const database = client.db(dbName)
    const collection = database.collection(collectionName)

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
  } catch (error) {
    console.error('Error fetching data:', error)
    res.status(500).send('Error fetching data')
  }
})

export default router
