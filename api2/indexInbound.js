import express from 'express'
import { MongoClient } from 'mongodb'
import cors from 'cors'
import nodemailer from 'nodemailer'
import jwt from 'jsonwebtoken'
import schedule from 'node-schedule'
import expressWs from 'express-ws'

const app = express()
expressWs(app)

app.use(cors())
app.use(express.json())


const uri = 'mongodb+srv://Admin:NodesAdvisors2024@dev.jq8me.mongodb.net/'
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true })

const dbName = 'dev'
const InboundCollectionName = 'InboundEmails'

const transporter = nodemailer.createTransport({
  host: 'smtp-mail.outlook.com',
  port: 587,
  secure: false, // do not use SSL
  auth: {
    user: 'shaoyan.li@nodesadvisors.com',
    pass: 'HvpTi4@DL%fAAA7',
  },
})

async function connectToMongoDB() {
  try {
    await client.connect()
    console.log('Connected successfully to MongoDB')
  } catch (error) {
    console.error('Failed to connect to MongoDB', error)
    process.exit(1) // Exit in case of connection failure
  }
}

let connections = {}

app.get('/getUserByToken', async(req, res) => {
  try {
    const token = req.header('Authorization')
    if (!token) return res.status(400).send('Token does not exist')
    
    const database = client.db('dev')
    const collection = database.collection('NodesTeam')

    const verified = jwt.verify(token, 'YOUR_SECRET_KEY')
    const user = await collection.findOne({ email: verified.email })
    if (!user) return res.status(400).send('No user match this token')

    const email = verified.email

    await collection.updateOne(
      { email },
      {
        $set: {
          last_time_online: new Date(),
        },
      },
    )

    res.json({ email })
  } catch (error) {
    console.error('Error fetching user via token:', error)
    res.status(500).send('Error fetching user via token')
  }
})

app.post('/login', async (req, res) => {
  try {
    const database = client.db('dev')
    const collection = database.collection('NodesTeam')
    const { email, verificationCode } = req.body

    const user = await collection.findOne({ email })

    if (!user || user.isActive === false) {
      return res.status(404).send('User has not signed up!')
    }

    if (user.email.includes('nodesadvisors') && (user.isActive === undefined || user.isActive === false)) {
      return res.status(404).send('Your Nodes Email has not signed up!')
    }

    if (user.verificationCode !== verificationCode) {
      return res.status(403).send('Invalid verification code!')
    }

    await collection.updateOne(
      { email },
      {
        $set: {
          last_time_online: new Date(),
        },
      },
    )

    const expiration_date = Math.floor(Date.now() / 1000) + (60 * 60 * 24) // Current time in seconds + one hour
    const token = jwt.sign({ email: user.email, expiration_date }, 'YOUR_SECRET_KEY') // Replace 'YOUR_SECRET_KEY' with your actual secret key

    res.json({ token })
  } catch (error) {
    console.error('Error fetching data:', error)
    res.status(500).send('Error fetching data')
  } 
})

app.post('/signup', async (req, res) => {
  try {
    const database = client.db('dev')
    const collection = database.collection('NodesTeam')
    const { email, verificationCode, username } = req.body

    const user = await collection.findOne({ email })

    if (user && user.isActive) {
      return res.status(409).send('User already exists')
    }

    if (user.verificationCode !== verificationCode) {
      return res.status(403).send('Invalid verification code')
    }

    await collection.updateOne(
      { email },
      {
        $set: {
          isActive: true,
          username: username,
          last_time_online: new Date(),
        },
      },
    )

    const expiration_date = Math.floor(Date.now() / 1000) + (60 * 60 * 24) // Current time in seconds + one hour
    const token = jwt.sign({ email: user.email, expiration_date }, 'YOUR_SECRET_KEY') // Replace 'YOUR_SECRET_KEY' with your actual secret key

    res.json({ token })

  } catch (error) {
    console.error('Error fetching data:', error)
    res.status(500).send('Error fetching data')
  }
})

