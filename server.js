/*-----------\ 
 Dependencies
\-----------*/
const express = require("express");
const mongojs = require("mongojs");
const mongoose = require("mongoose");
const axios = require("axios");
const cheerio = require("cheerio");
const exphbs = require("express-handlebars");
const PORT = process.env.PORT || 3000;
const path = require('path');

// Initialize Express
const app = express();

// Database configuration
const databaseUrl = "space";
const collections = ["scrapedData"];

/*--------------------------------------------------------------------------------------\ 
 If deployed, use the deployed database. Otherwise use the local mongoHeadlines database
\--------------------------------------------------------------------------------------*/
const db = mongojs(databaseUrl, collections);
db.on("error", error => console.log("Database Error:", error));

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";

mongoose.connect(MONGODB_URI);

/*---\
 Path
\---*/
const publicDir = (path.join(__dirname, 'public'));

app.use(express.static(publicDir));

/*---------\
 Handlebars
\---------*/
app.set("views", "./views");
app.engine(
  "handlebars",
  exphbs({
    defaultLayout: "main"
  })
);
app.set("view engine", "handlebars");

/*-----\
 Routes
\-----*/
require("./routes/htmlRoutes")(app);

// shows all scraped data
app.get("/all", (req, res) => {
    db.scrapedData.find({}, (err, data) => {
        // Log any errors if the server encounters one
        if (err) {
            console.log(err);
        } else {
            // Otherwise, send the result of this query to the browser
            res.json(data);
        }
    });
});

// scrapes the data
app.get("/scrape", (req, res) => {
    axios.get("https://old.reddit.com/r/space/").then( response => {

      const $ = cheerio.load(response.data);

      $(".title").each((i, element) => {

       let title = $(element).children("a").text();
       let link = $(element).children("a").attr("href");

       let results = [];
  
        // If this found element had both a title and a link
        if (title && link) {
          // Insert the data in the scrapedData db
            db.scrapedData.insert({
            title: title,
            link: link
          },
        (err, inserted) => {
          if (err) {
              console.log(err);
            }
          else {
            console.log(inserted);
          }
        });
      }
    });
  });
  res.send("Scrape complete");
});

/*-------------\ 
 Listen on port
\-------------*/
app.listen(PORT, () => { console.log(`App listening on PORT: ${PORT}`) });

// Exports app to use in routes
module.exports = app;