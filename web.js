console.log("Here");

// Webserver v1
var express = require('express');
var app = express.createServer(express.logger()); // Can put in express.logger("tiny") or express.logger() if you want debugging
var fs = require("fs");

//Favicon
app.get("/favicon.ico", express.favicon(__dirname + "/public/favicon.ico"));

app.get("/comments/*", function(req, res) {
    console.log(req.url);
    fs.readFile('public/comments.html', function(err, data) {
        if(err) {
            console.error("Could not open file: %s", err);
            res.send("Whoops");
            return;
        }
        
        res.send("" + data);
    });

});
// Static files in public
app.use(express.static(__dirname + "/public"));


// Routes all set. Start the server!
var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Server started. Listening on " + port);
});