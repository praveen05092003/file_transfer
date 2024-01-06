const express = require("express");
const multer = require("multer");
const path = require("path");
const csvtojson = require("csvtojson");

const mongoose = require("mongoose");

const app = express();
const port = 2000;

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// MongoDB connection
mongoose.connect(
  "mongodb+srv://retailprod:BP9mxW6tf1um3wTF@nfoindia.podoag4.mongodb.net/RETAIL_PROD",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

const db = mongoose.connection;

db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.once("open", function () {
  console.log("Connected to MongoDB");

  // Create a new collection named "praveen"
  const praveenCollection = db.collection("praveen");

  app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
  });

  app.post("/upload", upload.single("csvFile"), (req, res) => {
    const csvData = req.file.buffer.toString("utf8");
    csvtojson()
      .fromString(csvData)
      .then((jsonArray) => {
        // Store data in the "praveen" collection
        praveenCollection.insertMany(jsonArray, (err, result) => {
          if (err) {
            console.error("Error inserting data into MongoDB:", err);
            res.status(500).send("Error inserting data into MongoDB");
          } else {
            res.json(result);
          }
        });
      })
      .catch((error) => {
        console.error("Error parsing CSV:", error);
        res.status(500).send("Error parsing CSV");
      });
  });

  app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
  });
});
