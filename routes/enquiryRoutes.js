const express = require("express");
const { sendEnquiry } = require("../controllers/enquiryController.js");

const router = express.Router();
router.post("/", sendEnquiry);

module.exports = router;
