require("dotenv").config({
  path: "./dev.env",
});
const jwt = require("jsonwebtoken");
var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const fs = require("fs");

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");

var app = express();

const db = require("./modules/db_connect");
const cors = require("cors");
const corsOption = {
  credential: true,
  origin: (origin, cb) => {
    cb(null, true);
  },
};
app.use(cors(corsOption));
const upload = require("./modules/upload");
const session = require("express-session");
const MySQLStore = require("express-mysql-session")(session);
const sessionStore = new MySQLStore({}, db);
const bcrypt = require("bcrypt");
// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(
  session({
    secret: "狡兔三窟",
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
      maxAge: 1200000,
    },
  })
);
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/users", usersRouter);

app.use('/index',require('./modules/index'))
app.use('/games',require('./modules/games'))
app.use('/orders',require('./modules/orders'))
app.use('/signin',require('./modules/signin'))
app.use('/member',require('./modules/member'))
app.use('/store',require('./modules/store'))
app.use('/map',require('./modules/map'))


app.use("/linepay", require("./modules/line"));
app.post("/post", upload.array("photos", 12), (req, res) => {
  console.log(1545)
  res.json(req.files);
});

app.get("/logout", (req, res) => {
  delete req.session.admin;
  res.json(req.session);
});
// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
