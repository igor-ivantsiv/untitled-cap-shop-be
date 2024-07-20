const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const router = require("express").Router();

const User = require("../models/User.model");
const { isAuthenticated, authorizeRole } = require("../middlewares/route-guard.middleware");

// register
router.post("/register", async (req, res, next) => {
  const salt = bcrypt.genSaltSync(13);
  console.log("REQ BODY: ", req.body)
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
  res.status(200).json(req.tokenPayload);
  //res.status(200).json({message: "token validated"})
});

router.get("/verify/admin", isAuthenticated, authorizeRole, (req, res, next) => {
    //res.status(200).json(req.tokenPayload);
    res.status(200).json({message: "admin token validated"})
})

// get all users (test)
router.get("/", async (req, res, next) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
});


module.exports = router;
