const router = require("express").Router();
const {signup,login,saveProfile} = require("../controllers/userController");

router.post("/signup", signup);
router.post("/login", login);
router.post("/profile", saveProfile);

module.exports = router;