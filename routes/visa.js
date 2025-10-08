const express = require("express");
const router = express.Router();
const visaController = require("../controllers/visaController");
const { protect, authorize } = require("../controllers/authController");
const upload = require("../middlewares/upload");

router.get("/", visaController.getVisas);
router.get("/:id", visaController.getVisa);

router.post("/", protect, upload.single("image"), visaController.createVisa);
router.put("/:id", protect, upload.single("image"), visaController.updateVisa);
router.delete("/:id", protect, authorize("admin"), visaController.deleteVisa);

module.exports = router;
