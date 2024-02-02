// import express from 'express';
// import { MongoClient } from 'mongodb';
// import cors from 'cors';

// const app = express();
// app.use(cors());

// const uri = 'mongodb+srv://GraceLTQ:Apple_030711@outboundemailcluster.xapxelz.mongodb.net/?retryWrites=true&w=majority';
// const client = new MongoClient(uri);

// const dbName = 'OutboundEmailCluster';
// const collectionName = 'emaildata';

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
//   const keys = ['subject', 'sender', 'toRecipients'];

//   const searchQuery = q ? {
//     $or: keys.map(key => ({ [key]: new RegExp(q, 'i') }))
//   } : {};

//   try {
//     const database = client.db(dbName);
//     const collection = database.collection(collectionName);
//     const emails = await collection.find(searchQuery).limit(10).toArray();
//     res.json(emails);
//   } catch (error) {
//     console.error('Error fetching data:', error);
//     res.status(500).send('Error fetching data');
//   }
// });

// app.listen(5001, async () => {
//   console.log('API is working!');
//   await connectToMongoDB();
// });

// process.on('SIGINT', async () => {
//   await client.close();
//   console.log('MongoDB disconnected on app termination');
//   process.exit(0);
// });

