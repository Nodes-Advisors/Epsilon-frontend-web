import express from 'express'
import { MongoClient } from 'mongodb'
import cors from 'cors'

// Express setup
const app = express()
app.use(cors())

// MongoDB setup
const uri = 'mongodb+srv://GraceLTQ:Apple_030711@outboundemailcluster.xapxelz.mongodb.net/' // Make sure this is your correct URI
const client = new MongoClient(uri)

const dbName = 'EpsilonEmailDB'
const collectionName = 'KPIExcelSheet'

async function connectToMongoDB() {
  try {
    await client.connect()
    console.log('Connected successfully to MongoDB KPIExcel')
  } catch (error) {
    console.error('Failed to connect to MongoDB', error)
    // Optionally, you can throw the error to let the server retry on next request
    // throw error;
  }
}

// Endpoint to get the aggregated counts
app.get('/', async (req, res) => {
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
  console.log('Server is running on http://localhost:5002')
  await connectToMongoDB()
})

// Graceful shutdown
process.on('SIGINT', async () => {
  await client.close()
  console.log('MongoDB disconnected on app termination')
  process.exit(0)
})



// import express from 'express';
// import { MongoClient } from 'mongodb';
// import cors from 'cors';

// const app = express();
// app.use(cors());

// const uri = 'mongodb+srv://GraceLTQ:Apple_030711@outboundemailcluster.xapxelz.mongodb.net/';
// const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

// const dbName = 'EpsilonEmailDB';
// const InboundCollectionName = 'InboundEmails';

// async function connectToMongoDB() {
//   try {
//     await client.connect();
//     console.log('Connected successfully to MongoDB');
//   } catch (error) {
//     console.error('Failed to connect to MongoDB', error);
//     process.exit(1); // Exit in case of connection failure
//   }
// }

// app.get('/', async (req, res) => {
//   const { q } = req.query;
//   const keys = ['subject', 'sender', 'isInvestorEmail', 'isInterested', 'deckRequested', 'meetingRequested', 'proposalAccepted', 'project'];

//   const searchQuery = q ? {
//     $or: keys.map(key => ({ [key]: new RegExp(q, 'i') }))
//   } : {};

//   try {
//     const database = client.db(dbName);
//     const inboundCollection = database.collection(InboundCollectionName);

//     const inboundEmails = await inboundCollection.find(searchQuery).limit(100).toArray();
//     res.json(inboundEmails);
//   } catch (error) {
//     console.error('Error fetching data:', error);
//     res.status(500).send('Error fetching data');
//   }
// });

// app.listen(5002, async () => {
//   console.log('API is working!');
//   await connectToMongoDB();
// });

// process.on('SIGINT', async () => {
//   await client.close();
//   console.log('MongoDB disconnected on app termination');
//   process.exit(0);
// });

