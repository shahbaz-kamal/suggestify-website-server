const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;
require("dotenv").config();
const { MongoClient, ServerApiVersion } = require("mongodb");

// cors
const corsOption = {
  origin: ["http://localhost:5173"],
  credentials: true,
  optionalSUccessStatus: 200,
};
app.use(cors(corsOption));
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Suggestion is falling from the sky");
});

// mongodb connection

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.jxshq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
    // *declaring collections
    const queryCollections = client
      .db("suggestify-db")
      .collection("query-collection");
    // *getting all query

    app.get("/all-query", async (req, res) => {
      const result = await queryCollections.find().toArray();
      res.send(result);
    });

    //*adding query to db

    app.post("/add-query", async (req, res) => {
      const newQuery = req.body;
      const result = await queryCollections.insertOne(newQuery);
      res.send(result);
    });
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`Suggestify website is running on port ${port}`);
});
