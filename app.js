const express = require("express");
const feedRoutes = require("./routes/feed");
const bodyParser = require("body-parser");
const path = require("path");
const mongoose = require("mongoose");
const app = express();

app.use(bodyParser.json());
app.use("/images", express.static(path.join(__dirname, "images")));
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Contro-Allow-Methods", "GET, POST, PUT, PATCH, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});
app.use("/feed", feedRoutes);
app.use((error, req, res, next) => {
  console.log(error);
  const status = error.statusCode || 500;
  const message = error.message;
  res.status(status).json({ message: message });
});

mongoose
  .connect(
    "mongodb+srv://arthur:poq7283ipod@cluster0-e7jon.mongodb.net/messages?retryWrites=true"
  )
  .then(result => {
    app.listen(8080);
  })
  .catch(err => console.log(err));
