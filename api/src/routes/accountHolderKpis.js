import express from 'express'
import client from '../db/client.js'

const router = express.Router()
const dbName = 'EpsilonEmailDB'
const collectionName = 'KPIExcelSheet'

router.get('/account-holder-kpis', async (req, res) => {
  try {
    const database = client.db(dbName)
    const collection = database.collection(collectionName)

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
    console.error('Error fetching data:', error)
    res.status(500).send('Error fetching data')
  }
})

export default router
