const { validationResult } = require("express-validator/check");
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.signup = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Validation failed");
    error.statusCode = 422;
    error.data = errors.array();
    throw error;
  }
  const email = req.body.email;
  const name = req.body.name;
  const password = req.body.password;
  try {
    const p = await bcrypt.hash(password, 12);
    const user = new User({
      email: email,
      password: p,
      name: name
    });
    const r = await user.save();
    res.status(201).json({ message: "User created", userId: r._id });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.login = async (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  let loadedUser;
  try {
    const u = await User.findOne({ email: email });
    if (!u) {
      const error = new Error("Email could not be found");
      error.statusCode = 401;
      throw error;
    }
    loadedUser = u;
    const r = await bcrypt.compare(password, u.password);
    if (!r) {
      const error = new Error("Wrong Password");
      error.statusCode = 401;
      throw error;
    }
    const token = jwt.sign(
      { email: loadedUser.email, userId: loadedUser._id.toString() },
      "secret",
      { expiresIn: "1h" }
    );
    res.status(200).json({ token: token, userId: loadedUser._id.toString() });
    return;
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
    return err;
  }
};

exports.getUserStatus = async (req, res, next) => {
  try {
    const u = await User.findById(req.userId);
    if (!u) {
      const error = new Error("User Not found");
      error.statusCode = 404;
      throw error;
    }
    res.status(200).json({ status: u.status });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.updateUserStatus = async (req, res, next) => {
  const newStatus = req.body.status;

  try {
    const u = await User.findById(req.userId);
    if (!u) {
      const error = new Error("User Not found");
      error.statusCode = 404;
      throw error;
    }
    u.status = newStatus;
    await u.save();
    res.status(200).json({ message: "User Updated" });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
