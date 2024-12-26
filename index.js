const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

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
    const recommendationCollection = client
      .db("suggestify-db")
      .collection("recommendation-collection");
    // *getting all query

    app.get("/all-queries", async (req, res) => {
      const result = await queryCollections.find().toArray();
      res.send(result);
    });

    //  *handling search functionality

    app.get("/queries-for-all-query-page", async (req, res) => {
      const search = req.query.search;

      const query = {
        productName: { $regex: search, $options: "i" },
      };
      const result = await queryCollections.find(query).toArray();
      res.send(result);
      console.log(search);
    });

    // *get query for a spesific ID for query details page

    app.get("/query-details/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await queryCollections.find(query).toArray();
      res.send(result);
    });
    // *get query for a spesific ID for updating query

    app.get("/update-query", async (req, res) => {
      const id = req.query.id;
      const query = { _id: new ObjectId(id) };
      const result = await queryCollections.find(query).toArray();
      res.send(result);
    });

    // *get query for a specific email for my query page

    app.get("/my-queries/:email", async (req, res) => {
      const email = req.params.email;
      const query = { questionerEmail: email };
      const result = await queryCollections.find(query).toArray();
      res.send(result);
    });

    // *get recommendations for a specific query id for a specific query for querydetails page

    app.get("/recommandations-for-a-query", async (req, res) => {
      const id = req.query.id;
      console.log("recc---->", id);
      const query = { queryId: id };
      const result = await recommendationCollection.find(query).toArray();
      res.send(result);
    });

    //*adding query to db

    app.post("/add-query", async (req, res) => {
      const newQuery = req.body;
      const result = await queryCollections.insertOne(newQuery);
      res.send(result);
    });
    //* posting reccomendation data
    app.post("/add-recommendation", async (req, res) => {
      const newRecommendation = req.body;
      // checking if user already recommended for this spesific query
      const query = {
        recommendarEmail: newRecommendation.recommendarEmail,
        queryId: newRecommendation.queryId,
      };
      const alreadyExist = await recommendationCollection.findOne(query);
      console.log(alreadyExist);
      if (alreadyExist) {
        return res
          .status(400)
          .send("You have already recommended for this product");
      }

      // inserting recommendation information
      const result = await recommendationCollection.insertOne(
        newRecommendation
      );
      // Increasing query count
      const filter = { _id: new ObjectId(newRecommendation.queryId) };
      const updatedDoc = {
        $inc: { recommendationCount: 1 },
      };
      const updatedRecommendationCount = await queryCollections.updateOne(
        filter,
        updatedDoc
      );
      res.send(result);
    });
    // *updating query

    app.patch("/update-query", async (req, res) => {
      const id = req.body.id;
      const filter = { _id: new ObjectId(id) };
      const updatedDoc = {
        $set: {
          productName: req.body.productName,
          productBrand: req.body.productBrand,
          productImage: req.body.productImage,
          queryTitle: req.body.queryTitle,
          boycottingReason: req.body.boycottingReason,
        },
      };
      const result = await queryCollections.updateOne(filter, updatedDoc);
      res.send(result);
    });
    // *deleting query

    app.delete("/delete-query", async (req, res) => {
      const id = req.query.id;
      console.log(id);
      const query = { _id: new ObjectId(id) };
      const result = await queryCollections.deleteOne(query);
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
