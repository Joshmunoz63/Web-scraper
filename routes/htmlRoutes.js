/*----------\
 DEPENDECIES
\----------*/
const path = require("path");

/*----------\
 HTML ROUTES
\----------*/
module.exports = app => {
    // Renders index page
    app.get("/", (req, res) => {

        res.render("../views/index.handlebars");
      });
    // Render 404 page for any unmatched routes
  app.get("*", (req, res) => {
    res.render("404");
  });
};