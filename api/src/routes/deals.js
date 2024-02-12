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
            _id: "$company_acronym",
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

router.get("/deals/last-updated-status-dates", async (req, res) => {
  const { startDate, endDate } = req.query;

  console.log(`Fetching deals between ${startDate} and ${endDate}`);

  try {
    const database = client.db(dbName);
    const collection = database.collection(collectionName);

    // Convert startDate and endDate to timestamps
    const startTimestamp = startDate ? new Date(startDate).getTime() : 0;
    const endTimestamp = endDate
      ? new Date(endDate + "T23:59:59.999Z").getTime()
      : Date.now();

    console.log(
      `Querying for timestamps: ${startTimestamp} to ${endTimestamp}`
    );

    const pipeline = [
      {
        $match: {
          last_updated_status_date: {
            $gte: startTimestamp,
            $lte: endTimestamp,
          },
        },
      },
      {
        $group: {
          _id: "$company_acronym",
          company_name: { $first: "$company_name" }, // Assuming company_name is consistent for each company_acronym
          // account_holder: { $first: "$account_holder" }, // Assuming a single account_holder for each company_acronym, adjust as needed
          totalOutreach: { $sum: 1 },
          newFund: { $sum: "$new_fund" },
          respondOrNot: {
            $sum: {
              $cond: [
                { $ne: ["$current_status", "waiting for response"] },
                1,
                0,
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
          company_acronym: "$_id",
          _id: 0,
          company_name: 1,
          // account_holder: 1,
          totalOutreach: 1,
          newFund: 1,
          respondOrNot: 1,
          deckRequested: 1,
          meetingRequested: 1,
          ddRequested: 1,
        },
      },
      { $sort: { totalOutreach: -1 } },
    ];

    const aggregatedData = await collection.aggregate(pipeline).toArray();

    console.log(
      `Found ${aggregatedData.length} companies within the selected date range`
    );

    res.json(aggregatedData);
  } catch (error) {
    console.error("Error fetching aggregated data:", error);
    res.status(500).send("Error fetching aggregated data");
  }
});

router.get("/deals/aggregated", async (req, res) => {
  const { startDate, endDate } = req.query;

  try {
    const database = client.db(dbName);
    const collection = database.collection(collectionName);

    // Convert startDate and endDate from string to Date objects and then to timestamps
    const startTimestamp = startDate ? new Date(startDate).getTime() : 0;
    const endTimestamp = endDate
      ? new Date(endDate + "T23:59:59.999Z").getTime()
      : Date.now();

    const aggregationPipeline = [
      {
        $match: {
          last_updated_status_date: {
            $gte: startTimestamp,
            $lte: endTimestamp,
          },
        },
      },
      {
        $group: {
          _id: null, // Grouping without a specific field to aggregate over the whole dataset
          totalOutreach: { $sum: 1 },
          deckRequested: { $sum: "$deck_request" },
          meetingRequested: { $sum: "$meeting_request" },
          ddRequested: { $sum: "$dd" },
          passes: {
            $sum: {
              $cond: [
                { $eq: ["$current_status", "pass"] }, // Assuming 'pass' status indicates a pass
                1,
                0,
              ],
            },
          },
        },
      },
      {
        $project: {
          _id: 0, // Exclude the _id field
          totalOutreach: 1,
          deckRequested: 1,
          meetingRequested: 1,
          ddRequested: 1,
          passes: 1,
        },
      },
    ];

    const aggregatedData = await collection
      .aggregate(aggregationPipeline)
      .toArray();

    if (aggregatedData.length > 0) {
      res.json(aggregatedData[0]); // Send the aggregated data
    } else {
      res.json({ message: "No data found for the given date range" });
    }
  } catch (error) {
    console.error("Error aggregating last updated status dates:", error);
    res.status(500).send("Error aggregating last updated status dates");
  }
});

router.post("/deals/filter", async (req, res) => {
  const { companyNames } = req.body; // Expect an array of company acronyms
  try {
    const database = client.db(dbName);
    const collection = database.collection(collectionName);

    const deals = await collection
      .find({
        company_acronym: { $in: companyNames },
      })
      .toArray();

    res.json(deals); // Send the filtered deals back to the client
  } catch (error) {
    console.error("Error fetching filtered deals:", error);
    res.status(500).send("Error fetching filtered deals");
  }
});

export default router;
