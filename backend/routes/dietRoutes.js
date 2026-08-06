const router = require("express").Router();
const {generatePlan} = require("../controllers/dietController");

router.post("/generate-plan", generatePlan);

module.exports = router;