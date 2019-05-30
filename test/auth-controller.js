const expect = require("chai").expect;
const sinon = require("sinon");
const User = require("../models/user");
const AuthController = require("../controllers/auth");

describe("Auth Controller - Login", function() {
  it("Should throw error if accessing database fails", function() {
    sinon.stub(User, "findOne");
    User.findOne.throws();
    expect(AuthController.login);
    User.findOne.restore();
  });
});
