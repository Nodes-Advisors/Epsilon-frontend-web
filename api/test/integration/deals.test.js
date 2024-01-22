/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-undef */
// test/integration/deals.test.js
import request from 'supertest'
import app from '../../src/app.js' // Update the import path according to your project structure

describe('Integration tests for /deals endpoint', () => {
  it('GET /deals - success', async () => {
    // Start the test server
    const res = await request(app).get('/deals')

    // Check the HTTP status code
    expect(res.statusCode).toEqual(200)

    // Check the Content-Type header
    expect(res.headers['content-type']).toEqual(
      expect.stringContaining('json'),
    )

    // Ensure the response is an array
    expect(Array.isArray(res.body)).toBe(true)

    // Optionally check the structure of the response objects
    if (res.body.length > 0) {
      expect(res.body[0]).toHaveProperty('dealName')
      expect(res.body[0]).toHaveProperty('totalOutreach')
      expect(res.body[0]).toHaveProperty('newFund')
      expect(res.body[0]).toHaveProperty('respondOrNot')
    }
  })

  it('GET / - wrong port with 404', async () => {
    const res = await request(app).get('/')

    expect(res.statusCode).toEqual(404)
    expect(res.body).toEqual({})
  })

  it('GET /deals - correct contents', async () => {
    const res = await request(app).get('/deals')

    expect(res.statusCode).toEqual(200)

    const expectedObjects = [
      {'totalOutreach':300,'newFund':144,'respondOrNot':54,'dealName':'REM'},
      {'totalOutreach':267,'newFund':160,'respondOrNot':90,'dealName':'Nema life'},
      {'totalOutreach':234,'newFund':181,'respondOrNot':42,'dealName':'CH4'},
      {'totalOutreach':214,'newFund':81,'respondOrNot':67,'dealName':'Antion'},
      {'totalOutreach':200,'newFund':127,'respondOrNot':39,'dealName':'Avivo'},
      {'totalOutreach':187,'newFund':110,'respondOrNot':46,'dealName':'Navan'},
      {'totalOutreach':165,'newFund':108,'respondOrNot':26,'dealName':'Lanier'},
      {'totalOutreach':164,'newFund':89,'respondOrNot':40,'dealName':'BNTM'},
      {'totalOutreach':90,'newFund':61,'respondOrNot':25,'dealName':'CAV'},
      {'totalOutreach':89,'newFund':39,'respondOrNot':18,'dealName':'PT'},
      {'totalOutreach':84,'newFund':55,'respondOrNot':13,'dealName':'Renibus'},
      {'totalOutreach':70,'newFund':35,'respondOrNot':25,'dealName':'SHCK'},
      {'totalOutreach':69,'newFund':33,'respondOrNot':18,'dealName':'Scioto'},
      {'totalOutreach':68,'newFund':44,'respondOrNot':9,'dealName':'UM'},
      {'totalOutreach':59,'newFund':29,'respondOrNot':3,'dealName':'NIT'},
      {'totalOutreach':54,'newFund':19,'respondOrNot':24,'dealName':'FAS'},
      {'totalOutreach':46,'newFund':20,'respondOrNot':14,'dealName':'Clarametyx'},
      {'totalOutreach':34,'newFund':24,'respondOrNot':5,'dealName':'EMB'},
      {'totalOutreach':19,'newFund':5,'respondOrNot':10,'dealName':'STA'},
      {'totalOutreach':19,'newFund':7,'respondOrNot':6,'dealName':'BE'},
      {'totalOutreach':14,'newFund':10,'respondOrNot':0,'dealName':'renibus'},
      {'totalOutreach':12,'newFund':2,'respondOrNot':7,'dealName':'REG'},
      {'totalOutreach':7,'newFund':1,'respondOrNot':2,'dealName':'COA'},
      {'totalOutreach':6,'newFund':4,'respondOrNot':1,'dealName':'CV'},
      {'totalOutreach':6,'newFund':4,'respondOrNot':1,'dealName':'Nema Life'},
      {'totalOutreach':1,'newFund':0,'respondOrNot':1,'dealName':'Cav'},
      {'totalOutreach':1,'newFund':1,'respondOrNot':0,'dealName':'Rem'}]

    // Check that each expected object is in the response
    expectedObjects.forEach((expectedObject) => {
      expect(res.body).toEqual(
        expect.arrayContaining([expect.objectContaining(expectedObject)]),
      )
    })

    // Additionally, check if the response only contains the expected number of objects
    expect(res.body.length).toEqual(expectedObjects.length)
  })

  it('GET /deals - verify aggregation calculation', async () => {
    const res = await request(app).get('/deals')
  
    expect(res.statusCode).toEqual(200)
  
    const expectedData = {
      dealName: 'PT',

      totalOutreach: 89, 
      newFund: 39, 
      respondOrNot: 18, 
    }
  
    const ptDeal = res.body.find(deal => deal.dealName === 'PT')
    expect(ptDeal).toMatchObject(expectedData)
  })
  
  it('GET /deals - verify sorting order', async () => {
    const res = await request(app).get('/deals')
  
    expect(res.statusCode).toEqual(200)
  
    let isSortedDescending = true
    for (let i = 0; i < res.body.length - 1; i++) {
      if (res.body[i].totalOutreach < res.body[i + 1].totalOutreach) {
        isSortedDescending = false
        break
      }
    }
  
    expect(isSortedDescending).toBe(true)
  })
  
  // Add more tests here for different scenarios, such as failure cases
})
