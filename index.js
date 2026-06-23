const express = require("express");
const app = express();

require("dotenv").config();
var cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
app.use(cors());
app.use(express.json());

const port =process.env.PORT;
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
    const ApplicationsCollections = database.collection(
      "applications-Collection",
    );
    const PlanCollections = database.collection("plan");
    const SubcriptionsCollections = database.collection("subcriptions");
    const UsersCollections = database.collection("user");
    const UserSessionCollections = database.collection("session");
    /**
     * ! VerifyToken
     */
    const VerifyToken = async (req, res, next) => {
      const authHeaders = req.headers.authorization;
      if (!authHeaders) {
        return res.status(401).json({ message: "unauthorized access" });
      }
      const token = authHeaders.split(" ")[1];

      if (!token) {
        return res.status(401).json({ message: "unauthorized access" });
      }

      const session = await UserSessionCollections.findOne({ token });

      if (!session) {
        return res.status(401).json({ message: "Invalid session" });
      }
      const UserId = session.userId;
      const user = await UsersCollections.findOne({
        _id: new ObjectId(UserId),
      });

      if (!user) {
        return res.status(401).json({ message: "Invalid UserId" });
      }
      req.user = user;

      next();
    };

    const AdminVerify = async (req, res, next) => {
      if (req.user.role !== "admin") {
        return res.status(403).json({
          message: "forbidden access",
        });
      }
      next();
    };
    const FounderVerify = async (req, res, next) => {
      if (req.user.role !== "founder") {
        return res.status(403).json({
          message: "forbidden access",
        });
      }
      next();
    };
    const CollaboratorVerify = async (req, res, next) => {
     
      if (req.user.role !== "collaborator") {
        return res.status(403).json({
          message: "forbidden access",
        });
      }
      next();
    };

    /**
     *! get startups all data
     */
    app.get("/startups", async (req, res) => {
      const result = await StartupsCollections.find()
        .sort({ createdAt: -1 })
        .toArray();
      res.json(result);
    });

    /**
     * ! get specfec founder data
     */

    app.get(
      "/startups/:userId",
      VerifyToken,
      FounderVerify,
      async (req, res) => {
        const { userId } = req.params;
        const result = await StartupsCollections.find({
          user: userId,
        }).toArray();
        res.json(result);
      },
    );

    /**
     * ! post startups
     */
    app.post("/startups", VerifyToken, FounderVerify, async (req, res) => {
      const updateData = req.body;

      const result = await StartupsCollections.insertOne(updateData);

      res.json(result);
    });

    /**
     * ! update startups
     */

    app.patch("/startups/:id", VerifyToken, FounderVerify, async (req, res) => {
      const { id } = req.params;
      const body = req.body;

      const result = await StartupsCollections.updateOne(
        {
          _id: new ObjectId(id),
        },
        {
          $set: body,
        },
      );
      res.json(result);
    });

    /**
     * ! delete startups
     */

    app.delete(
      "/startups/:id",
      VerifyToken,
      FounderVerify,
      async (req, res) => {
        const { id } = req.params;
        const result = await StartupsCollections.deleteOne({
          _id: new ObjectId(id),
        });

        res.json(result);
      },
    );

    /**
     * ! get opportunities by sort , search and pangination
     */
    app.get("/all-opportunities", async (req, res) => {
      try {
        const query = {};

        const search = req.query.search || "";
        const workType = req.query.workType || "";
        const ecosystemSegment = req.query.ecosystemSegment || "";
        const page = parseInt(req.query.page) || 1;

        const perPage = 6;

        if (search.trim()) {
          const regex = new RegExp(search, "i");

          query.$or = [{ roleTitle: regex }, { requiredSkills: regex }];
        }

        if (workType) query.workType = workType;
        if (ecosystemSegment) query.ecosystemSegment = ecosystemSegment;

        const totalItems = await OpportunitiesCollections.countDocuments(query);

        const result = await OpportunitiesCollections.find(query)
          .skip((page - 1) * perPage)
          .limit(perPage)
          .sort({ createdAt: -1 })
          .toArray();

        res.json({
          data: result,
          totalPages: Math.ceil(totalItems / perPage),
          currentPage: page,
          totalItems,
        });
      } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
      }
    });

    /**
     * ! get all Opportunities
     */
    app.get("/Opportunities-all-data", async (req, res) => {
      const result = await OpportunitiesCollections.find().toArray();
      res.json(result);
    });

    /**
     * ! get Opportunities details
     */
    app.get("/opportunities/:id", async (req, res) => {
      const { id } = req.params;

      const result = await OpportunitiesCollections.findOne({
        _id: new ObjectId(id),
      });
      res.json(result);
    });
    /**
     * ! get funder all Opportunities data
     */
    app.get(
      "/founder-opportunities",
      VerifyToken,
      FounderVerify,
      async (req, res) => {
        const query = {};
        if (req.query.userId) {
          query.userId = req.query.userId;
        }

        const result = await OpportunitiesCollections.find(query).toArray();
        res.json(result);
      },
    );

    app.get("/plan", async (req, res) => {
      const result = await PlanCollections.find().toArray();
      res.json(result);
    });

    /**
     *  ! application post data
     */
    app.post("/application", VerifyToken, async (req, res) => {
      const query = req.body;
      const result = await ApplicationsCollections.insertOne(query);
      res.json(result);
    });

    /**
     * ! get Collaborator`s applications data
     */
    app.get("/application", VerifyToken, async (req, res) => {
      const query = {};

      if (req.query.userId) {
        query.userid = req.query.userId;
      }

      const result = await ApplicationsCollections.find(query).toArray();

      res.json(result);
    });
    /**
     * !  Collaborator`s applications status update data
     */
    app.patch(
      "/application/:id",
      VerifyToken,
      FounderVerify,
      async (req, res) => {
        const { id } = req.params;
        const { status } = req.body;
        const result = await ApplicationsCollections.updateOne(
          { _id: new ObjectId(id) },
          { $set: { status } },
        );
        res.json(result);
      },
    );

    /**
     *  ! founder post data opportunities
     */
    app.post("/opportunities", VerifyToken, async (req, res) => {
      const query = req.body;
      const result = await OpportunitiesCollections.insertOne(query);
      res.json(result);
    });

    /**
     * ! get founder Opportunities data
     */
    app.get(
      "/founder-opportunities",
      VerifyToken,
      FounderVerify,
      async (req, res) => {
        const query = {};
        if (req.query.userId) {
          query.userId = req.query.userId;
        }
        const result = await OpportunitiesCollections.find(query).toArray();
        res.json(result);
      },
    );

    /**
     * ! delete founder Opportunities data
     */
    app.delete(
      "/founder-opportunities/:id",
      VerifyToken,
      FounderVerify,
      async (req, res) => {
        const { id } = req.params;

        const result = await OpportunitiesCollections.deleteOne({
          _id: new ObjectId(id),
        });

        res.json(result);
      },
    );

    app.patch(
      "/founder-opportunities/:id",
      VerifyToken,
      FounderVerify,
      async (req, res) => {
        const { id } = req.params;
        const body = req.body;

        const result = await OpportunitiesCollections.updateOne(
          { _id: new ObjectId(id) },
          { $set: body },
        );

        res.json(result);
      },
    );

    /**
     * ! get Companies applications data
     */
    app.get("/companies-application", VerifyToken, async (req, res) => {
      const query = {};
      if (req.query.userId) {
        query.founderId = req.query.userId;
      }

      const result = await ApplicationsCollections.find(query).toArray();
      res.json(result);
    });

    /**
     * ! founder subcriptions post data
     */

    app.post("/subcriptions", VerifyToken, async (req, res) => {
      const query = req.body;
      const data = {
        ...query,
        createdAt: new Date().toDateString("en-GB"),
      };

      const result = await SubcriptionsCollections.insertOne(data);

      const filter = { _id: new ObjectId(query.userId) };
      const update = {
        $set: {
          plan: query.plan,
        },
      };
      const updateUser = await UsersCollections.updateOne(filter, update);
      res.json({ success: true, updateUser, result });
    });

    /**
     * ! get all users
     */

    app.get("/users", VerifyToken, AdminVerify, async (req, res) => {
      const result = await UsersCollections.find().toArray();
      res.json(result);
    });

    /**
     * ! update users isBlock...
     */

    app.patch(
      "/update/users/:id",
      VerifyToken,
      AdminVerify,
      async (req, res) => {
        const { id } = req.params;
        const { isBlock } = req.body;

        const result = await UsersCollections.updateOne(
          { _id: new ObjectId(id) },
          { $set: { isBlock } },
        );
        
        res.json(result);
      },
    );

    /**
     * ! get subcriptions data
     */
    app.get("/subcriptions", VerifyToken, AdminVerify, async (req, res) => {
      const result = await SubcriptionsCollections.find().toArray();
      res.json(result);
    });

    // await client.db("admin").command({ ping: 1 });
    // console.log(
    //   "Pinged your deployment. You successfully connected to MongoDB!",
    // );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

// app.listen(port, () => {
//   console.log(`Example app listening on port ${port}`);
// });
