const express = require('express')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
var cors = require('cors')


const app = express()
const port = process.env.PORT || 5000

//midelwar
app.use(cors())
app.use(express.json())


const shopCategory = require('./data/shopCategory.json');



const uri = `mongodb+srv://${process.env.DB_NAME}:${process.env.DB_PASS}@mrn.gtqnz.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
 
    await client.connect();

    // Create a Toys Database and a collection 
    const toysCollection = client.db('ToyDB').collection('Toys');

    // Add a Toy in server side and Database 
    app.post("/toys", async (req, res) => {
      const newToy = req.body;
      console.log(newToy);
       const result = await toysCollection.insertOne(newToy);
      //  console.log(result);
      res.send(result);
    })

    // get all  Toys from database
    app.get('/toys', async (req, res) => {
      const corsor = toysCollection.find().limit(20);
      const result = await corsor.toArray();
      res.send(result)
    })

     // get toy by email 
     app.get('/toys', async (req, res) => {
      console.log(req.query.email);
      let query = {};
      if (req.query?.email) {
          query = { email: req.query.email }
      }
      const result = await toysCollection.find(query).toArray();
      res.send(result);
  })

    // get specific toy from database by id 
    app.get('/toys/:id', async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const query = { _id: new ObjectId(id) }
      // const options = {
      //   projection : {pictureURL : 1,toyName : 1,postedBy : 1,email : 1,price : 1,rating : 1,availableQuantity : 1,description : 1}
      // }
      const result = await toysCollection.findOne(query);
      res.send(result);
    })

    // get toy by search 
    app.get("/getToysByText/:text", async (req, res) => {
      const text = req.params.text;
      const result = await toysCollection
        .find({
          $or: [
            { toyName: { $regex: text, $options: "i" } },
            { subCategory: { $regex: text, $options: "i" } },
          ],
        })
        .toArray();
      res.send(result);
    });


    // delete specific toy from database by id  
    app.delete('/toys/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result =await toysCollection.deleteOne(query);
      res.send(result);
    })

       // Update a data
       app.put('/toys/:id', async(req, res) => {
        const id = req.params.id;
        const filter = { _id: new ObjectId(id) };
        const options = { upsert: true };
        const updatedToy = req.body;
        console.log(updatedToy);
  
        const toy = {
          $set: {
            price: updatedToy.price,
            availableQuantity: updatedToy.availableQuantity,
            description: updatedToy.description
          }
        }
        const result = await toysCollection.updateOne(filter, toy,options);
        res.send(result)
        console.log(result)
      })
  


    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send(shopCategory)
})


app.listen(port, () => {
  console.log(`Action-wrold app listening on port ${port}`)
})
