/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-undef */
// test/integration/accountHolderKpis.test.js
import request from 'supertest'
import app from '../../src/app.js' // Update the import path according to your project structure

describe('Integration tests for /account-holder-kpis endpoint', () => {
  it('GET /account-holder-kpis - success', async () => {
    // Start the test server
    const res = await request(app).get('/account-holder-kpis')

    // Check the HTTP status code
    expect(res.statusCode).toEqual(200)

    // Check the Content-Type header
    expect(res.headers['content-type']).toEqual(expect.stringContaining('json'))

    // Ensure the response is an array
    expect(Array.isArray(res.body)).toBe(true)

    // Optionally check the structure of the response objects
    if (res.body.length > 0) {
      expect(res.body[0]).toHaveProperty('accountHolder')
      expect(res.body[0]).toHaveProperty('month')
      expect(res.body[0]).toHaveProperty('year')
      expect(res.body[0]).toHaveProperty('totalOutreach')
      expect(res.body[0]).toHaveProperty('newFund')
      expect(res.body[0]).toHaveProperty('respondOrNot')
      expect(res.body[0]).toHaveProperty('newRespond')
    }
  })

  it('GET /account-holder-kpis ', async () => {
    const res = await request(app).get('/account-holder-kpis')

    expect(res.statusCode).toEqual(200)

    const expectedData = [
      {'totalOutreach':27,'newFund':19,'respondOrNot':6,'newRespond':2,'accountHolder':'Abhishek','month':3,'year':2023},
      {'totalOutreach':34,'newFund':17,'respondOrNot':12,'newRespond':2,'accountHolder':'Abhishek','month':4,'year':2023},
      {'totalOutreach':34,'newFund':25,'respondOrNot':7,'newRespond':3,'accountHolder':'Abhishek','month':5,'year':2023},
      {'totalOutreach':19,'newFund':14,'respondOrNot':2,'newRespond':2,'accountHolder':'Abhishek','month':6,'year':2023},
      {'totalOutreach':14,'newFund':4,'respondOrNot':2,'newRespond':0,'accountHolder':'Abhishek','month':7,'year':2023},
      {'totalOutreach':1,'newFund':1,'respondOrNot':0,'newRespond':0,'accountHolder':'Abhishek','month':8,'year':2023},
      {'totalOutreach':3,'newFund':2,'respondOrNot':2,'newRespond':1,'accountHolder':'Eliott','month':11,'year':2022},
      {'totalOutreach':1,'newFund':1,'respondOrNot':1,'newRespond':1,'accountHolder':'Eliott','month':1,'year':2023},
      {'totalOutreach':12,'newFund':8,'respondOrNot':4,'newRespond':2,'accountHolder':'Eliott','month':2,'year':2023},
      {'totalOutreach':24,'newFund':12,'respondOrNot':8,'newRespond':2,'accountHolder':'Eliott','month':3,'year':2023},
      {'totalOutreach':77,'newFund':56,'respondOrNot':15,'newRespond':6,'accountHolder':'Eliott','month':4,'year':2023},
      {'totalOutreach':62,'newFund':45,'respondOrNot':5,'newRespond':2,'accountHolder':'Eliott','month':5,'year':2023},
      {'totalOutreach':82,'newFund':55,'respondOrNot':6,'newRespond':4,'accountHolder':'Eliott','month':6,'year':2023},
      {'totalOutreach':1,'newFund':0,'respondOrNot':1,'newRespond':0,'accountHolder':'Eliott','month':7,'year':2023},
      {'totalOutreach':56,'newFund':46,'respondOrNot':7,'newRespond':3,'accountHolder':'Eliott','month':9,'year':2023},
      {'totalOutreach':130,'newFund':94,'respondOrNot':22,'newRespond':14,'accountHolder':'Eliott','month':10,'year':2023},
      {'totalOutreach':73,'newFund':46,'respondOrNot':19,'newRespond':8,'accountHolder':'Eliott','month':11,'year':2023},
      {'totalOutreach':8,'newFund':2,'respondOrNot':1,'newRespond':1,'accountHolder':'Iman','month':11,'year':2022},
      {'totalOutreach':30,'newFund':12,'respondOrNot':15,'newRespond':4,'accountHolder':'Iman','month':2,'year':2023},
      {'totalOutreach':26,'newFund':10,'respondOrNot':5,'newRespond':0,'accountHolder':'Iman','month':3,'year':2023},
      {'totalOutreach':22,'newFund':10,'respondOrNot':4,'newRespond':1,'accountHolder':'Iman','month':4,'year':2023},
      {'totalOutreach':3,'newFund':1,'respondOrNot':1,'newRespond':0,'accountHolder':'Iman','month':5,'year':2023},
      {'totalOutreach':54,'newFund':17,'respondOrNot':16,'newRespond':2,'accountHolder':'Iman','month':6,'year':2023},
      {'totalOutreach':12,'newFund':9,'respondOrNot':0,'newRespond':0,'accountHolder':'Iman','month':7,'year':2023},
      {'totalOutreach':8,'newFund':5,'respondOrNot':2,'newRespond':1,'accountHolder':'Iman','month':8,'year':2023},
      {'totalOutreach':43,'newFund':31,'respondOrNot':4,'newRespond':2,'accountHolder':'Iman','month':9,'year':2023},
      {'totalOutreach':169,'newFund':95,'respondOrNot':20,'newRespond':5,'accountHolder':'Iman','month':10,'year':2023},
      {'totalOutreach':194,'newFund':118,'respondOrNot':25,'newRespond':16,'accountHolder':'Iman','month':11,'year':2023},
      {'totalOutreach':69,'newFund':52,'respondOrNot':7,'newRespond':5,'accountHolder':'Iman','month':12,'year':2023},
      {'totalOutreach':123,'newFund':60,'respondOrNot':23,'newRespond':3,'accountHolder':'Jesse','month':11,'year':2022},
      {'totalOutreach':39,'newFund':9,'respondOrNot':12,'newRespond':0,'accountHolder':'Jesse','month':12,'year':2022},
      {'totalOutreach':61,'newFund':27,'respondOrNot':6,'newRespond':1,'accountHolder':'Jesse','month':1,'year':2023},
      {'totalOutreach':52,'newFund':14,'respondOrNot':22,'newRespond':2,'accountHolder':'Jesse','month':2,'year':2023},
      {'totalOutreach':89,'newFund':58,'respondOrNot':18,'newRespond':3,'accountHolder':'Jesse','month':3,'year':2023},
      {'totalOutreach':146,'newFund':91,'respondOrNot':36,'newRespond':10,'accountHolder':'Jesse','month':4,'year':2023},
      {'totalOutreach':63,'newFund':16,'respondOrNot':39,'newRespond':9,'accountHolder':'Jesse','month':5,'year':2023},
      {'totalOutreach':37,'newFund':17,'respondOrNot':17,'newRespond':9,'accountHolder':'Jesse','month':6,'year':2023},
      {'totalOutreach':22,'newFund':9,'respondOrNot':12,'newRespond':4,'accountHolder':'Jesse','month':7,'year':2023},
      {'totalOutreach':17,'newFund':9,'respondOrNot':12,'newRespond':8,'accountHolder':'Jesse','month':8,'year':2023},
      {'totalOutreach':14,'newFund':3,'respondOrNot':10,'newRespond':2,'accountHolder':'Jesse','month':9,'year':2023},{'totalOutreach':16,'newFund':13,'respondOrNot':9,'newRespond':9,'accountHolder':'Jesse','month':10,'year':2023},{'totalOutreach':20,'newFund':1,'respondOrNot':13,'newRespond':1,'accountHolder':'Jesse','month':11,'year':2023},{'totalOutreach':1,'newFund':1,'respondOrNot':1,'newRespond':1,'accountHolder':'Tyler','month':10,'year':2022},{'totalOutreach':38,'newFund':30,'respondOrNot':14,'newRespond':8,'accountHolder':'Tyler','month':11,'year':2022},{'totalOutreach':2,'newFund':2,'respondOrNot':1,'newRespond':1,'accountHolder':'Tyler','month':12,'year':2022},{'totalOutreach':10,'newFund':6,'respondOrNot':4,'newRespond':1,'accountHolder':'Tyler','month':1,'year':2023},{'totalOutreach':51,'newFund':36,'respondOrNot':16,'newRespond':7,'accountHolder':'Tyler','month':2,'year':2023},{'totalOutreach':61,'newFund':35,'respondOrNot':21,'newRespond':11,'accountHolder':'Tyler','month':3,'year':2023},{'totalOutreach':33,'newFund':16,'respondOrNot':7,'newRespond':4,'accountHolder':'Tyler','month':4,'year':2023},{'totalOutreach':38,'newFund':16,'respondOrNot':17,'newRespond':6,'accountHolder':'Tyler','month':5,'year':2023},{'totalOutreach':21,'newFund':8,'respondOrNot':4,'newRespond':1,'accountHolder':'Tyler','month':7,'year':2023},{'totalOutreach':11,'newFund':4,'respondOrNot':4,'newRespond':2,'accountHolder':'Tyler','month':9,'year':2023},{'totalOutreach':87,'newFund':37,'respondOrNot':14,'newRespond':5,'accountHolder':'Tyler','month':10,'year':2023},{'totalOutreach':122,'newFund':61,'respondOrNot':34,'newRespond':10,'accountHolder':'Tyler','month':11,'year':2023},{'totalOutreach':17,'newFund':7,'respondOrNot':1,'newRespond':0,'accountHolder':'Tyler','month':12,'year':2023},
    ]
    

    // Check that each expected data object is in the response
    expectedData.forEach((data) => {
      expect(res.body).toEqual(
        expect.arrayContaining([expect.objectContaining(data)]),
      )
    })

    // Check if the response only contains the expected number of objects
    expect(res.body.length).toEqual(expectedData.length)
  })


  // Add more tests here for different scenarios, such as failure cases
})

