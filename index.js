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

    app.get('/district',async(req,res)=>{
        const cursor = districtCollection.find();
        const result = await cursor.toArray();
        res.send(result);
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