app.post('/sendVerificationCode', async (req, res) => {
  try {
    const database = client.db('dev')
    const collection = database.collection('NodesTeam')
    const { email } = req.body
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString()

    // Store the verification code in MongoDB
    await collection.updateOne(
      { email },
      {
        $set: {
          verificationCode: verificationCode,
        },
        $setOnInsert: {
          isActive: false,
        },
      },
      { upsert: true },
    )

    let date = new Date()
    date.setMinutes(date.getMinutes() + 5)
    schedule.scheduleJob(date, async function() {
      try {
        console.log('Deleting verification code')
        const database = client.db('dev')
        const collection = database.collection('NodesTeam')
        await collection.updateOne(
          { email },
          {
            $set: {
              verificationCode: null,
            },
          },
        )

      } catch (error) {
        console.error('Error updating data:', error)
      }
    })

    // Send the verification code via email
    let mailOptions = {
      from: 'shaoyan.li@nodesadvisors.com', // Replace with your email
      to: email,
      subject: 'Your verification code @ NodesAdvisors',
      text: 'Your verification code is: ' + verificationCode,
    }

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error)
        res.status(500).send('Error sending email')
      } else {
        console.log('Email sent: ' + info.response)
        res.status(200).send('Email sent')
      }
    })
  } catch (error) {
    console.error('Error fetching data:', error)
    res.status(500).send('Error fetching data')
  } 
})

app.post('/logout', async (req, res) => {
  try {
    const database = client.db('dev')
    const collection = database.collection('NodesTeam')
    const { email } = req.body
    await collection.updateOne(
      { email },
      {
        $set: {
          last_time_online: new Date(),
        },
      },
    )

    res.status(200).send('Logged out successfully!')
  } catch (error) {
    console.error('Error updating data:', error)
    res.status(500).send('Error updating data')
  } 
})

