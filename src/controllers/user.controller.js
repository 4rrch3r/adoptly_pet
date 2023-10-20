const userModel = require("../models/index").User;
const apiError = require("../utils/apiError");
const bcryptjs = require("bcrypt");

const getUsers = async (req, res, next) => {
  try {
    const users = await userModel.find({});
    return res.status(200).json(users);
  } catch (err) {
    return next(err);
  }
};
const getUser = async (req, res, next) => {
  try {
    let user;
    if ((req.user.rights == "read" && req.user.id == req.params.id) ||req.user.rights == "write") {
      user = await userModel.findById(req.params.id).exec();
    }
    if (req.user.rights == "read" && req.user.isActivated==false) {
      throw new apiError(403, "Activate your account");
    }
    if (!user) {
      throw new apiError(404, "User was not found");
    }

    return res.status(200).json(user);
  } catch (err) {
    return next(err);
  }
};
const postUser = async (req, res, next) => {
  try {
    if (!req.body.password) {
      throw new apiError(400, "Bad request");
    }
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(req.body.password, salt);
    const newUser = new userModel({
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword,
      phoneNumber: req.body.phoneNumber,
      address: req.body.address,
      rights: req.body.rights,
      favorites: req.body.favorites,
    });
    const savedUser = await newUser.save();
    return res.status(201).json(savedUser);
  } catch (err) {
    return next(err);
  }
};
const putUser = async (req, res, next) => {
  try {
    let user;
    if ((req.user.rights == "read" && req.user.id == req.params.id) ||req.user.rights == "write") {
      user = await userModel.findById(req.params.id).exec();
    }
    if (req.user.rights == "read" && req.user.isActivated==false) {
      throw new apiError(403, "Activate your account");
    }
    if (!user) {
      throw new apiError(404, "User was not found");
    }
    if (req.body.password) {
      const salt = await bcryptjs.genSalt(10);
      req.body.password = await bcryptjs.hash(req.body.password, salt);
    }

    const updatedUser = await userModel.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        phoneNumber: req.body.phoneNumber,
        address: req.body.address,
        rights: req.body.rights,
        favorites: req.body.favorites,
        isActivated: req.body.isActivated,
        activationLink: req.body.activationLink,
      },
      { new: true, runValidators: true }
    );
    return res.status(200).json(updatedUser);
  } catch (err) {
    return next(err);
  }
};
const deleteUser = async (req, res, next) => {
  try {
    const user = await userModel.findById(req.params.id).exec();
    if (!user) {
      throw new apiError(404, "User was not found");
    }
    await userModel.findByIdAndDelete(req.params.id);
    return res.status(204).json("User deleted");
  } catch (err) {
    return next(err);
  }
};
const getCurrentUser = async (req, res, next) => {
  try {
    var payload = JSON.parse(
      Buffer.from(req.cookies.access_token.split(".")[1], "base64").toString(
        "utf8"
      )
    );
    const user = await userModel.findById(payload.id).exec();
    if (!user) {
      throw new apiError(404, "User was not found");
    }
    if (!user.isActivated) {
      throw new apiError(400, `Your account was not activated`);
    }
    return res.status(200).json(user);
  } catch (err) {
    return next(err);
  }
};
const putCurrentUser = async (req, res, next) => {
  try {
    var payload = JSON.parse(
      Buffer.from(req.cookies.access_token.split(".")[1], "base64").toString(
        "utf8"
      )
    );
    const user = await userModel.findById(payload.id).exec();
    if (!user) {
      throw new apiError(404, "User was not found");
    }
    if (!user.isActivated) {
      throw new apiError(400, `Your account was not activated`);
    }
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(req.body.password, salt);
    const updatedUser = await userModel.findByIdAndUpdate(
      payload.id,
      {
        name: req.body.name,
        email: req.body.email,
        password: hashedPassword,
        phoneNumber: req.body.phoneNumber,
        address: req.body.address,
        favorites: req.body.favorites,
      },
      { new: true }
    );
    return res.status(200).json(updatedUser);
  } catch (err) {
    return next(err);
  }
};
module.exports = {
  getUsers,
  getUser,
  postUser,
  putUser,
  deleteUser,
  getCurrentUser,
  putCurrentUser,
};
