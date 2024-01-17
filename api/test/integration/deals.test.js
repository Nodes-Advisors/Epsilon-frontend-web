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
    expect(res.headers['content-type']).toEqual(expect.stringContaining('json'))

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

  // Add more tests here for different scenarios, such as failure cases
})
