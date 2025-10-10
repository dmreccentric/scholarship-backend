const asyncHandler = require("../middlewares/asyncHandler");
const Client = require("../models/Client");

// @desc    Get all clients
// @route   GET /api/clients
// @access  Private/Admin
exports.getAllClients = asyncHandler(async (req, res) => {
  const clients = await Client.find().select("-password");
  res.status(200).json({
    success: true,
    count: clients.length,
    data: clients,
  });
});

// @desc    Get single client
// @route   GET /api/clients/:id
// @access  Private/Admin
exports.getClientById = asyncHandler(async (req, res) => {
  const client = await Client.findById(req.params.id).select("-password");
  if (!client) {
    const err = new Error("Client not found");
    err.statusCode = 404;
    throw err;
  }

  res.status(200).json({ success: true, data: client });
});

// @desc    Update client (admin can change name, email, role)
// @route   PUT /api/clients/:id
// @access  Private/Admin
exports.updateClient = asyncHandler(async (req, res) => {
  const { name, email, role } = req.body;

  const client = await Client.findById(req.params.id);
  if (!client) {
    const err = new Error("Client not found");
    err.statusCode = 404;
    throw err;
  }

  // 🧱 Protect super admin first (before modifying anything)
  if (client.email === "eccentricecc481@gmail.com") {
    return res.status(403).json({
      success: false,
      message: "You cannot modify the super admin account",
    });
  }

  // ✅ Only admins can edit users
  if (req.user.role === "admin") {
    client.name = name || client.name;
    client.email = email || client.email;

    // ✅ Allow role change (only user/admin)
    if (role && ["user", "admin"].includes(role)) {
      client.role = role;
    }
  }

  await client.save();

  res.status(200).json({
    success: true,
    message: "Client updated successfully",
    data: {
      id: client._id,
      name: client.name,
      email: client.email,
      role: client.role,
    },
  });
});

// @desc    Delete client
// @route   DELETE /api/clients/:id
// @access  Private/Admin
exports.deleteClient = asyncHandler(async (req, res) => {
  const client = await Client.findById(req.params.id);
  if (!client) {
    const err = new Error("Client not found");
    err.statusCode = 404;
    throw err;
  }

  await client.deleteOne();

  res.status(200).json({
    success: true,
    message: "Client deleted successfully",
  });
});
