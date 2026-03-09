const express = require("express");
const User = require("../models/user");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");

const router = express.Router();

router.post(
  "/signup",
  catchAsync(async (req, res, next) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return next(new AppError("All feilds are required"));
    }

    const user = await User.create({
      name,
      email,
      password,
      role: "user",
    });
    res.status(200).json({
      status: "success",
      data: user,
    });
  }),
);

router.post(
  "/login",
  catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    // 1️⃣ Validate input
    if (!email || !password) {
      return next(new AppError("Please provide email and password", 400));
    }

    // 2️⃣ Find user (include password)
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return next(new AppError("Invalid email or password", 401));
    }

    // 3️⃣ Compare password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return next(new AppError("Invalid email or password", 401));
    }

    // 4️⃣ Generate token
    const token = generateToken(user._id);

    // 5️⃣ Hide password
    user.password = undefined;

    // 6️⃣ Send response
    res.status(200).json({
      status: "success",
      token,
      data: user,
    });
  })
);