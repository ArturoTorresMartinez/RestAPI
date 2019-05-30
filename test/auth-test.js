const expect = require("chai").expect;
const jwt = require("jsonwebtoken");
const sinon = require("sinon");
const authMiddleware = require("../middleware/auth");

describe("Auth Middleware", function() {
  it("Should throw an error if no authorization is present", function() {
    const req = {
      get: function(headerName) {
        return null;
      }
    };
    expect(authMiddleware.bind(this, req, {}, () => {})).to.throw(
      "Not authenticated"
    );
  });

  it("Should throw error if auth header is only one string", function() {
    const req = {
      get: function(headerName) {
        return "xyz";
      }
    };
    expect(authMiddleware.bind(this, req, {}, () => {})).of.throw();
  });
  it("Should throw error of token cannot be verified", function() {
    const req = {
      get: function(headerName) {
        return "Bearer xyz";
      }
    };
    expect(authMiddleware.bind(this, req, {}, () => {})).to.throw();
  });
  it("Should yield a userId after decoding token", function() {
    const req = {
      get: function(headerName) {
        return "Bearer dsdsadsadsadsadasdasads";
      }
    };
    sinon.stub(jwt, "verify");
    jwt.verify.returns({ userId: "abc" });
    authMiddleware(req, {}, () => {});
    expect(req).to.have.property("userId");
    expect(req).to.have.property("userId", "abc");
    expect(jwt.verify.called).to.be.true;
    jwt.verify.restore();
  });
});
