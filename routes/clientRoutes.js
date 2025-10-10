const express = require("express");
const router = express.Router();
const {
  getAllClients,
  getClientById,
  updateClient,
  deleteClient,
} = require("../controllers/clientController");

const { protect, authorize } = require("../controllers/authController");

// ✅ Protect all routes & allow only admin access
router.use(protect);
router.use(authorize("admin"));

router.get("/", getAllClients);
router.get("/:id", getClientById);
router.put("/:id", updateClient);
router.patch("/:id", updateClient);
router.delete("/:id", deleteClient);

module.exports = router;
