const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const port = process.env.port || 5000;

//middleware
app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.tbmpk5j.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
   client.connect();

    const toysCollection = client.db("toysDB").collection("toys");

    //toys details
    app.get("/toysdetails", async (req, res) => {
      const result = await toysCollection.find().limit(20).toArray();
      res.send(result);
    });
    app.get("/toysdetails/:id", async (req, res) => {
      const result = await toysCollection.findOne({
        _id: new ObjectId(req.params.id),
      });
      res.send(result);
    });

    app.get("/toydetails/:text", async (req, res) => {
      if (
        req.params.text == "Musical Instruments" ||
        req.params.text == "Educational Toys" ||
        req.params.text == "Music Accessories"
      ) {
        const result = await toysCollection
          .find({
            sub_category: req.params.text,
          })
          .sort({ createdAt: -1 }).limit(10)
          .toArray();
        return res.send(result);
      }
      const result = await toysCollection
        .find()
        .sort({ createdAt: -1 }).limit(10)
        .toArray();
      res.send(result);
      console.log(req.params.text);
      return;
    });

    //add toys
    app.get("/addedtoys/:email", async (req, res) => {
      const result = await toysCollection
        .find({ seller_email: req.params.email })
        .sort()
        .toArray();
      res.send(result);
    });
   

    app.post("/addedtoys", async (req, res) => {
      req.body.createdAt = new Date();
      if (!req.body) {
        return res.status(404).send({ message: "body data not found" });
      }
      const result = await toysCollection.insertOne(req.body);
      res.send(result);
      console.log(result);
    });

    app.get("/addtoys/:id", async (req, res) => {
      const result = await toysCollection.findOne({
        _id: new ObjectId(req.params.id),
      });
      res.send(result);
    });

    app.put("/addtoys/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedToys = {
        $set: {
          quantity: req.body.quantity,
          price: req.body.price,
          description:req.body.description,
        },
      };
      const result = await toysCollection.updateOne(filter, updatedToys);
      res.send(result);
    });

    app.delete("/addedtoys/:id", async (req, res) => {
      const result = await toysCollection.deleteOne({
        _id: new ObjectId(req.params.id),
      });
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Kids Play Musical DB is running");
});

app.listen(port, () => {
  console.log(`Kids Play Musical is running on port: ${port}`);
});
