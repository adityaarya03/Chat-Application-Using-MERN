const express = require("express");
const User = require("../models/user");
const expressAsyncHandler = require("express-async-handler");
const generateToken = require("../config/generateToken");
const otpGenerator = require("otp-generator");
const OTP = require("../models/otp");

exports.loginController = expressAsyncHandler(async (req, res) => {
  const { name, password } = req.body;

  if (!name || !password) {
    return res.status(403).send({
      success: false,
      message: "All fields are required",
    });
  }

  const user = await User.findOne({ name });
  if (user && (await user.matchPassword(password))) {
    const response = {
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      token: generateToken(user._id),
    };
    console.log(response);
    res.status(200).json(response);
  } else {
    res.status(403).send({
      success: false,
      message: "User not found",
    });
  }
});
exports.signupController = expressAsyncHandler(async (req, res) => {
  const { name, email, password, avatarImage , otp, } = req.body;
  console.log(req.body);
  if (!name || !email || !password || !otp ) {
    return res.status(403).send({
      success: false,
      message: "All fields are required",
    });
  }

  const userExist = await User.findOne({ email });
  if (userExist) {
    return res.status(400).send({
      success: false,
      message: "User already Exist",
    });
  }

  const userNameExist = await User.findOne({ name });
  if (userNameExist) {
    return res.status(400).send({
      success: false,
      message: "User with this Username already Exists",
    });
  }

  const response = await OTP.find({email}).sort({createdAt : -1}).limit(1);
  console.log(response);

  if(response.length===0){
    return res.status(400).json({
      success:false,
      message:"Otp is not present for user,Generate again"
    })
  }else if(otp!==response[0].otp){
    return res.status(400).json({
      success:false,
      message:"The otp is not valid"
    })
  }

  const user = await User.create({
    name,
    email,
    password,
    avatarImage,
  });

  if (user) {
    res.status(200).json({
      _id: user._id,
      name: user.name,
      email,
      isAdmin: user.isAdmin,
      token: generateToken(user._id),
    });
  }
});

exports.fetchAllUsers = expressAsyncHandler(async (req, res) => {
  const keyword = req.query.search
    ? {
        $or: [
          { name: { $regex: req.query.search, $options: "i" } },
          { email: { $regex: req.query.search, $options: "i" } },
        ],
      }
    : {};
  // console.log(keyword);
  const users = await User.find(keyword).find({
    _id: { $ne: req.user._id },
  });

  res.send(users);
});

exports.sendOtp = expressAsyncHandler(async (req, res) => {
  const { email } = req.body;
  if(!email){
    console.log("Email is not present");
  }
  const checkUser = await User.findOne({ email });
  if (checkUser) {
    res.status(401).json({
      success: "false",
      message: "User is already registered",
    });
    console.log("User is already registred with us");
  }

  var otp = otpGenerator.generate(6, {
    upperCaseAlphabets: false,
    lowerCaseAlphabets: false,
    specialChars: false,
  });

  const result = await OTP.findOne({ otp });
  console.log("Result is Generate OTP Func");
  console.log("OTP", otp);
  console.log("Result", result);
  while (result) {
    otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });
  }
  const otpPayload = {email,otp};
  const otpBody = await OTP.create(otpPayload);
  console.log("OTP Body", otpBody);
  res.status(200).json({
    success:true,
    message:"Otp send successfuly"
  })
});