app.ws('/websocket/:email', function(ws, req) {
  // Store the WebSocket connection using the email as the key
  connections[req.params.email] = ws

  ws.on('message', async function(msg) {
    const messageObject = JSON.parse(msg)
    // console.log('messageObject', messageObject.type)
    if (messageObject.type === 'approval request') {
      const db = client.db(dbName)
      const collection = db.collection('NodesTeam')
    
      try {
        // Query the database to get the receiver's email
        if (messageObject.receiveName === 'all' || messageObject.receiveName === 'All' || messageObject.receiveName === 'ALL') {
          // pass the information to all the users
          const users = await collection.find({}).toArray()
          users.forEach(user => {
            const receiverWs = connections[user.email]
            if (receiverWs) {
              receiverWs.send(JSON.stringify(messageObject))
            } else {
              console.log('Receiver is offline')
            }
          })
        } else {
          const receiver = await collection.findOne({ name: messageObject.receiveName })
          const receiverEmail = receiver ? receiver.email : 'Unknown'
    
          // Add the receiver's email to the message object
          messageObject.receiverEmail = receiverEmail
    
          // Get the receiver's WebSocket connection and send the message
          const receiverWs = connections[receiverEmail]
          if (receiverWs) {
            receiverWs.send(JSON.stringify(messageObject))
          } else {
            console.log('Receiver is offline')
          }
        }
        
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    } 
    else if (messageObject.type === 'approval response') {

      const receiverEmail = messageObject.receiverEmail
      const receiverWs = connections[receiverEmail]
      if (receiverWs) {
        receiverWs.send(JSON.stringify(messageObject))
      }
    }
    else {
      console.log('Unknown message type')
    }
  })

})

// important one, to enable this please add authoriation to each request
app.use(verifyToken)



app.get('/getAllGPTPrompt', async (req, res) => {
  try {

    const database = client.db('dev')
    const collection = database.collection('GPTPrompts')
    const prompt = await collection.find({}).toArray()
    // console.log(prompt)
    res.json(prompt)
  } catch (error) {
    console.error('Error fetching data:', error)
    res.status(500).send('Error fetching data')
  }
})

app.get('/gethislog/:fundName', async (req, res) => {
  try {
    const database = client.db('dev')
    const collection = database.collection('HistoricalLogs')
    // console.log('fundName', req.params.fundName)
    const logs = await collection.find({ VC: req.params.fundName }).toArray()
    const clientCollection = database.collection('Clients')
    if (logs) {
      const updatedLogs = await Promise.all(logs.map(async (log) => {
        const client = await clientCollection.findOne({ acronym: { $regex: new RegExp(`^${log.Client}$`, 'i') } })
        
        if (client) {
          // console.log('client', client)
          log['current_stage'] = client.current_stage
          log['round_size'] = client.deal_size
        }
        return log
      }))
    
      updatedLogs.sort((a, b) => new Date(b.Date) - new Date(a.Date))
      res.json(updatedLogs)
    } else {
      res.status(404).send('Logs not found')
    }
    // res.json(logs);
  } catch (error) {
    console.error(error)
    res.status(500).send('Server error')
  }
})

app.get('/getclienthislog/:clientAcronym', async (req, res) => {
  try {
    const database = client.db('dev')
    const collection = database.collection('HistoricalLogs')
    // console.log('fundName', req.params.fundName)
    const logs = await collection.find({ Client: { $regex: new RegExp(`^${req.params.clientAcronym}$`, 'i') } }).toArray()
    const clientCollection = database.collection('FundCard2')
    if (logs) {
      const updatedLogs = await Promise.all(logs.map(async (log) => {
        const fund = await clientCollection.findOne({ Funds: { $regex: new RegExp(`^${log.VC}$`, 'i') } })
        
    
        return log
      }))
    
      updatedLogs.sort((a, b) => new Date(b.Date) - new Date(a.Date))
      res.json(updatedLogs)
    } else {
      res.status(404).send('Logs not found')
    }
    // res.json(logs);
  } catch (error) {
    console.error(error)
    res.status(500).send('Server error')
  }
})

app.get('/getrequest', async (req, res) => {
  try {
    const database = client.db('dev')
    const collection = database.collection('UsersFundRequests')
    const requests = await collection.find({}).toArray()
    res.json(requests)
  } catch (error) {
    console.error('Error fetching data:', error)
    res.status(500).send('Error fetching data')
  }
})

app.get('/', async (req, res) => {
  const { q } = req.query
  const keys = ['subject', 'sender', 'isInvestorEmail', 'isInterested', 'deckRequested', 'meetingRequested', 'proposalAccepted']

  const searchQuery = q ? {
    $or: keys.map(key => ({ [key]: new RegExp(q, 'i') })),
  } : {}

  try {
    const database = client.db(dbName)
    const inboundCollection = database.collection(InboundCollectionName)

    const inboundEmails = await inboundCollection.find(searchQuery).limit(100).toArray()
    res.json(inboundEmails)
  } catch (error) {
    console.error('Error fetching data:', error)
    res.status(500).send('Error fetching data')
  }
})


app.get('/employees', async (req, res) => {
  try {
    const database = client.db('dev')
    const collection = database.collection('Employees')
    const employees = await collection.find({}).toArray()
    res.json(employees)
  } catch (error) {
    console.error('Error fetching data:', error)
    res.status(500).send('Error fetching data')
  } 
})

app.get('/fundcard', async (req, res) => {
  try {
    const database = client.db('dev')
    const collection = database.collection('FundCard')
    const employees = await collection.find({}).toArray()
    res.json(employees)
  } catch (error) {
    console.error('Error fetching data:', error)
    res.status(500).send('Error fetching data')
  } 
})

app.get('/inboundemails', async (req, res) => {
  try {
    const database = client.db('dev')
    const collection = database.collection('InboundEmails')
    const employees = await collection.find({}).limit(500).toArray()
    res.json(employees)
  } catch (error) {
    console.error('Error fetching data:', error)
    res.status(500).send('Error fetching data')
  } 
})

app.get('/kpisInfo', async (req, res) => {
  try {
    const database = client.db('dev')
    const collection = database.collection('KPIsInfo')
    const employees = await collection.find({}).toArray()
    res.json(employees)
  } catch (error) {
    console.error('Error fetching data:', error)
    res.status(500).send('Error fetching data')
  } 
})

app.get('/outboundEmails', async (req, res) => {
  try {
    const database = client.db('dev')
    const collection = database.collection('OutboundEmails')
    const employees = await collection.find({}).limit(500).toArray()
    res.json(employees)
  } catch (error) {
    console.error('Error fetching data:', error)
    res.status(500).send('Error fetching data')
  } 
})

app.get('/getPendingRequests', async (req, res) => {
  try {
    const database = client.db('dev')
    const collection = database.collection('UsersFundRequests')
    const requests = await collection.find({
      'Status': 'Pending',
    }).toArray()
    res.json(requests)
  } catch (error) {
    console.error('Error fetching data:', error)
    res.status(500).send('Error fetching data')
  }
})

app.post('/sendRequest', async (req, res) => {
  try {
    const database = client.db('dev')
    const collection = database.collection('UsersFundRequests')
    const { 
      selectedFundName,
      requestName,
      approvers,
      deal,
      contactPerson,
      priority,
      details,
      email,
      requestId,
      time,
    } = req.body

    await collection.insertOne({
      'Type of Request': requestName,
      'Approvers or Assignees': approvers,
      'Type of Deal': deal,
      'Contact Person': contactPerson,
      'Priority': priority,
      'Additional details': details,
      'Created by': email,
      'Status': 'Pending',
      'Fund Name': selectedFundName,
      'Time': time,
      'RequestId': requestId,
    })

    res.status(200).send('Send request successfully!')
  } catch (error) {
    console.error('Error updating data:', error)
    res.status(500).send('Error updating data')
  } 
})

app.post('/approveRequest', async (req, res) => {
  try {
    const database = client.db('dev')
    const collection = database.collection('UsersFundRequests')
    const { requestId, time } = req.body

    await
    collection.updateOne(
      { 'RequestId': requestId, 'Time': time },
      {
        $set: {
          'Status': 'Accepted',
        },
      },
    )

    res.status(200).send('Reject request successfully!')
  } catch (error) {
    console.error('Error updating data:', error)
    res.status(500).send('Error updating data')
  }
})

app.post('/rejectRequest', async (req, res) => {
  try {
    const database = client.db('dev')
    const collection = database.collection('UsersFundRequests')
    const { requestId, time } = req.body

    await
    collection.updateOne(
      { 'RequestId': requestId, 'Time': time },
      {
        $set: {
          'Status': 'Rejected',
        },
      },
    )

    res.status(200).send('Reject request successfully!')
  } catch (error) {
    console.error('Error updating data:', error)
    res.status(500).send('Error updating data')
  }
})

app.get('/getUser', async (req, res) => {
  try {
    const database = client.db('dev')
    const collection = database.collection('NodesTeam')
    const email = req.query.email
    const name = req.query.name
    let user
    if (email !== 'undefined') {
      user = await collection.findOne({ email: email })
    } else if (name !== 'undefined') {
      // convert name from  xx-xx-xx to xx xx xx
      user = await collection.findOne({ name: { $regex: new RegExp(`^${name.replace(/-/g, ' ')}$`, 'i') } })
    } else {
      return res.status(400).send('Invalid request')
    }

    if (user) {
      res.status(200).json(user)
    } else {
      res.status(404).send('User not found')
    }
  } catch (error) {
    console.error('Error getting user:', error)
    res.status(500).send('Error getting user')
  } 
})

app.get('/getNodesProfileImage', async (req, res) => {
  try {
    const database = client.db('dev')
    const collection = database.collection('NodesTeam')
    // get all the profile images and names
    const nodes = await collection.find({}).toArray()
    const profileImages = nodes.map(node => ({ email: node.email, profile_image: node.profile_image, name: node.name }))
    // console.log(profileImages)
    res.json(profileImages)
  } catch (error) {
    console.error('Error fetching data:', error)
    res.status(500).send('Error fetching data')
  }
})

app.get('/fundStatus', async (req, res) => {
  try {
    const database = client.db('dev')
    const collection = database.collection('LPs')
    const fundStatus = await collection.find({}).toArray()
    res.json(fundStatus)
  } catch (error) {
    console.error('Error fetching data:', error)
    res.status(500).send('Error fetching data')
  }
})

app.get('/getAllClients', async (req, res) => {
  try {
    const database = client.db('dev')
    const collection = database.collection('Clients')
    const clients = await collection.find({}).toArray()
    res.json(clients)
  } catch (error) {
    console.error('Error fetching data:', error)
    res.status(500).send('Error fetching data')
  }},
)

app.get('/getClients', async (req, res) => {
  try {
    const database = client.db('dev')
    const collection = database.collection('Clients')
    const clients = await collection.find({}).toArray()
    const acronyms = clients.map(client => client.acronym)
    res.json(acronyms)
  } catch (error) {
    console.error('Error fetching data:', error)
    res.status(500).send('Error fetching data')
  }
})

app.get('/getAllFunds', async (req, res) => {
  try {
    const database = client.db('dev')
    const collection = database.collection('FundCard2')
    const funds = await collection.find({}).toArray()
    res.json(funds)
  } catch (error) {
    console.error('Error fetching data:', error)
    res.status(500).send('Error fetching data')
  }
})

app.get('/fundrisingpipeline', async (req, res) => {
  try {
    const page = parseInt(req.query.page)
    const limit = 50
    const skip = page ? (page - 1) * limit : 0

    const database = client.db('dev')
    const collection = database.collection('FundraisingPipeline')
    let infos

    if (page) {
      infos = await collection.find({})
        .sort({last_updated_status_date: -1})
        .skip(skip)
        .limit(limit)
        .toArray()
    } else {
      // console.log('no page')
      infos = await collection.find({})
        .sort({last_updated_status_date: -1})
        .toArray()
      // console.log(infos.map(info => info.last_updated_status_date))
    }

    res.json(infos)
  } catch (error) {
    console.error('Error fetching data:', error)
    res.status(500).send('Error fetching data')
  }
})

app.get('/savedcollections', async (req, res) => {
  try {
    const database = client.db('dev')
    const email = req.query.email
    if (!email) {
      return res.status(400).send('Invalid request')
    }
    const collection = database.collection('SavedCollections')
    const collections = await collection.find({email: email}).toArray()
    res.json(collections.map(collection => collection.savedcollection))
  } catch (error) {
    console.error('Error fetching data:', error)
    res.status(500).send('Error fetching data')
  }
})

app.post('/savedcollections/delete', async (req, res) => {
  try {
    const database = client.db('dev')
    const email = req.body.email
    const collectionName = req.body.collection
    if (!email || !collectionName) {
      return res.status(400).send('Invalid request')
    }
    const collection = database.collection('SavedCollections')
    const result = await collection.deleteOne({ email, savedcollection: collectionName })
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Collection does not exist' })
    }
    res.status(200).json({ message: 'Collection deleted successfully' })
  } catch (error) {
    console.error('Error deleting collection:', error)
    res.status(500).json({ message: 'Something went wrong with backend' })
  }
})

