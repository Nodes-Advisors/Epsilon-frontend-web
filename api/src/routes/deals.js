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

// router.get("/deals/last-updated-status-dates", async (req, res) => {
//   try {
//     const database = client.db(dbName);
//     const collection = database.collection(collectionName);

//     const dates = await collection
//       .find(
//         {},
//         {
//           projection: {
//             _id: 0,
//             company_acronym: 1,
//             last_updated_status_date: 1,
//           },
//         }
//       )
//       .toArray();

//     const formattedDates = dates.map((item) => {
//       return {
//         company_acronym: item.company_acronym,
//         last_updated_status_date: new Date(
//           item.last_updated_status_date
//         ).toLocaleDateString("en-US", {
//           year: "numeric",
//           month: "long",
//           day: "numeric",
//         }),
//       };
//     });

//     res.json(formattedDates);
//   } catch (error) {
//     console.error("Error fetching last updated status dates:", error);
//     res.status(500).send("Error fetching last updated status dates");
//   }
// });

router.get("/deals/last-updated-status-dates", async (req, res) => {
  const { startDate, endDate } = req.query;

  // Log the received startDate and endDate
  console.log(
    `Fetching deals with last updated status dates between ${startDate} and ${endDate}`
  );

  try {
    const database = client.db(dbName);
    const collection = database.collection(collectionName);

    // Convert startDate and endDate from string to Date objects and then to timestamps
    const startTimestamp = startDate ? new Date(startDate).getTime() : 0; // Use a default far past date if startDate is not provided
    const endTimestamp = endDate
      ? new Date(endDate + "T23:59:59.999Z").getTime()
      : Date.now(); // Use current date as default for endDate and set time to the end of the day

    console.log(
      `Querying MongoDB with timestamps: ${startTimestamp} to ${endTimestamp}`
    );

    const dates = await collection
      .find(
        {
          last_updated_status_date: {
            $gte: startTimestamp,
            $lte: endTimestamp,
          },
        },
        {
          projection: {
            _id: 0,
            company_acronym: 1,
            last_updated_status_date: 1,
          },
        }
      )
      .toArray();

    console.log(`Found ${dates.length} deals within the specified date range`);

    res.json(
      dates.map(({ company_acronym, last_updated_status_date }) => ({
        company_acronym,
        last_updated_status_date: new Date(
          last_updated_status_date
        ).toLocaleDateString("en-US"),
      }))
    );
  } catch (error) {
    console.error("Error fetching last updated status dates:", error);
    res.status(500).send("Error fetching last updated status dates");
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

// router.post("/deals/filter", async (req, res) => {
//   const companyNames = req.body.companyNames; // Expect an array of company names
//   try {
//     const database = client.db(dbName);
//     const collection = database.collection(collectionName);

//     const pipeline = [
//       {
//         $match: {
//           company_name: { $in: companyNames },
//         },
//       },
//       // ... rest of the existing aggregation pipeline ...
//     ];

//     const counts = await collection.aggregate(pipeline).toArray();

//     res.json(counts);
//   } catch (error) {
//     console.error("Error fetching filtered data:", error);
//     res.status(500).send("Error fetching data");
//   }
// });

export default router;
