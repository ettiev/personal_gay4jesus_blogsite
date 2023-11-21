require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const MONGODB_URI = process.env.MONGODB_URI;

const adminRoutes = require("./routes/admin.js");
const blogsiteRoutes = require("./routes/blogsite.js");

const User = require("./models/user")

const app = express();

const store = MongoDBStore({
    uri: MONGODB_URI,
    collection: "sessions",
    expires: 1000 * 60 * 60 * 12
});
store.on('error', function(error) {  // catch errors (MongoDBStore)
    console.log(error);
  });

app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
    store: store
}));


app.use(bodyParser.urlencoded({extended: true}));

app.use(express.static("public"));

app.set('view engine', 'ejs');
app.set("views", "views");

//session - set user
app.use((req, res, next) => {
    if (!req.session.user) {
        return next();
    };
    User.findById(req.session.user._id)
    .then((user => {
        if (!user) {
            return next();
        }
        req.user = user;
        next();
    }))
    .catch(err => {
        throw new Error(err);
    });
});

app.use("/admin", adminRoutes);
app.use(blogsiteRoutes);

app.use("/error", function(req, res){
    res.render("error");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

mongoose.connect(MONGODB_URI)
.then(result => {
    app.listen(port, () => {
        console.log("Server started")
    });    
}).catch( err => {
    console.log(err)
});

