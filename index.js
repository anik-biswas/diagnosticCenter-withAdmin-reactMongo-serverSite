const express = require('express');
const app =express();
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());
app.use(cors({
    // origin: [
       
    //     // 'https://findjob-a2605.web.app',
    //     // 'https://findjob-a2605.firebaseapp.com'
    
    // ], 
    // methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: ['Authorization', 'Content-Type'],
  }));
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
    const bannerCollection = client.db('diagnosticCenterDB').collection('banner');
    const testCollection = client.db('diagnosticCenterDB').collection('test');
    app.post('/jwt', async (req, res) => {
        const user = req.body;

        const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
        res.send({ token });
      })
    //   const verifyToken = (req, res, next) => {
    //     console.log('inside verify token', req.headers.authorization);
        // if (!req.headers.authorization) {
        //   return res.status(401).send({ message: 'unauthorized access' });
        // }
        // const token = req.headers.authorization.split(' ')[1];
        // jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        //   if (err) {
        //     return res.status(401).send({ message: 'unauthorized access' })
        //   }
        //   req.decoded = decoded;
        //   next();
        // })
    //     next();
    //   }

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
    app.post('/dashboard/addBanner', async (req, res) => {
        
        const banner = req.body;
        console.log(banner);
        const result = await bannerCollection.insertOne(banner);
        res.send(result);
    });
    app.post('/dashboard/addTest', async (req, res) => {
        
        const test = req.body;
        console.log(test);
        const result = await testCollection.insertOne(test);
        res.send(result);
    });
    app.get('/user', async (req, res) => {
    //     console.log('Request Headers:', req.headers);
        const authHeader = req.headers;
        console.log('Authorization Header:', authHeader);
        const cursor = userCollection.find();
        const users = await cursor.toArray();
        res.send(users);
    })
    app.get('/dashboard/banner', async (req, res) => {
            const cursor = bannerCollection.find();
            const banners = await cursor.toArray();
            res.send(banners);
        })
    // app.get('/user', async (req, res) => {
    //     const authHeader = req.headers['authorization'];
    //     console.log(authHeader)
    //     // Check if the Authorization header exists
    //     if (!authHeader) {
    //         return res.status(401).json({ message: 'Unauthorized access - Missing Authorization header' });
    //     }
    
    //     // Extract the token from the Authorization header
    //     const token = authHeader.split(' ')[1];
    
    //     try {
    //         // Verify the token
    //         const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    
    //         // The decoded variable now contains the payload of the token
    //         // You can access user information from decoded
    
    //         const cursor = userCollection.find();
    //         const users = await cursor.toArray();
    //         res.send(users);
    //     } catch (error) {
    //         console.error(error);
    //         res.status(401).json({ message: 'Unauthorized access - Invalid token' });
    //     }
    // });

    app.patch('/user/admin/:id',  async (req, res) => {
        const id = req.params.id;
        const filter = { _id: new ObjectId(id) };
        const updatedDoc = {
          $set: {
            role: 'admin'
          }
        }
        const result = await userCollection.updateOne(filter, updatedDoc);
        res.send(result);
      })
      app.get('/user/admin/:id', async (req, res) => {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) }
        const result = await userCollection.findOne(query);
        res.send(result);
    })

    app.delete('/user/:id', async (req, res) => {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await userCollection.deleteOne(query);
        res.send(result);
    })
    app.delete('/dashboard/banner/:id', async (req, res) => {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await bannerCollection.deleteOne(query);
        res.send(result);
    })
    app.patch('/dashboard/banner/toggle-active/:id', async (req, res) => {
        const bannerId = req.params.id;
        const { isActive } = req.body;
      
        try {
            await bannerCollection.updateMany({}, { $set: { isActive: false } });
          const result = await bannerCollection.updateOne(
            { _id: new  ObjectId(bannerId) },
            { $set: { isActive } }
          );
      
          if (result.modifiedCount > 0) {
            res.json({ success: true });
          } else {
            res.json({ success: false, error: 'Banner not found or not updated.' });
          }
        } catch (error) {
          console.error('Error toggling isActive status:', error);
          res.status(500).json({ success: false, error: 'Internal Server Error' });
        }
      });
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