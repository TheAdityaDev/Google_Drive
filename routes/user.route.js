const express = require("express");
const UserModel = require("../model/user.model");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const route = express.Router();

route.get("/test", (req, res) => {
  res.send("Hello");
});

route.get("/register", (req, res) => {
  res.render("register");
});

// route.post(
//   "/register",
//   [
//     body("username")
//       .isLength({ min: 3 })
//       .withMessage("Username must be at least 3 characters"),
//     body("email").isEmail().withMessage("Invalid email"),
//     body("password")
//       .isLength({ min: 8 })
//       .withMessage("Password must be at least 8 characters"),
//   ],
//   async (req, res) => {
//     const error = validationResult(req);

//     if (!error.isEmpty()) {
//       return res.status(400).json({ error: error.array() });
//     }

//     try {
//       const { username, email, password } = req.body;
//       const hashPassword = await bcrypt.hash(password, 10);

//       const user = await UserModel.create({
//         username: username,
//         email: email,
//         password: hashPassword, // ✅ Corrected this line
//       });
//        const userWithoutPassword = user.toObject();
//       delete userWithoutPassword.password;

//       console.log("User registered:", user);
//       return res.status(201).json({ message: "User registered successfully" });
//     } catch (err) {
//       console.error("Registration error:", err.message);
//       return res.status(500).json({ error: "Internal Server Error" });
//     }
//   }
// );

route.post(
  "/register",
  [
    body("username")
      .isLength({ min: 3 })
      .withMessage("Username must be at least 3 characters"),
    body("email").isEmail().withMessage("Invalid email"),
    body("password")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password } = req.body;

    try {
      // Check if email already exists
      const existingUser = await UserModel.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ error: "Email already registered" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create new user
      const newUser = await UserModel.create({
        username,
        email,
        password: hashedPassword,
      });

      // Force password remove before sending
      const sanitizedUser = newUser.toObject(); // or newUser.toJSON()
      delete sanitizedUser.password;

      // Password will be removed automatically due to toJSON()
      return res.status(201).json({
        message: "User registered successfully",
        user: newUser,
      });
    } catch (err) {
      console.error("Error in registration:", err.message);
      return res.status(500).json({ error: "Server error" });
    }
  }
);
route.get("/login", (req, res) => {
  res.render("login");
});

route.post(
  "/login",
  [
    body("email").isEmail().withMessage("Invalid email"),
    body("password")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters"),
  ],
  async (req, res) => {
    const error = validationResult(req);
    if (!error.isEmpty()) {
      return res.status(400).json({ error: error.array() });
    }

    const { email, password } = req.body;
    console.log("Incoming email:", email);
    console.log("Incoming password:", password);

    // SELECT the password explicitly
    const user = await UserModel.findOne({ email }).select("+password");

    if (!user) {
      console.log("User not found");
      return res.status(404).json({ error: "User not found" });
    }

    console.log("Stored hash:", user.password);

    if (!user.password) {
      console.log("Password field is missing on the user document");
      return res.status(500).json({ error: "Password is missing" });
    }

    try {
      const isMatch = await bcrypt.compare(password, user.password);
      console.log("Password match:", isMatch);

      if (!isMatch) {
        return res.status(400).json({ error: "Password does not match" });
      }

      return res.status(200).json({ message: "Login successful", user });
    } catch (err) {
      console.error("Error comparing passwords:", err.message);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
);

route.get("/data", async (req, res) => {
  const data = await UserModel.find();
  res.json(data);
});
module.exports = route;
