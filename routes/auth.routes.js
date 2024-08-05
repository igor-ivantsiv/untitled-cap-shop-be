const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const router = require("express").Router();
const mongoose = require("mongoose");

const User = require("../models/User.model");
const {
  isAuthenticated,
  authorizeRole,
} = require("../middlewares/route-guard.middleware");

// register
router.post("/register", async (req, res, next) => {
  const salt = bcrypt.genSaltSync(13);
  //console.log("REQ BODY: ", req.body)
  const passwordHash = bcrypt.hashSync(req.body.password, salt);

  try {
    const newUser = await User.create({
      ...req.body,
      passwordHash,
    });

    res.status(201).json(newUser);
  } catch (error) {
    if (error.code === 11000) {
      res.status(409).json({ message: "Username already taken" });
    }
    next(error);
  }
});

// login
router.post("/login", async (req, res, next) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (user && bcrypt.compareSync(password, user.passwordHash)) {
      const payload = {
        userId: user._id,
        username: user.username,
        role: user.role,
      };

      const token = jwt.sign(payload, process.env.TOKEN_SECRET, {
        algorithm: "HS256",
        expiresIn: "6h",
      });

      res.status(200).json({ token });
    } else {
      res.status(403).json({ message: "incorrect password or username" });
      // what else should be done here?
    }
  } catch (error) {
    next(error);
  }
});

// verify
router.get("/verify", isAuthenticated, (req, res, next) => {
  // changed to only send required data back 
  res.status(200).json({
    userId: req.tokenPayload.userId,
    role: req.tokenPayload.role,
  });
  //res.status(200).json({message: "token validated"})
});

router.get(
  "/verify/admin",
  isAuthenticated,
  authorizeRole,
  (req, res, next) => {
    //res.status(200).json(req.tokenPayload);
    res.status(200).json({ message: "admin token validated" });
  }
);


module.exports = router;
