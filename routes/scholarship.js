const express = require("express");

const router = express.Router();

const scholarshipController = require("../controllers/scholarshipController");

const { protect, authorize } = require("../controllers/authController");

const upload = require("../middlewares/upload");

// public: list and get single
router.get("/", scholarshipController.getScholarships);
router.get("/:id", scholarshipController.getScholarship);

// protected: create/update/delete
router.post(
  "/",
  protect,
  upload.single("image"),
  scholarshipController.createScholarship
);

router.put(
  "/:id",
  protect,
  upload.single("image"),
  scholarshipController.updateScholarship
);

router.delete(
  "/:id",
  protect,
  authorize("admin"),
  scholarshipController.deleteScholarship
);

router.get("/:id/related", scholarshipController.getRelatedScholarships);
router.get("/recent/posts", scholarshipController.getRecentPosts);

module.exports = router;
