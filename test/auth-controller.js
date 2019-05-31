const expect = require("chai").expect;
const sinon = require("sinon");
const User = require("../models/user");
const mongoose = require('mongoose');
const AuthController = require("../controllers/auth");

describe("Auth Controller - Login", function () {
  before(function (done) {
    mongoose.connect("mongodb+srv://arthur:poq7283ipod@cluster0-e7jon.mongodb.net/test-messages?retryWrites=true", { useNewUrlParser: true }
    )
      .then(result => {
        const user = new User({
          email: "efrainarthur@test.com",
          password: "tester",
          name: "Arthur",
          posts: [],
          _id: '5cefece35137d20004418deb'
        });
        return user.save();
      }).then(() => {
        done();
      })
  })
  it("Should throw error if accessing database fails", function (done) {
    sinon.stub(User, "findOne");
    User.findOne.throws();

    const req = {
      body: {
        email: 'test@test.com',
        password: 'testt'
      }
    };
    AuthController.login(req, {}, () => {

    }).then(result => {
      expect(result).to.be.an('error');
      expect(result).to.have.property('statusCode', 500);
      done();
    });
    User.findOne.restore();
  });

  it('Should send a reponse with valid user status for existing users', function (done) {
    const req = { userId: '5cefece35137d20004418deb' };
    const res = {
      statusCode: 500,
      userStatus: null,
      status: function (code) {
        this.statusCode = code;
        return this;
      },
      json: function (data) {
        this.userStatus = data.status;
      }
    };
    AuthController.getUserStatus(req, res, () => { }).then(() => {
      expect(res.statusCode).to.be.equal(200);
      expect(res.userStatus).to.be.equal('I am new!');
      done();
    });

  });

  after(function (done) {
    User.deleteMany({}).then(() => {
      return mongoose.disconnect();
    }).then(() => {
      done();
    });
  })
});
