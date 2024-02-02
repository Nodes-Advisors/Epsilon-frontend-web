import express from 'express';
import { MongoClient } from 'mongodb';
import cors from 'cors';
import nodemailer from 'nodemailer';
import jwt from 'jsonwebtoken';
import schedule from 'node-schedule';

const app = express();
app.use(cors());
app.use(express.json());

const uri = "mongodb+srv://Admin:NodesAdvisors2024@dev.jq8me.mongodb.net/";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

const dbName = 'dev';
const InboundCollectionName = 'InboundEmails';

const transporter = nodemailer.createTransport({
  host: 'smtp-mail.outlook.com',
  port: 587,
  secure: false, // do not use SSL
  auth: {
    user: 'shaoyan.li@nodesadvisors.com',
    pass: 'HvpTi4@DL%fAAA7'
  }
});

async function connectToMongoDB() {
  try {
    await client.connect();
    console.log('Connected successfully to MongoDB');
  } catch (error) {
    console.error('Failed to connect to MongoDB', error);
    process.exit(1); // Exit in case of connection failure
  }
}

app.post('/login', async (req, res) => {
  try {
    const database = client.db('dev');
    const collection = database.collection('NodesTeam');
    const { email, verificationCode } = req.body;

    const user = await collection.findOne({ email });

    if (!user || user.isActive === false) {
      return res.status(404).send('User has not signed up!');
    }

    if (user.email.includes('nodesadvisors') && (user.isActive === undefined || user.isActive === false)) {
      return res.status(404).send('Your Nodes Email has not signed up!');
    }

    if (user.verificationCode !== verificationCode) {
      return res.status(403).send('Invalid verification code!');
    }

    await collection.updateOne(
      { email },
      {
        $set: {
          last_time_online: new Date(),
        },
      }
    );

    const expiration_date = Math.floor(Date.now() / 1000) + (60 * 1); // Current time in seconds + one hour
    const token = jwt.sign({ email: user.email, expiration_date }, 'YOUR_SECRET_KEY'); // Replace 'YOUR_SECRET_KEY' with your actual secret key

    res.json({ token });
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).send('Error fetching data');
  } 
});

app.post('/signup', async (req, res) => {
  try {
    const database = client.db('dev');
    const collection = database.collection('NodesTeam');
    const { email, verificationCode, username } = req.body;

    const user = await collection.findOne({ email });

    if (user && user.isActive) {
      return res.status(409).send('User already exists');
    }

    if (user.verificationCode !== verificationCode) {
      return res.status(403).send('Invalid verification code');
    }

    await collection.updateOne(
      { email },
      {
        $set: {
          isActive: true,
          username: username,
          last_time_online: new Date(),
        },
      }
    );

    const expiration_date = Math.floor(Date.now() / 1000) + (60 * 60 * 24); // Current time in seconds + one hour
    const token = jwt.sign({ email: user.email, expiration_date }, 'YOUR_SECRET_KEY'); // Replace 'YOUR_SECRET_KEY' with your actual secret key

    res.json({ token });

  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).send('Error fetching data');
  }
});

app.post('/sendVerificationCode', async (req, res) => {
  try {
    const database = client.db('dev');
    const collection = database.collection('NodesTeam');
    const { email } = req.body;
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

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
      { upsert: true }
    );

    let date = new Date();
    date.setMinutes(date.getMinutes() + 5);
    schedule.scheduleJob(date, async function() {
      try {
        console.log('Deleting verification code');
        const database = client.db('dev');
        const collection = database.collection('NodesTeam');
        await collection.updateOne(
          { email },
          {
            $set: {
              verificationCode: null,
            },
          }
        );

    } catch (error) {
      console.error('Error updating data:', error);
    }
    });

    // Send the verification code via email
    let mailOptions = {
      from: 'shaoyan.li@nodesadvisors.com', // Replace with your email
      to: email,
      subject: 'Your verification code @ NodesAdvisors',
      text: 'Your verification code is: ' + verificationCode
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
        res.status(500).send('Error sending email');
      } else {
        console.log('Email sent: ' + info.response);
        res.status(200).send('Email sent');
      }
    });
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).send('Error fetching data');
  } 
});

app.post('/logout', async (req, res) => {
  try {
    const database = client.db('dev');
    const collection = database.collection('NodesTeam');
    const { email } = req.body;
    await collection.updateOne(
      { email },
      {
        $set: {
          last_time_online: new Date(),
        },
      }
    );

    res.status(200).send('Logged out successfully!');
  } catch (error) {
    console.error('Error updating data:', error);
    res.status(500).send('Error updating data');
  } 
});

// important one
// app.use(verifyToken);

app.get('/', async (req, res) => {
  const { q } = req.query;
  const keys = ['subject', 'sender', 'isInvestorEmail', 'isInterested', 'deckRequested', 'meetingRequested', 'proposalAccepted'];

  const searchQuery = q ? {
    $or: keys.map(key => ({ [key]: new RegExp(q, 'i') }))
  } : {};

  try {
    const database = client.db(dbName);
    const inboundCollection = database.collection(InboundCollectionName);

    const inboundEmails = await inboundCollection.find(searchQuery).limit(100).toArray();
    res.json(inboundEmails);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).send('Error fetching data');
  }
});


app.get('/employees', async (req, res) => {
  try {
    const database = client.db('dev');
    const collection = database.collection('Employees');
    const employees = await collection.find({}).toArray();
    res.json(employees);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).send('Error fetching data');
  } 
});

app.get('/fundcard', async (req, res) => {
  try {
    const database = client.db('dev');
    const collection = database.collection('FundCard');
    const employees = await collection.find({}).toArray();
    res.json(employees);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).send('Error fetching data');
  } 
});

