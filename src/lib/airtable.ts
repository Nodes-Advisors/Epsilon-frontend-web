import Airtable from 'airtable'

async function getFundCards() {
  const base = new Airtable({ 
    apiKey: 'patxix215UQ1IOzuD.2806801d1f4480f972729fc04378fd0b3c266a589ff8ef12afb914a0c03eda61',
    endpointUrl: 'https://api.airtable.com',
  }).base(
    'appDoQynStUNRzBbf',
  )
    
  //   base('tblh1GfgpesYLTkFD').select({
  //     view: 'Grid view',
  //   }).all().then((records) => {
  //     records.forEach((record) => {
  //       console.log(record)
  //     })
  //   }).catch((err) => {
  //     console.error(err)
  //   })

  base('Data').select({
    // Selecting the first 3 records in Grid view:
    // maxRecords: 3,
    view: 'Grid view',
    filterByFormula: "NOT({Investor ID} = '')",
  }).eachPage(function page(records, fetchNextPage) {
    // This function (`page`) will get called for each page of records.

    records.forEach(function(record) {
      console.log('Retrieved', record.get('Logo'))
    })

    // To fetch the next page of records, call `fetchNextPage`.
    // If there are more records, `page` will get called again.
    // If there are no more records, `done` will get called.
    fetchNextPage()

  }, function done(err) {
    if (err) { console.error(err); return }
  })

}


getFundCards()
