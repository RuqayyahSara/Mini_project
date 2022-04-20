var express = require('express');
var router = express.Router();
const config = require("config");
const bcrypt = require("bcryptjs");
const { check, validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
var gravatar = require('gravatar');

const User = require("../models/User")
const auth = require("../middleware/auth");

// signup route
router.post(
  "/signup",
  [
    check("name", "Enter name")
      .not().isEmpty(),
    check("email", "Enter valid email address").isEmail(),
    check(
      "password",
      "Your password must contain minimum 8 characters and atleast one special character and Upper case character"
    ).isLength({ min: 8 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.msg });
    }
    try {
      const { name, email, password, password2} = req.body;

      // check email already exists
      const ifEmail = await User.findOne({ email: email });
      if (ifEmail) {
        return res.status(400).send({ msg: "Email already exists" });
      }
      // confirm password

      if (password === password2) {
      const avatar = gravatar.url(email, {s: '200', r: 'pg', d: 'mm'});
        var newUser = new User({name, email, password, password2, avatar});
      }
      else {
        res.status(400).send({ msg: "Passwords do not match" });
      }
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(newUser.password, salt);
      newUser.password = hash;
      newUser.password2 = hash;
      const savedb = await newUser.save();
      res.send({ savedb, msg: "Signup successful" });
    } catch (err) {
      res.status(404).json({ errors: [{ msg: "Error saving into DB" }] });
    }
  }
);

// login route
router.post("/login", [
  check("email", "Enter valid email address").isEmail(),
  check('password', "Your password must contain minimum 8 characters").isLength({ min: 8 })
],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    const { email, password } = req.body;
    try {
      // check if email exists in the DB
      const user = await User.findOne({ email: email });
      if (!user) {
        return res.msg({ msg: "Please signup before logging in!" });
      }
      //comparing passwords
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(404).json({ msg: "Invalid credentials" });
      }
      // creating payload
      const payload = {
        id: user.id,
        role: user.role
      };

      // creating Authorization token
      const token = jwt.sign(payload, config.get("secretKey"), { expiresIn: Math.floor(Date.now() / 1000) + (60 * 120) });
      res.status(200).json({ auth: true,role:user.role,token: token })
      console.log("authorization successful");
    }
    catch (err) {
      return res.status(500).json({ msg: "Login error!" });
    }
  }
);

// get private profile details
router.get("/user", auth, async (req, res) => {
  try {
    let user = await User.findById(req.user.id, "-password2 -password");
    if (user) {
      return res.json({ user, loggedIn: true, msg: "Auth success" });
    }
    res.status(201).json({ loggedIn: false, msg: "No profile found for this user" });
  }
  catch (err) {
    res.status(400).send("Access denied!");
  }
})

module.exports = router;
