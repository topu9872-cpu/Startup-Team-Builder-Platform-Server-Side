const express = require("express");
const app = express();

require("dotenv").config();
var cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
app.use(cors());
app.use(express.json());

const port = 5000;
const uri = process.env.MONGODB_URI;

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

    const database = client.db("Startup-Team-Builder-Platform");
    const StartupsCollections = database.collection("Startups");
    const OpportunitiesCollections = database.collection("Opportunities");

    app.get("/startups", async (req, res) => {
      const result = await StartupsCollections.find()
        .sort({ createdAt: -1 })
        .toArray();
      res.json(result);
    });


   /**
    * ! get opportunities by sort , search and pangination 
    */ 
    app.get("/opportunities", async (req, res) => {
      const search = req.query.search || "";
      const workType = req.query.workType || "";
      const ecosystemSegment = req.query.ecosystemSegment || "";
      const page = parseInt(req.query.page) || 1;
      const perPage = 6;

      const query = {};

      if (search) {
        // const regex = new RegExp(search, "i");
        query.$or = [
          {
            roleTitle: { $regex: search, $options: "i" },
          },
          { requiredSkills: { $regex: search, $options: "i" } },
        ];
      }

      if (workType) {
        query.workType = workType;
      }
      if (ecosystemSegment) {
        query.ecosystemSegment = ecosystemSegment;
      }

      const totalItems = await OpportunitiesCollections.countDocuments(query);
      const totalPages = Math.ceil(totalItems / perPage);

      const result = await OpportunitiesCollections.find(query)

        .skip((page - 1) * perPage)
        .limit(perPage)
        .sort({ createdAt: -1 })
        .toArray();

      res.json({ data: result, totalPages, currentPage: page, totalItems });
    });



    app.get("/opportunities/:id", async (req, res) => {
      const { id } = req.params;
      const result = await OpportunitiesCollections.findOne({
        _id: new ObjectId(id),
      });
      res.json(result);
    });

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!",
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
