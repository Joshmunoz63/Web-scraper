/*-----------\ 
 Dependencies
\-----------*/
const express = require("express");
const mongojs = require("mongojs");
const axios = require("axios");
const cheerio = require("cheerio");

// Initialize Express
const app = express();

// Database configuration
const databaseUrl = "space";
const collections = ["scrapedData"];

/*--------------------------------------------\ 
 Hook mongojs configuration to the db variable
\--------------------------------------------*/
const db = mongojs(databaseUrl, collections);
db.on("error", error => console.log("Database Error:", error));

/*-----\
 Routes
\-----*/
// shows all scraped data
app.get("/all",  (req, res) => {
    db.scraper.find({}, (err, data) => {
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
  app.get("/scrape",  (req, res) => {
    axios.get("https://old.reddit.com/r/space/").then( response => {

      const $ = cheerio.load(response.data);

      let results = [];

      $(".title").each(function (i, element) {

        let title = $(element).children().text();
        let link = $(element).find("a").attr("href");

        results.push({
          title: title,
          link: link
        });
      });

      res.json(results);
    });
  });

/*------------------\ 
 Listen on port 3000
\------------------*/
app.listen(3000, () => console.log("App running on port 3000!"));