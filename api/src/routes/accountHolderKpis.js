// KPI by month
import express from "express";
import client from "../db/client.js";

const router = express.Router();
const dbName = "dev";
const collectionName = "FundraisingPipeline";

router.get("/account-holder-kpis", async (req, res) => {
  try {
    const database = client.db(dbName);
    const collection = database.collection(collectionName);

    const accountHolderKPIs = await collection
      .aggregate([
        {
          $group: {
            _id: {
              accountHolder: "$account_holder",
              month: { $month: "$date" },
              year: { $year: "$date" },
            },
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
            newRespond: { $sum: "$new_respond" },
          },
        },
        {
          $project: {
            _id: 0,
            accountHolder: "$_id.accountHolder",
            month: "$_id.month",
            year: "$_id.year",
            totalOutreach: 1,
            newFund: 1,
            respondOrNot: 1,
            newRespond: 1,
          },
        },
        { $sort: { accountHolder: 1, year: 1, month: 1 } },
      ])
      .toArray();

    res.json(accountHolderKPIs);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).send("Error fetching data");
  }
});

export default router;
