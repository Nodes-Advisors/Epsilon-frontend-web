import express from 'express'
import cors from 'cors'
import dealsRouter from './routes/deals.js'
import accountHoldersRouter from './routes/accountHolders.js'
import monthlyTotalsRouter from './routes/monthlyTotals.js'
import totalOutreachRouter from './routes/totalOutreach.js'
import accountHolderKpisRouter from './routes/accountHolderKpis.js'
import client from './db/client.js'

const app = express()

app.use(cors())
app.use(express.json())

app.use(dealsRouter)
app.use(accountHoldersRouter)
app.use(monthlyTotalsRouter)
app.use(totalOutreachRouter)
app.use(accountHolderKpisRouter)

// Start the MongoDB client connection
client.connect()

export default app
