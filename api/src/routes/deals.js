/* eslint-disable no-console */
import express from "express";
import client from "../db/client.js";

const router = express.Router();
const dbName = "dev";
const collectionName = "FundraisingPipeline";

router.get("/deals", async (req, res) => {
  try {
    const database = client.db(dbName);
    const collection = database.collection(collectionName);

    const counts = await collection
      .aggregate([
        {
          $group: {
            _id: "$company_name",
            totalOutreach: { $sum: 1 },
            newFund: { $sum: "$new_fund" },
            respondOrNot: {
              $sum: {
                $cond: [
                  { $ne: ["$current_status", "waiting for response"] }, // Condition: current_status is not "waiting for response"
                  1, // If condition is true, count this row (add 1)
                  0, // If condition is false, do not count this row (add 0)
                ],
              },
            },
            deckRequested: { $sum: "$deck_request" },
            meetingRequested: { $sum: "$meeting_request" },
            ddRequested: { $sum: "$dd" },
          },
        },
        {
          $project: {
            _id: 0,
            dealName: "$_id",
            totalOutreach: 1,
            newFund: 1,
            respondOrNot: 1,
            deckRequested: 1,
            meetingRequested: 1,
            ddRequested: 1,
          },
        },
        { $sort: { totalOutreach: -1 } },
      ])
      .toArray();

    res.json(counts);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).send("Error fetching data");
  }
});

// Endpoint to fetch all unique company names
router.get("/deal-names", async (req, res) => {
  try {
    const database = client.db(dbName);
    const collection = database.collection(collectionName);

    const companies = await collection
      .aggregate([
        {
          $group: {
            _id: "$company_acronym",
          },
        },
        {
          $project: {
            _id: 0,
            company_name: "$_id",
          },
        },
      ])
      .toArray();

    // Map the results to return an array of company names
    const companyNames = companies.map((c) => c.company_name);
    res.json(companyNames);
  } catch (error) {
    console.error("Error fetching company names:", error);
    res.status(500).send("Error fetching company names");
  }
});

router.post("/deals/filter", async (req, res) => {
  const companyNames = req.body.companyNames; // Expect an array of company names
  try {
    const database = client.db(dbName);
    const collection = database.collection(collectionName);

    const pipeline = [
      {
        $match: {
          company_name: { $in: companyNames },
        },
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
