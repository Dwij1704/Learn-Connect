var express = require("express");
var bodyParser = require("body-parser");
var url = bodyParser.urlencoded({ extended: false });
var path = require("path");
const session = require("express-session");
const mongoose = require('mongoose');

var app = express();
app.use(express.static("views"));
app.set("view engine", "ejs"); 
    console.log(__dirname);
app.get("/", (req, res) => {
        res.render("index", { user: {username:"Dwij", role:1} });
    });

app.listen(8001, () => {
    console.log("Server is running on port 8001");
});
