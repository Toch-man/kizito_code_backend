import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();

// SIGNUP ROUTE
router.post("/sign_up", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Ensure all fields are filled
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Please provide all credentials" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user with completedCourses = 0 by default
    const user = new User({
      name,
      email,
      password: hashedPassword,
    });

    await user.save();

    // Create token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(201).json({
      message: "User created successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!password || !email) {
      res.status(400).json({ message: "procide complete credential" });
    }

    //check if user exist
    const existing_user = await User.findOne({ email });
    if (!existing_user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    //compare password password
    const is_match = await bcrypt.compare(password, User.password);
    if (!is_match) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      {
        userId: User._id,
      },
      process.env.JWT_SECRET,
      { expires: "7d" }
    );

    res.json({
      message: "Login succesful",
      token,
      user: {
        id: User._id,
        name: User.name,
        email: User.email,
      },
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      message: "server error",
    });
  }
});

export default router;
