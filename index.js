var express = require("express");
var bodyParser = require("body-parser");
var url = bodyParser.urlencoded({ extended: false });
var path = require("path");
const session = require("express-session");
const mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1/learn-connect').then(() => console.log("connection succeeded"))
.catch((err) => console.log(err));

var db = mongoose.connection;
var app = express();
app.use(express.static("views"));
app.use(
    session({
        secret: "jodd",
        resave: false,
        saveUninitialized: false,
        cookie: {
            maxAge: 315360000000, // Set the cookie to last until the browser session ends
        }
})
);
app.set("view engine", "ejs"); 
    console.log(__dirname);
app.get("/", (req, res) => {
        console.log(req.session.user)
        res.render("index", { user: req.session.user });
    });
app.get("/logout", (req, res) => {
    req.session.destroy(() => {
        res.redirect("/");
    });
});
try {
    app.post("/registration", url, (req, res) => {
        var uname = req.body.uname;
        var email = req.body.email;
        var pwd = req.body.pwd;
        var phno = req.body.phno;
        var role = req.body.role
        var edu = req.body.edu;

        var data = {
            "Uname": uname,
            "Email": email,
            "Password": pwd,
            "Ph_no":phno,
            "Role": role,
            "Ed-Q": edu
        };
        
        db.collection('users').insertOne(data, function (err, collection) {
            if (err) {
                res.redirect("/?success=false&message=Failed To Create a User")
            }
            
            res.redirect("/?success=true&message=User Created Successfully")
        });
    });
    app.post("/login", url, (req, res) => {
        var uname = req.body.uname;
        var pwd = req.body.pwd;
        var role = req.body.role
        console.log(uname);
        console.log(role);
        db.collection('users').findOne({ Uname: uname, Role: role }, (err, user) => {
            console.log(user);
            if (err) {
                res.redirect("/?success=false&message=Error in Server")
            }
            if (user==null) {
                res.redirect("/?success=false&message=User Not Found")
            }
            else if (user.Password === pwd) {
                req.session.user = {
                    _id: user._id,
                    username: user.Uname,
                    role: user.Role,
                };
                console.log(req.session.user)
                console.log(req.session.user.username)
                res.redirect("/?success=true&message=User Logged Successfully")
            }
            else {
                res.redirect("/?success=false&message=Incorrect Password")
            }
        });
    });
    function requireSAuth(req, res, next) {
    if (req.session && req.session.user && req.session.user.role == 0) {
        return next();
    } else if(req.session && req.session.user) {
        res.redirect('/?success=false&message=You are not authorized to access that page');
    }
    else {
        res.redirect('/?success=false&message=Please Login to Continue');
  }
    }
    function requireTAuth(req, res, next) {
    if (req.session && req.session.user && req.session.user.role == 1) {
        return next();
    } else if(req.session && req.session.user) {
        res.redirect('/?success=false&message=You are not authorized to access the page');
  }
    else {
        res.redirect('/?success=false&message=Please Login to Continue');
  }
    }
    app.get("/dashboard-tutor", requireTAuth, (req, res) => {
        res.render("dashboardTutor", { user: req.session.user });
    });
    
    app.get("/dashboard-student", requireSAuth, (req, res) => {
        res.render("dashboardStudent", { user: req.session.user });
    });
    app.get("/manage-course", requireTAuth, (req, res) => {
        res.render("manageCourseTutor", { user: req.session.user });
    });
    app.get("/create-course", requireTAuth, (req, res) => {
        res.render("createCourseTutor", { user: req.session.user });
    });
    app.get("/enrolled-students", requireTAuth, (req, res) => {
        res.render("enrolledStudentsTutor", { user: req.session.user });
    });
    app.get("/tutorProfile", requireTAuth, (req, res) => {
        res.render("tutorProfile", { user: req.session.user });
    });
    app.get("/courses", (req, res) => {
        res.render("courseListing", { user: req.session.user });
    });
    app.get("/tutors", (req, res) => {
        res.render("tutorList", { user: req.session.user });
    });
    app.get("/contact-us", (req, res) => {
        res.render("contact", { user: req.session.user });
    });
    app.get("/about-us", (req, res) => {
        res.render("about", { user: req.session.user });
    });
    app.post('/processCreateCourse', url, (req, res) => {
        var course = req.body.course;
        var category = req.body.category;
        var diff = req.body.difficulty;
        var tutor = req.session.user.username;
        var price = req.body.price;
        var slot = req.body.slots;

        var data = {
            "Course": course,
            "Category": category,
            "Tutor": tutor,
            "Price": parseInt(price),
            "Available": slot,
            "Difficulty": diff
        };
        console.log(data);
        db.collection('courses').insertOne(data, function (err, collection) {
            if (err) {
                res.redirect("create-course?success=false&message=Failed To Add Your Course")
            }
            
            res.redirect("create-course?success=true&message=Course Created Successfully")
        });
    })
} catch (err) {
    console.error(`Error in server ${err}`);
}

app.listen(3000, () => {
    console.log("Server is running on port 3000");
});