app.post('/savedcollections', async (req, res) => {
  try {
    const database = client.db('dev')
    const email = req.body.email
    const savedcollection = req.body.savedcollection
    
    if (!email || !savedcollection) {
      return res.status(400).send('Invalid request')
    }
    const collection = database.collection('SavedCollections')
    // Check for duplicates
    const existingDocument = await collection.findOne({ email, savedcollection })
    if (existingDocument && existingDocument.savedcollection) {
      res.status(409).send('Collection already exists!')
      return
    }
    // console.log(email, savedcollection)
    // Insert the email and savedcollection into the collection
    await collection.insertOne({ email, savedcollection })

    res.status(200).json({ message: 'You have created a new list successfully' })
  } catch (error) {
    console.error('Error inserting data:', error)
    res.status(500).json({ message: 'Something went wrong with backend' })
  }
})

app.get('/savedcollections/:collectionName', async (req, res) => {
  try {
    const database = client.db('dev')
    const email = req.query.email
    const collectionName = req.params.collectionName
    if (!email || !collectionName) {
      return res.status(400).send('Invalid request')
    }
    const collection = database.collection('SavedCollections')
    const savedcollection = await collection.findOne({ email, savedcollection: collectionName })
    if (!savedcollection) {
      return res.status(404).json({ message: 'Collection does not exist' })
    }
    // console.log(savedcollection)
    const funds = savedcollection.funds || []
    // get funds from FundCard2
    const fundCollection = database.collection('FundCard2')
    const fundDetails = await fundCollection.find({Funds: {$in: funds}}).toArray()
    // console.log(fundDetails)
    res.json(fundDetails)
  } catch (error) {
    console.error('Error fetching data:', error)
    res.status(500).send('Error fetching data')
  }
})

