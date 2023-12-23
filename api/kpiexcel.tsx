// import mongoose from 'mongoose'
// import express from 'express'

// // Define the schema for the Portfolio document
// const PortfolioSchema = new mongoose.Schema({
//   portfolio: String,
// })

// // Create a Mongoose model
// const Portfolio = mongoose.model('Portfolio', PortfolioSchema)

// // Connect to MongoDB
// mongoose.connect('mongodb+srv://GraceLTQ:Apple_030711@outboundemailcluster.xapxelz.mongodb.net/', {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// })

// // Express setup
// const app = express()
// const port = 5002

// // Endpoint to get the aggregated counts
// app.get('/portfolio-counts', async (req, res) => {
//   try {
//     // Aggregate the counts of each unique portfolio
//     const counts = await Portfolio.aggregate([
//       {
//         $group: {
//           _id: '$portfolio', // Group by the 'portfolio' field
//           totalCount: { $sum: 1 }, // Sum the occurrences
//         },
//       },
//       {
//         $project: {
//           _id: 0, // Do not include the _id field in the output
//           portfolio: '$_id', // Rename the _id field to 'portfolio'
//           totalCount: 1, // Include the 'totalCount' field
//         },
//       },
//       { $sort: { totalCount: -1 } }, // Sort by totalCount in descending order
//     ])

//     // Send the result as a response
//     res.json(counts)
//   } catch (error) {
//     res.status(500).send(error)
//   }
// })

// // Start the Express server
// app.listen(port, () => {
//   console.log(`Server is running on port ${port}`)
// })


import express from 'express'
import { MongoClient } from 'mongodb'
import cors from 'cors'

// Express setup
const app = express()
app.use(cors())

// MongoDB setup
const uri = 'mongodb+srv://GraceLTQ:Apple_030711@outboundemailcluster.xapxelz.mongodb.net/'
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true })

const dbName = 'EpsilonEmailDB'
const collectionName = 'KPIExcelSheet'

async function connectToMongoDB() {
  try {
    await client.connect()
    console.log('Connected successfully to MongoDB')
  } catch (error) {
    console.error('Failed to connect to MongoDB', error)
    process.exit(1) // Exit in case of connection failure
  }
}

// Endpoint to get the aggregated counts
app.get('/portfolio-counts', async (req, res) => {
  try {
    const database = client.db(dbName)
    const collection = database.collection(collectionName)

    // Aggregate the counts of each unique portfolio
    const counts = await collection.aggregate([
      {
        $group: {
          _id: '$portfolio', // Group by the 'portfolio' field
          totalCount: { $sum: 1 }, // Sum the occurrences
        },
      },
      {
        $project: {
          _id: 0, // Do not include the _id field in the output
          portfolio: '$_id', // Rename the _id field to 'portfolio'
          totalCount: 1, // Include the 'totalCount' field
        },
      },
      { $sort: { totalCount: -1 } }, // Sort by totalCount in descending order
    ]).toArray()

    // Send the result as a response
    res.json(counts)
  } catch (error) {
    console.error('Error fetching data:', error)
    res.status(500).send('Error fetching data')
  }
})

// Start the Express server and connect to MongoDB
app.listen(5002, async () => {
  console.log('Server is running on http://localhost:3000')
  await connectToMongoDB()
})

// Graceful shutdown
process.on('SIGINT', async () => {
  await client.close()
  console.log('MongoDB disconnected on app termination')
  process.exit(0)
})