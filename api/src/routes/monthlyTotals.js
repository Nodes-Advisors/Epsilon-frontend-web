import express from 'express'
import client from '../db/client.js'

const router = express.Router()
const dbName = "dev";
const collectionName = "FundraisingPipeline";

router.get('/monthly-totals', async (req, res) => {
  try {
    const database = client.db(dbName)
    const collection = database.collection(collectionName)

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
            totalResponse: { $sum: '$follow_up' },
            averageResponse: { $avg: '$follow_up' },
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
    console.error('Error fetching data:', error)
    res.status(500).send('Error fetching data')
  }
})

export default router
