const jwt = require("jsonwebtoken");
const apiError = require("./apiError.js");

const checkRights = (requiredRight) => async (req, res, next) => {
  try {
    const token = req.get('Authorization').split(' ')[1]
    console.log(token)
    if (!token) {
      throw new apiError(401, "Unauthorized");
    }
    return jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        throw new apiError(401, "Invalid Token");
      } else {
        if (requiredRight != decoded.rights && decoded.rights != "write") {
          throw new apiError(403, "Forbidden");
        }
        req.user = decoded;
        return next();
      }
    });
  } catch (err) {
    return next(err);
  }
};
module.exports = checkRights;
