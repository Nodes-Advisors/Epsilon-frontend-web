/* eslint-disable no-console */
import express from "express";
import client from "../db/client.js";

const router = express.Router();
const dbName = "dev";
const collectionName = "FundraisingPipeline";

router.post("/deals/filter", async (req, res) => {
  const companyNames = req.body.companyNames; // Expect an array of company names
  try {
    const database = client.db(dbName);
    const collection = database.collection(collectionName);

    const pipeline = [
      {
        $match: {
          company_name: { $in: companyNames }
        }
      },
      // ... rest of the existing aggregation pipeline ...
    ];

    const counts = await collection.aggregate(pipeline).toArray();

    res.json(counts);
  } catch (error) {
    console.error("Error fetching filtered data:", error);
    res.status(500).send("Error fetching data");
  }
});

export default router;