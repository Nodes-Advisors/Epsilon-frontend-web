import express from "express";
import client from "../db/client.js";

const router = express.Router();
const dbName = "dev";
const collectionName = "FundraisingPipeline";

router.get("/total-outreach", async (req, res) => {
  try {
    const database = client.db(dbName);
    const collection = database.collection(collectionName);

    const aggregatedKPIs = await collection.aggregate([
      {
        $group: {
          _id: null, // Aggregate over the entire collection
          totalOutreach: { $sum: 1 }, // Sum totalOutreach
          deckRequested: {$sum: "$deck_request"},
          meetingRequested: {$sum: "$meeting_request"},
          ddRequested: {$sum: "$dd"},
          passes: {$sum: "$pass_contacted"}
        },
      },
      {
        $project: {
          _id: 0, // Exclude the _id field
          totalOutreach: 1, // Include the totalOutreach field
          deckRequested: 1, // Include the deckRequested field
          meetingRequested: 1, // Include the meetingRequested field
          ddRequested: 1, // Include the ddRequested field
          passes: 1,
        },
      },
    ]).toArray();

    // Send back the aggregated KPIs in JSON format
    // Since the result is an array with one object, we can directly send the first element
    res.json(aggregatedKPIs[0]);
  } catch (error) {
    console.error("Error fetching aggregated KPIs:", error);
    res.status(500).send("Error fetching aggregated KPIs");
  }
});

export default router;
