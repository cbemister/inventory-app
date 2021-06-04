const config = require("../config");
const MongoClient = require("mongodb").MongoClient;
const parser = require("csv-parse/lib/sync");
const fs = require("fs");
const path = require("path");

const DB = config.dbHost.replace("<password>", config.dbPassword);

let mongoClient;
MongoClient.connect(DB, { useNewUrlParser: true })
  .then((client) => {
    mongoClient = client;
    const db = client.db(config.dbName);
    const collection = db.collection(config.collectionName);
    return collection;
  })
  .then((collection) => {
    const sourceData = fs.readFileSync(
      path.join(__dirname, config.sourceDataFile),
      "utf8"
    );
    const documents = parser(sourceData, {
      columns: true,
      skip_empty_lines: true,
    });
    collection.insertMany(documents, (err) => {
      if (err) {
        throw err;
      }

      console.log(
        `Documents imported successfully to: ${config.collectionName}`
      );
      mongoClient.close();
    });
  })
  .catch((error) => {
    console.log("There was an error seeding the database: ", error);
  });
