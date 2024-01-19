import Airtable, { FieldSet, Record } from 'airtable'

  

export async function getFundCards(apiKey: string | undefined = undefined, baseId: string | undefined = undefined) {
  if(!apiKey || !baseId) throw new Error('Missing Airtable API Key or Base ID')
  const base = new Airtable({ 
    apiKey: apiKey,
    endpointUrl: 'https://api.airtable.com',
  }).base(
    baseId,
  )
    
  const allRecords: Record<FieldSet>[] = []

  await new Promise((resolve, reject) => {
    base('Data').select({
      // Selecting the first 3 records in Grid view:
      // maxRecords: 3,
      view: 'Grid view',
      filterByFormula: "NOT({Investor ID} = '')",
    }).eachPage(function page(records, fetchNextPage) {
      // This function (`page`) will get called for each page of records.
      allRecords.push(...records)
      // records.forEach(function(record) {
      // console.log('Retrieved', record)
      // })
  
      // To fetch the next page of records, call `fetchNextPage`.
      // If there are more records, `page` will get called again.
      // If there are no more records, `done` will get called.
      fetchNextPage()
      
    }, function done(err) {
      if (err) { console.error(err); reject(err); return }
      resolve(allRecords)
    })
  })
  return allRecords
}


// getFundCards()
