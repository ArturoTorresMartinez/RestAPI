const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const fs = require('fs');
const multer = require("multer");
const graphqlHttp = require("express-graphql");
const graphqlSchema = require("./graphql/schema");
const graphqlResolver = require("./graphql/resolver");
const mongoose = require("mongoose");
const auth = require('./middleware/auth');
const app = express();
const uuidv4 = require("uuid/v4");
const cors = require("cors");
const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    cb(null, uuidv4() + file.originalname);
  }
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

app.options("*", cors());
app.use(cors());
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Contro-Allow-Methods", "GET, POST, PUT, PATCH, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200)
  }
  next();
});
app.use(bodyParser.json());
app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).single("image")
);
app.use("/images", express.static(path.join(__dirname, "images")));
app.use(auth);
app.put('/post-image', (req, res, next) => {
  if (!req.isAuth) {
    throw new Error('Not Authenticated');
  }
  if (!req.file) {
    return res.status(200).json({ message: 'No file provided' });
  }
  if (req.body.oldPath) {
    clearImage(req.body.oldPath);
  }
  return res.status(201).json({ message: 'File stored', filePath: req.file.path.replace("\\", "/") });
});
app.use(
  "/graphql",
  graphqlHttp({
    schema: graphqlSchema,
    rootValue: graphqlResolver,
    graphiql: true,
    customFormatErrorFn(err) {
      if (!err.originalError) {
        return err;
      }
      const data = err.originalError.data;
      const message = err.message || "An error occured";
      const code = err.originalError.code || 500;
      return { message: message, status: code, data: data };
    }
  })
);
app.use((error, req, res, next) => {
  console.log(error);
  const status = error.statusCode || 500;
  const message = error.message;
  const data = error.data;
  res.status(status).json({ message: message, data: data });
});

mongoose
  .connect(
    "mongodb+srv://arthur:poq7283ipod@cluster0-e7jon.mongodb.net/messages?retryWrites=true", { useNewUrlParser: true }
  )
  .then(result => {
    app.listen(8080);
  })
  .catch(err => console.log(err));

const clearImage = filePath => {
  filePath = path.join(__dirname, "..", filePath);
  fs.unlink(filePath, err => console.log(err));
};
