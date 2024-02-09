var express = require("express");
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
