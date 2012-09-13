console.log("Here");

// Webserver v1
var express = require('express');
var app = express.createServer(express.logger()); // Can put in express.logger("tiny") or express.logger() if you want debugging

//Favicon
app.get("/favicon.ico", express.favicon(__dirname + "/public/favicon.ico"));

// Static files in public
app.use(express.static(__dirname + "/public"));

// Routes all set. Start the server!
var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Server started. Listening on " + port);
});