const express = require("express");
const router = express.Router();
const testimonialController = require("../controllers/testimonialController");
const { protect, authorize } = require("../controllers/authController");
const upload = require("../middlewares/uploadTestimonial");

// Use 'media' here to match frontend
router.post(
  "/",
  protect,
  upload.single("media"),
  testimonialController.createTestimonial
);

router.put(
  "/:id",
  protect,
  authorize("admin"),
  upload.single("media"),
  testimonialController.updateTestimonial
);

router.delete(
  "/:id",
  protect,
  authorize("admin"),
  testimonialController.deleteTestimonial
);

router.get("/", testimonialController.getTestimonials);
router.get("/:id", testimonialController.getTestimonial);

module.exports = router;
