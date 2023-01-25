const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

app.listen(8080);

app.engine("html", require("ejs").renderFile);
app.set("view engine", "html");

app.use(express.static(__dirname + "/public"));
app.use(express.urlencoded({ extended: "false" }));
app.use(express.json());
app.use(bodyParser.json());
app.use(cookieParser());

var http = require("http");

var routes = require("./routes")(app);
http.createServer(app).listen(80, function () {
  console.log("Express server listening on port " + 5500);
});