app.post('/savedcollections/deletefund', async (req, res) => {
  try {
    const database = client.db('dev')
    const email = req.body.email
    const collectionName = req.body.collection
    const fundName = req.body.fundName

    if (!email || !collectionName || !fundName) {
      return res.status(400).send('Invalid request')
    }
    const collection = database.collection('SavedCollections')

    // Check if the collection exists
    const existingCollection = await collection.findOne({ email, savedcollection: collectionName })
    if (!existingCollection) {
      return res.status(404).json({ message: 'Collection does not exist' })
    }
    // console.log(existingCollection)
    // Check if the fund exists in the collection
    if (!existingCollection.funds || !existingCollection.funds.includes(fundName)) {
      return res.status(404).send('Fund does not exist in the collection')
    }
    // console.log('Fund exists in collection')
    // Remove the fund from the collection
    await collection.updateOne({ email, savedcollection: collectionName }, { $pull: { funds: fundName } })
    // console.log('Fund deleted from collection successfully')
    res.status(200).json({ message: 'Fund deleted from collection successfully' })
  } catch (error) {
    console.error('Error deleting fund from collection:', error)
    res.status(500).json({ message: 'Something went wrong with backend' })
  }
})

app.post('/savedcollections/add', async (req, res) => {
  try {
    const database = client.db('dev')
    const email = req.body.email
    const collectionName = req.body.collection
    const fund = req.body.fund
    // console.log(email, collectionName, fund)
    if (!email || !collectionName || !fund) {
      return res.status(400).send('Invalid request')
    }
    const collection = database.collection('SavedCollections')

    // Check if the collection exists
    const existingCollection = await collection.findOne({ email, savedcollection: collectionName })
    if (!existingCollection) {
      return res.status(404).json({ message: 'Collection does not exist' })
    }

    // Check if the fund already exists in the collection
    if (existingCollection.funds && existingCollection.funds.includes(fund)) {
      return res.status(409).send('Fund already exists in the collection')
    }

    // Add the fund to the collection
    await collection.updateOne({ email, savedcollection: collectionName }, { $push: { funds: fund } })

    res.status(200).json({ message: 'Fund added to collection successfully' })
  } catch (error) {
    console.error('Error adding fund to collection:', error)
    res.status(500).json({ message: 'Something went wrong with backend' })
  }
})

