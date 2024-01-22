/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-undef */
// test/integration/accountHolders.test.js
import request from 'supertest'
import app from '../../src/app.js' // Update the import path according to your project structure

describe('Integration tests for /account-holders endpoint', () => {
  it('GET /account-holders - success', async () => {
    // Start the test server
    const res = await request(app).get('/account-holders')

    // Check the HTTP status code
    expect(res.statusCode).toEqual(200)

    // Check the Content-Type header
    expect(res.headers['content-type']).toEqual(expect.stringContaining('json'))

    // Ensure the response is an array
    expect(Array.isArray(res.body)).toBe(true)

    // Optionally check the structure of the response objects
    if (res.body.length > 0) {
      expect(res.body[0]).toHaveProperty('accountHolder')
      expect(res.body[0]).toHaveProperty('totalOutreach')
      expect(res.body[0]).toHaveProperty('newFund')
      expect(res.body[0]).toHaveProperty('respondOrNot')
      expect(res.body[0]).toHaveProperty('newRespond')
    }
  })

  it('GET /account-holders - verify aggregation and sorting', async () => {
    const res = await request(app).get('/account-holders')

    expect(res.statusCode).toEqual(200)

    const expectedData = [
      {
        accountHolder: 'Eliott',
        totalOutreach: 521,
        newFund: 365,
        respondOrNot: 90,
        newRespond: 43,
      },
    ]

    // Check that each expected data object is in the response
    expectedData.forEach((data) => {
      expect(res.body).toEqual(
        expect.arrayContaining([expect.objectContaining(data)]),
      )
    })

    // Verify the sorting order
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
