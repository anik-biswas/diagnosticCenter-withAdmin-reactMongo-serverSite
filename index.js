const express = require('express');
const app =express();
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion } = require('mongodb');
const port = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());
// app.use(cors({
//     origin: [
       
//         // 'https://findjob-a2605.web.app',
//         // 'https://findjob-a2605.firebaseapp.com'
    
//     ], 
//     methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
//   }));
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.265tqpu.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    const districtCollection = client.db('diagnosticCenterDB').collection('district');
    const bloodCollection = client.db('diagnosticCenterDB').collection('bloodGroup');
    const upazilaCollection = client.db('diagnosticCenterDB').collection('upazila');
    const userCollection = client.db('diagnosticCenterDB').collection('user');
    app.get('/district',async(req,res)=>{
        const cursor = districtCollection.find();
        const result = await cursor.toArray();
        res.send(result);
    })
    app.get('/bloodGroup',async(req,res)=>{
        const cursor = bloodCollection.find();
        const result = await cursor.toArray();
        res.send(result);
    })
    app.get('/upazila',async(req,res)=>{
        const cursor = upazilaCollection.find();
        const result = await cursor.toArray();
        res.send(result);
    })
    app.post('/user', async (req, res) => {
        const user = req.body;
        const query = {email:user.email};
        const exitUser = await userCollection.findOne(query);
        if(exitUser){
            return res.send({message:'user already exit',insertedId:null})
        }
        console.log(user);
        const result = await userCollection.insertOne(user);
        res.send(result);
    });
    app.get('/user', async (req, res) => {
        const cursor = userCollection.find();
        const users = await cursor.toArray();
        res.send(users);
    })
    app.get('/user/email', async (req, res) => {
        const { email } = req.query;

  try {
    const user = await userCollection.findOne({ email });

    if (user) {
      res.json([user]);
    } else {
      res.json([]); // User not found
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
    })

    // Send a ping to confirm a successful connection
   // await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
   // await client.close();
  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Diagnostic center DB')
  })
   
  app.listen(port, () => {
    console.log(`Diagnostic Port is ${port}`)
  })