app.get('/verifyToken', verifyToken, (req, res) => {
  res.status(200).send('Token is valid and not expired')
})

async function verifyToken(req, res, next) {
  // console.log(req.headers)
  const token = req.header('Authorization')
  if (!token) return res.status(401).send('Access Denied')

  try {
    const verified = jwt.verify(token, 'YOUR_SECRET_KEY')
    if (verified.expiration_date < (Date.now() / 1000)) {
      return res.status(403).send('Token has expired')
    }
    
    const database = client.db('dev')
    const collection = database.collection('NodesTeam')
    const user = await collection.findOne({ email: verified.email })
    
    // Check if the email in the request body matches the email of the user
    if (verified.email !== user.email) {
      return res.status(403).send('Invalid request')
    }
    next()
  } catch (err) {
    res.status(400).send('Invalid Token')
  }
}

// get all collections name from dev database
app.get('/getCollections', async (req, res) => {
  try {
    const database = client.db('dev')
    const collections = (await database.listCollections().toArray()).map(collection => collection.name)
    res.json(collections)
  } catch (error) {
    console.error('Error fetching data:', error)
    res.status(500).send('Error fetching data')
  }
})

app.get('/getCollections/:collectionName', async (req, res) => {
  try {
    const database = client.db('dev')
    const collectionName = req.params.collectionName
    const collection = database.collection(collectionName)

    const page = parseInt(req.query.page) || 1
    const pageSize = parseInt(req.query.pageSize) || 500

    // Parse filters from query parameters
    const filters = req.query.filters || Object.keys(filters).length > 0 ? JSON.parse(req.query.filters) : {}
    // console.log("filters", filters);
    // console.log("page", page);
    // if (Object.keys(filters).length === 0) {
    
    // }
    
    const documents = await collection.find(filters)
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .toArray()
    // console.log(documents)
    res.json(documents)
  } catch (error) {
    console.error('Error fetching data:', error)
    res.status(500).send('Error fetching data')
  }
})

app.get('/getUniqueValues/:collectionName/:fieldName', async (req, res) => {
  try {
    const database = client.db('dev')
    const collectionName = req.params.collectionName
    const fieldName = req.params.fieldName
    const collection = database.collection(collectionName)

    const uniqueValues = await collection.distinct(fieldName)
    res.json(uniqueValues)
  } catch (error) {
    console.error('Error fetching data:', error)
    res.status(500).send('Error fetching data')
  }
})

app.get('/getFields/:collectionName', async (req, res) => {
  try {
    const database = client.db('dev')
    const collectionName = req.params.collectionName
    const collection = database.collection(collectionName)

    const document = await collection.findOne({})
    const fields = document ? Object.keys(document) : []
    // console.log(fields);
    res.json(fields)
  } catch (error) {
    console.error('Error fetching data:', error)
    res.status(500).send('Error fetching data')
  }
})

app.listen(5001, async () => {
  console.log('API is working!')
  await connectToMongoDB()
})

process.on('SIGINT', async () => {
  await client.close()
  console.log('MongoDB disconnected on app termination')
  process.exit(0)
})

