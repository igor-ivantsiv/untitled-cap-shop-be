const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const router = require("express").Router();

const User = require("../models/User.model");

// register
router.post("/register", async (req, res, next) => {
  const salt = bcrypt.genSaltSync(13);
  const passwordHash = bcrypt.hashSync(req.body.password, salt);

  try {
    const newUser = await User.create({
      ...req.body,
      passwordHash,
    });

    res.status(201).json(newUser);
  } catch (error) {
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
    }
    else {
        res.status(403).json({ message: "incorrect password or username"})
    }
  } catch (error) {
    next(error);
  }
});

// verify

router.get("/", async (req, res, next) => {
    try {
        const users = await User.find();
        res.status(200).json(users);
    } catch (error) {
        next(error)
    }
})

module.exports = router;
