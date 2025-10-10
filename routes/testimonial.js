const express = require("express");
const router = express.Router();
const testimonialController = require("../controllers/testimonialController");
const { protect, authorize } = require("../controllers/authController");
const { uploadFields } = require("../middlewares/uploadTestimonial");

// Create testimonial (users)
router.post(
  "/",
  protect,
  uploadFields,
  testimonialController.createTestimonial
);

// Update testimonial (admin)
router.put(
  "/:id",
  protect,
  authorize("admin"),
  uploadFields,
  testimonialController.updateTestimonial
);

// Delete testimonial (admin)
router.delete(
  "/:id",
  protect,
  authorize("admin"),
  testimonialController.deleteTestimonial
);

// Public
router.get("/", testimonialController.getTestimonials);
router.get("/:id", testimonialController.getTestimonial);

module.exports = router;
