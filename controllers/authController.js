const asyncHandler = require("../middlewares/asyncHandler");
const User = require("../models/Client");
const jwt = require("jsonwebtoken");

// helper: sign and send token in cookie + JSON body
function sendTokenResponse(user, res, statusCode = 200) {
  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  };

  // send cookie + return token in body
  res
    .status(statusCode)
    .cookie("token", token, cookieOptions)
    .json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        token, // ✅ include token in JSON body (for Authorization header)
      },
    });
}

// @desc Register new user
exports.register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    const err = new Error("Name, email and password are required");
    err.statusCode = 400;
    throw err;
  }

  const existing = await User.findOne({ email });
  if (existing) {
    const err = new Error("Email already in use");
    err.statusCode = 400;
    throw err;
  }

  const user = await User.create({ name, email, password, role });
  sendTokenResponse(user, res, 201);
});

// @desc Login user
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    const err = new Error("Please provide email and password");
    err.statusCode = 400;
    throw err;
  }

  const user = await User.findOne({ email });
  if (!user || !(await user.comparePassword(password))) {
    const err = new Error("Invalid credentials");
    err.statusCode = 401;
    throw err;
  }

  sendTokenResponse(user, res);
});

// @desc Logout user
exports.logout = asyncHandler(async (req, res) => {
  res.clearCookie("token");
  res.json({ success: true, message: "Logged out" });
});

// @desc Protect routes (cookie OR Authorization header)
exports.protect = asyncHandler(async (req, res, next) => {
  let token;

  // 1️⃣ Check HTTP-only cookie first
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  // 2️⃣ Fallback: Authorization header (Safari or mobile)
  else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    const err = new Error("Not authorized, no token");
    err.statusCode = 401;
    throw err;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user) {
      const err = new Error("User not found with this token");
      err.statusCode = 401;
      throw err;
    }

    next();
  } catch (err) {
    err.statusCode = 401;
    throw err;
  }
});

// @desc Role-based authorization
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      const err = new Error("Not authorized for this route");
      err.statusCode = 403;
      throw err;
    }
    next();
  };
};

// @desc    Verify current user (cookie or Authorization header)
// @route   GET /api/auth/verify
// @access  Private
exports.verify = asyncHandler(async (req, res) => {
  let token;

  // ✅ 1. Check cookie first
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }
  // ✅ 2. Fallback: Authorization header
  else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    const err = new Error("No token found");
    err.statusCode = 401;
    throw err;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      const err = new Error("User not found");
      err.statusCode = 401;
      throw err;
    }

    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    err.statusCode = 401;
    throw err;
  }
});