app.get('/inboundemails', async (req, res) => {
  try {
    const database = client.db('dev');
    const collection = database.collection('InboundEmails');
    const employees = await collection.find({}).limit(500).toArray();
    res.json(employees);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).send('Error fetching data');
  } 
});

app.get('/kpisInfo', async (req, res) => {
  try {
    const database = client.db('dev');
    const collection = database.collection('KPIsInfo');
    const employees = await collection.find({}).toArray();
    res.json(employees);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).send('Error fetching data');
  } 
});

app.get('/outboundEmails', async (req, res) => {
  try {
    const database = client.db('dev');
    const collection = database.collection('OutboundEmails');
    const employees = await collection.find({}).limit(500).toArray();
    res.json(employees);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).send('Error fetching data');
  } 
});

app.get('/getPendingRequests', async (req, res) => {
  try {
    const database = client.db('dev');
    const collection = database.collection('UsersFundRequests');
    const requests = await collection.find({
      'Status': 'Pending'
    }).toArray();
    res.json(requests);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).send('Error fetching data');
  }
});

app.post('/sendRequest', async (req, res) => {
  try {
    const database = client.db('dev');
    const collection = database.collection('UsersFundRequests');
    const { 
      selectedFundName,
      requestName,
      approvers,
      deal,
      contactPerson,
      priority,
      details,
      email
    } = req.body;

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
    });

    res.status(200).send('Send request successfully!');
  } catch (error) {
    console.error('Error updating data:', error);
    res.status(500).send('Error updating data');
  } 
});

app.get('/getUser', async (req, res) => {
  try {
    const database = client.db('dev');
    const collection = database.collection('NodesTeam');
    const email = req.query.email;

    const user = await collection.findOne({ email: email });

    if (user) {
      res.status(200).json(user);
    } else {
      res.status(404).send('User not found');
    }
  } catch (error) {
    console.error('Error getting user:', error);
    res.status(500).send('Error getting user');
  } 
});


app.get('/fundStatus', async (req, res) => {
  try {
    const database = client.db('dev');
    const collection = database.collection('LPs');
    const fundStatus = await collection.find({}).toArray();
    res.json(fundStatus);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).send('Error fetching data');
  }
});


app.get('/getClients', async (req, res) => {
  try {
    const database = client.db('dev');
    const collection = database.collection('Clients');
    const clients = await collection.find({}).toArray();
    const acronyms = clients.map(client => client.acronym);
    res.json(acronyms);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).send('Error fetching data');
  }
});

app.get('/getAllFunds', async (req, res) => {
  try {
    const database = client.db('dev');
    const collection = database.collection('FundCard2');
    const funds = await collection.find({}).toArray();
    res.json(funds);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).send('Error fetching data');
  }
});

app.get('/fundrisingpipeline', async (req, res) => {
  try {
    const database = client.db('dev');
    const collection = database.collection('FundraisingPipeline');
    const infos = await collection.find({}).sort({last_updated_status_date: -1}).toArray();
  
    res.json(infos);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).send('Error fetching data');
  }
});

app.get('/verifyToken', verifyToken, (req, res) => {
  res.status(200).send('Token is valid and not expired');
});

async function verifyToken(req, res, next) {
  const token = req.header('Authorization');
  if (!token) return res.status(401).send('Access Denied');

  try {
    const verified = jwt.verify(token, 'YOUR_SECRET_KEY');
    if (verified.expiration_date < (Date.now() / 1000)) {
      return res.status(403).send('Token has expired');
    }
    
    const database = client.db('dev');
    const collection = database.collection('NodesTeam');
    const user = await collection.findOne({ email: verified.email });
    
    // Check if the email in the request body matches the email of the user
    if (verified.email !== user.email) {
      return res.status(403).send('Invalid request');
    }
    next();
  } catch (err) {
    res.status(400).send('Invalid Token');
  }
}

// get all collections name from dev database
app.get('/getCollections', async (req, res) => {
  try {
    const database = client.db('dev');
    const collections = (await database.listCollections().toArray()).map(collection => collection.name);
    res.json(collections);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).send('Error fetching data');
  }
});

app.get('/getCollections/:collectionName', async (req, res) => {
  try {
    const database = client.db('dev');
    const collectionName = req.params.collectionName;
    const collection = database.collection(collectionName);

    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 500;

    // Parse filters from query parameters
    const filters = req.query.filters || Object.keys(filters).length > 0 ? JSON.parse(req.query.filters) : {};
    // console.log("filters", filters);
    // console.log("page", page);
    // if (Object.keys(filters).length === 0) {
    
    // }
    
    const documents = await collection.find(filters)
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .toArray();
    // console.log(documents)
    res.json(documents);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).send('Error fetching data');
  }
});

app.get('/getUniqueValues/:collectionName/:fieldName', async (req, res) => {
  try {
    const database = client.db('dev');
    const collectionName = req.params.collectionName;
    const fieldName = req.params.fieldName;
    const collection = database.collection(collectionName);

    const uniqueValues = await collection.distinct(fieldName);
    res.json(uniqueValues);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).send('Error fetching data');
  }
});

app.get('/getFields/:collectionName', async (req, res) => {
  try {
    const database = client.db('dev');
    const collectionName = req.params.collectionName;
    const collection = database.collection(collectionName);

    const document = await collection.findOne({});
    const fields = document ? Object.keys(document) : [];
    // console.log(fields);
    res.json(fields);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).send('Error fetching data');
  }
});

app.listen(5001, async () => {
  console.log('API is working!');
  await connectToMongoDB();
});

process.on('SIGINT', async () => {
  await client.close();
  console.log('MongoDB disconnected on app termination');
  process.exit(0);
});

