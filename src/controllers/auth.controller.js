const bcryptjs = require("bcrypt");
const User = require("../models/user.model.js");
const jwt = require("jsonwebtoken");
const apiError = require("../utils/apiError.js");
const uuid = require("uuid");
const mailSender = require("../utils/mailSender.js");
const register = async (req, res, next) => {
  try {
    if (!req.body.password) {
      throw new apiError(400, "Bad request");
    }
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(req.body.password, salt);
    const activationLink = uuid.v4();
    const newUser = new User({
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword,
      phoneNumber: req.body.phoneNumber,
      address: req.body.address,
      rights: req.body.rights,
      favorites: req.body.favorites,
      isActivated:false,
      activationLink:activationLink
    });
    await mailSender.sendActivationMail(
      req.body.email,
      `http://localhost:${process.env.PORT}/${process.env.PROJECT_NAME}/auth/activate/${activationLink}`
    );
    const savedUser = await newUser.save();
    return res.status(201).json(savedUser);
  } catch (err) {
    return next(err);
  }
};

const login = async (req, res, next) => {
  try {
    if (!req.body.email || !req.body.password) {
      throw new apiError(400, "Email,password required");
    }

    const user = await User.findOne({ email: req.body.email }).select(
      "name email password rights"
    );

    if (!user) {
      throw new apiError(404, "User was not found");
    }
    const isPasswordCorrect = await bcryptjs.compare(
      req.body.password,
      user.password
    );
    if (!isPasswordCorrect) {
      throw new apiError(401, "Password is incorrect");
    }
    const payload = {
      id: user.id,
      name: user.name,
      rights: user.rights,
      isActivated:user.isActivated
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });
    return res
      .cookie("access_token", token, {
        httpOnly: true,
      })
      .status(200)
      .json({ message: "login success" });
  } catch (err) {
    return next(err);
  }
};

const logout = (req, res) => {
  res.clearCookie("access_token");
  return res.status(200).json({ message: "Logout success" });
};
const activate = async (req, res, next) => {
  try {
    const activationLink = req.params.link;
    
    const user = await User.findOne({activationLink});
    if(!user)
    {
      throw new apiError(404, "User was not found");
    }
    user.isActivated=true;
    await user.save();
    return res.redirect(`http://localhost:${process.env.PORT}/${process.env.PROJECT_NAME}/pets`);
  } catch (err) {
    return next(err);
  }
};
module.exports = {
  register,
  login,
  logout,
  activate,
};
