import express from "express";
import { MongoClient } from "mongodb";
import cors from "cors";

const app = express();
app.use(cors());

const uri =
  "mongodb+srv://GraceLTQ:Apple_030711@outboundemailcluster.xapxelz.mongodb.net/";
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const dbName = "EpsilonEmailDB";
const InboundCollectionName = "KPIExcelSheet";

async function connectToMongoDB() {
  try {
    await client.connect();
    console.log("Connected successfully to MongoDB KPI");
  } catch (error) {
    console.error("Failed to connect to MongoDB", error);
    process.exit(1); // Exit in case of connection failure
  }
}

app.get("/deals", async (req, res) => {
  try {
    const database = client.db(dbName);
    const collection = database.collection(InboundCollectionName);

    // Check if the 'deal_name' field exists in at least one document
    const sample = await collection.findOne({ deal_name: { $exists: true } });
    console.log("Sample document with deal_name field:", sample);

    const counts = await collection
      .aggregate([
        {
          $group: {
            _id: "$deal_name", // or the field that represents the deal name in your collection
            totalOutreach: { $sum: 1 },
            newFund: { $sum: "$new_fund" }, // Replace with the actual field name
            respondOrNot: { $sum: "$repond_or_not" }, // Replace with the actual field name
          },
        },
        {
          $project: {
            _id: 0,
            dealName: "$_id",
            totalOutreach: 1,
            newFund: 1,
            respondOrNot: 1,
          },
        },
        { $sort: { totalOutreach: -1 } },
      ])
      .toArray();

    res.json(counts);

    // res.json(inboundEmails)
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).send("Error fetching data");
  }
});

app.get("/account-holders", async (req, res) => {
  try {
    const database = client.db(dbName);
    const collection = database.collection(InboundCollectionName);

    const accountHolderCounts = await collection
      .aggregate([
        {
          $group: {
            _id: "$account_holder", // Group by the account_holder field
            totalOutreach: { $sum: 1 },
            newFund: { $sum: "$new_fund" }, // Assuming new_fund is a number
            respondOrNot: { $sum: "$repond_or_not" }, // Assuming respond_or_not is a number
            newRespond: { $sum: "$new_respond" }, // Assuming new_respond is a number
          },
        },
        {
          $project: {
            _id: 0,
            accountHolder: "$_id",
            totalOutreach: 1,
            newFund: 1,
            respondOrNot: 1,
            newRespond: 1,
          },
        },
        { $sort: { totalOutreach: -1 } },
      ])
      .toArray();

    res.json(accountHolderCounts);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).send("Error fetching data");
  }
});

app.listen(5002, async () => {
  console.log("API is working! KPI");
  await connectToMongoDB();
});

process.on("SIGINT", async () => {
  await client.close();
  console.log("MongoDB disconnected on app termination");
  process.exit(0);
});
