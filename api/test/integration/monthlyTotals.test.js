/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-undef */
// test/integration/monthlyTotals.test.js
import request from 'supertest'
import app from '../../src/app.js' // Update the import path according to your project structure

describe('Integration tests for /monthly-totals endpoint', () => {
  it('GET /monthly-totals - success', async () => {
    // Start the test server
    const res = await request(app).get('/monthly-totals')

    // Check the HTTP status code
    expect(res.statusCode).toEqual(200)

    // Check the Content-Type header
    expect(res.headers['content-type']).toEqual(expect.stringContaining('json'))

    // Ensure the response is an array
    expect(Array.isArray(res.body)).toBe(true)

    // Optionally check the structure of the response objects
    if (res.body.length > 0) {
      expect(res.body[0]).toHaveProperty('month')
      expect(res.body[0]).toHaveProperty('year')
      expect(res.body[0]).toHaveProperty('totalOutreach')
      expect(res.body[0]).toHaveProperty('totalNewFund')
      expect(res.body[0]).toHaveProperty('totalResponse')
    }
  })

  it('GET /monthly-totals - verify aggregation and sorting', async () => {
    const res = await request(app).get('/monthly-totals')

    expect(res.statusCode).toEqual(200)

    const expectedData = [
      {'month': 'Dec', 'totalNewFund': 11, 'totalOutreach': 41, 'totalResponse': 13, 'year': 2022}, {'month': 'Nov', 'totalNewFund': 94, 'totalOutreach': 172, 'totalResponse': 40, 'year': 2022}, {'month': 'Oct', 'totalNewFund': 1, 'totalOutreach': 1, 'totalResponse': 1, 'year': 2022}, {'month': 'Apr', 'totalNewFund': 190, 'totalOutreach': 312, 'totalResponse': 74, 'year': 2023}, {'month': 'Aug', 'totalNewFund': 15, 'totalOutreach': 26, 'totalResponse': 14, 'year': 2023}, {'month': 'Dec', 'totalNewFund': 59, 'totalOutreach': 86, 'totalResponse': 8, 'year': 2023}, {'month': 'Feb', 'totalNewFund': 70, 'totalOutreach': 145, 'totalResponse': 57, 'year': 2023}, {'month': 'Jan', 'totalNewFund': 34, 'totalOutreach': 72, 'totalResponse': 11, 'year': 2023}, {'month': 'Jul', 'totalNewFund': 30, 'totalOutreach': 70, 'totalResponse': 19, 'year': 2023}, {'month': 'Jun', 'totalNewFund': 103, 'totalOutreach': 192, 'totalResponse': 41, 'year': 2023},
    ]

    expectedData.forEach((data) => {
      expect(res.body).toEqual(
        expect.arrayContaining([expect.objectContaining(data)]),
      )
    })

    // Verify the sorting order by year then month
    let isSortedCorrectly = true
    for (let i = 0; i < res.body.length - 1; i++) {
      if (res.body[i].year > res.body[i + 1].year || 
         (res.body[i].year === res.body[i + 1].year && res.body[i].month > res.body[i + 1].month)) {
        isSortedCorrectly = false
        break
      }
    }
    expect(isSortedCorrectly).toBe(true)
  })

  // Add more tests here for different scenarios, such as failure cases
})
