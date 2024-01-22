/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-undef */
// test/integration/totalOutreach.test.js
import request from 'supertest'
import app from '../../src/app.js' // Update the import path according to your project structure

describe('Integration tests for /total-outreach-per-account-holder endpoint', () => {
  it('GET /total-outreach-per-account-holder - success', async () => {
    // Start the test server
    const res = await request(app).get('/total-outreach-per-account-holder')

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
      expect(res.body[0]).toHaveProperty('accountHolder')
      expect(res.body[0]).toHaveProperty('totalOutreach')
    }
  })

  it('GET /total-outreach-per-account-holder - verify aggregation and sorting', async () => {
    const res = await request(app).get('/total-outreach-per-account-holder')

    expect(res.statusCode).toEqual(200)

    const expectedData = [
      {'accountHolder': 'Jesse', 'totalOutreach': 699}, 
      {'accountHolder': 'Iman', 'totalOutreach': 638}, 
      {'accountHolder': 'Eliott', 'totalOutreach': 521}, 
      {'accountHolder': 'Tyler', 'totalOutreach': 492}, 
      {'accountHolder': 'Abhishek', 'totalOutreach': 129},
    ]

    // Check that each expected data object is in the response
    expectedData.forEach((data) => {
      expect(res.body).toEqual(
        expect.arrayContaining([expect.objectContaining(data)]),
      )
    })

    // Check if the response only contains the expected number of objects
    expect(res.body.length).toEqual(expectedData.length)

    // Verify the sorting order is descending by totalOutreach
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
