import express from 'express'
import client from '../db/client.js'

const router = express.Router()
const dbName = "dev";
const collectionName = "FundraisingPipeline";

router.get('/account-holders', async (req, res) => {
  try {
    const database = client.db(dbName)
    const collection = database.collection(collectionName)

    const accountHolderCounts = await collection
      .aggregate([
        {
          $group: {
            _id: '$account_holder',  // Group by the account_holder field
            totalOutreach: { $sum: 1 },
            newFund: { $sum: '$new_fund' }, // Assuming new_fund is a number
            respondOrNot: {
              $sum: {
                $cond: [
                  { $ne: ['$current_status', 'waiting for response'] }, // Condition: current_status is not "waiting for response"
                  1,  // If condition is true, count this row (add 1)
                  0   // If condition is false, do not count this row (add 0)
                ]
              }
            },
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

export default router
