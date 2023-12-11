'use strict'

const fs = require('fs')

process.stdin.resume()
process.stdin.setEncoding('utf-8')

let inputString = ''
let currentLine = 0

process.stdin.on('data', function(inputStdin) {
  inputString += inputStdin
})

process.stdin.on('end', function() {
  inputString = inputString.split('\n')

  main()
})

function readLine() {
  return inputString[currentLine++]
}


/*
 * Complete the 'getCacheSize' function below.
 *
 * The function is expected to return an INTEGER_ARRAY.
 * The function accepts following parameters:
 *  1. 2D_INTEGER_ARRAY data
 *  2. INTEGER_ARRAY queries
 */

function getCacheSize(data, queries) {
  // Write your code here

  data.sort((a, b) => a[0] - b[0])

  let res = []
  for (let i = 0; i < queries.length; i++) {
    let count = 0
    let laststatus = 'in'
    for (let j = 0; j < data.length; j++) {
      if (laststatus === 'bigger') {
        if (data[j][1] > data[j-1][1]) continue
      }
      if (queries[i] < data[j][0]) { laststatus='bigger' ;continue }
      if (queries[i] > data[j][0] + data[j][1]) { laststatus='smaller' ;continue }
      count++
      laststatus = 'in'
    }
    res.push(count)
  }
        
  return res
}
function main() {
  const ws = fs.createWriteStream(process.env.OUTPUT_PATH)

  const dataRows = parseInt(readLine().trim(), 10)

  const dataColumns = parseInt(readLine().trim(), 10)

  let data = Array(dataRows)

  for (let i = 0; i < dataRows; i++) {
    data[i] = readLine().replace(/\s+$/g, '').split(' ').map(dataTemp => parseInt(dataTemp, 10))
  }

  const queriesCount = parseInt(readLine().trim(), 10)

  let queries = []

  for (let i = 0; i < queriesCount; i++) {
    const queriesItem = parseInt(readLine().trim(), 10)
    queries.push(queriesItem)
  }

  const result = getCacheSize(data, queries)

  ws.write(result.join('\n') + '\n')

  ws.end()
}
