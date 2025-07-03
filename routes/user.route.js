const express = require("express");
const UserModel = require("../model/user.model");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const route = express.Router();



route.get("/register", (req, res) => {
  res.render("register");
});


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
      res.redirect('/home')
       res.status(201).json({
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
  

    // SELECT the password explicitly
    const user = await UserModel.findOne({ email }).select("+password");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }


    if (!user.password) {
      return res.status(500).json({ error: "Password is missing" });
    }

    try {
      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(400).json({ error: "Password does not match" });
      }

      const token = jwt.sign({
        userId:user._id,
        email:user.email,
        password:user.password
      },process.env.JWT_SECRET)

       res.cookie('token',token,{
        httpOnly:true
      })
    res.redirect('/home')

       res.send('User Login')
    } catch (err) {
      console.error("Error comparing passwords:", err.message);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

);

route.get('/logout',(req,res)=>{
  res.clearCookie('token')
  res.redirect('/user/login')
})

route.get("/data", async (req, res) => {
  const data = await UserModel.find();
  res.json(data);
});
module.exports = route;
