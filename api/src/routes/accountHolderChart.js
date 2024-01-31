// Example endpoint to fetch KPIs for a specific account holder
router.get("/account-holder-kpis/:accountHolder", async (req, res) => {
  const accountHolderName = req.params.accountHolder; // Get the account holder from the URL parameter
  try {
    const database = client.db(dbName);
    const collection = database.collection(collectionName);

    const accountHolderKPIs = await collection
      .aggregate([
        {
          $match: {
            account_holder: accountHolderName, // Match documents for the specific account holder
          },
        },
        {
          $group: {
            _id: null, // Group all documents for the account holder
            totalOutreach: { $sum: 1 },
            deckRequested: { $sum: "$deck_request" },
            meetingRequested: { $sum: "$meeting_request" },
            ddRequested: { $sum: "$dd" },
          },
        },
        {
          $project: {
            _id: 0, // Exclude the _id field
            totalOutreach: 1,
            deckRequested: 1,
            meetingRequested: 1,
            ddRequested: 1,
          },
        },
      ])
      .toArray();

    if (accountHolderKPIs.length > 0) {
      res.json(accountHolderKPIs[0]);
    } else {
      res.status(404).send("Account holder not found");
    }
  } catch (error) {
    console.error("Error fetching KPIs for account holder:", error);
    res.status(500).send("Internal Server Error");
  }
});
