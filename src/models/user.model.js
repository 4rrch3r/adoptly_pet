const mongoose = require("mongoose");
const toJSON = require("../utils/toJson");
var Schema = mongoose.Schema;

var userSchema = new Schema({
  name: {
    type: String,
    required: [true, "Name of the user is required"],
  },
  email: {
    type: String,
    required: [true, "Email of the user is required"],
    unique: true,
  },
  phoneNumber: {
    type: String,
    required: [true, "Phone number of the user is required"],
    unique: true,
  },
  password: {
    required: [true, "Password of the user is required"],
    type: String,
  },
  favorites: {
    type: [mongoose.Schema.Types.ObjectId],
    default: null,
  },
  rights: {
    type: String,
    enum: ["read", "write"],
    default: "read",
  },
  address: {
    type: String,
  },
  isActivated: {
    type: Boolean,
    default: false,
  },
  activationLink: {
    type: String,
    default: null
  },
});

toJSON(userSchema);

module.exports = mongoose.model("users", userSchema);
