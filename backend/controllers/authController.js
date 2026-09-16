const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");

// ==========================================
// CREATE JWT TOKEN
// ==========================================
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );
};

// ==========================================
// REGISTER USER
// ==========================================
const registerUser = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      password,
      role,
      location,
    } = req.body;

    // ==========================================
    // CHECK REQUIRED FIELDS
    // ==========================================
    if (!name || !email || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email, phone and password are required",
      });
    }

    // ==========================================
    // ONLY FARMER AND BUYER ARE ALLOWED
    // ==========================================
    if (!role || !["farmer", "buyer"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Please select either farmer or buyer",
      });
    }

    // ==========================================
    // CHECK PASSWORD LENGTH
    // ==========================================
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    // ==========================================
    // NORMALIZE EMAIL
    // ==========================================
    const normalizedEmail = email.toLowerCase().trim();

    // ==========================================
    // CHECK IF EMAIL ALREADY EXISTS
    // ==========================================
    const existingEmail = await User.findOne({
      email: normalizedEmail,
    });

    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: "A user with this email already exists",
      });
    }

    // ==========================================
    // CHECK IF PHONE ALREADY EXISTS
    // ==========================================
    const existingPhone = await User.findOne({
      phone: phone.trim(),
    });

    if (existingPhone) {
      return res.status(400).json({
        success: false,
        message: "A user with this phone number already exists",
      });
    }

    // ==========================================
    // HASH PASSWORD
    // ==========================================
    const hashedPassword = await bcrypt.hash(password, 10);

    // ==========================================
    // CREATE USER
    // ==========================================
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      phone: phone.trim(),
      password: hashedPassword,
      role,
      location: {
        town: location?.town?.trim() || "",
        region: location?.region?.trim() || "",
        latitude: location?.latitude,
        longitude: location?.longitude,
      },
    });

    // ==========================================
    // CREATE JWT
    // ==========================================
    const token = generateToken(user);

    // ==========================================
    // RETURN USER WITHOUT PASSWORD
    // ==========================================
    res.status(201).json({
      success: true,
      message: "Registration successful",
      token,

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        location: user.location,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);

    // ==========================================
    // HANDLE MONGOOSE DUPLICATE KEY ERROR
    // ==========================================
    if (error.code === 11000) {
      const duplicateField = Object.keys(error.keyPattern || {})[0];

      return res.status(400).json({
        success: false,
        message:
          duplicateField === "email"
            ? "A user with this email already exists"
            : duplicateField === "phone"
            ? "A user with this phone number already exists"
            : "A user with this information already exists",
      });
    }

    // ==========================================
    // HANDLE OTHER ERRORS
    // ==========================================
    res.status(500).json({
      success: false,
      message: "Server error during registration",
    });
  }
};

// ==========================================
// LOGIN USER
// ==========================================
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // ==========================================
    // CHECK REQUIRED FIELDS
    // ==========================================
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // ==========================================
    // FIND USER
    // ==========================================
    const user = await User.findOne({
      email: email.toLowerCase().trim(),
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // ==========================================
    // CHECK ACCOUNT STATUS
    // ==========================================
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Your account has been deactivated",
      });
    }

    // ==========================================
    // CHECK ROLE
    // ==========================================
    if (!["farmer", "buyer"].includes(user.role)) {
      return res.status(403).json({
        success: false,
        message: "Invalid account role. Please contact support.",
      });
    }

    // ==========================================
    // CHECK PASSWORD
    // ==========================================
    const passwordMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // ==========================================
    // CREATE JWT
    // ==========================================
    const token = generateToken(user);

    // ==========================================
    // RETURN USER + TOKEN
    // ==========================================
    res.status(200).json({
      success: true,
      message: "Login successful",
      token,

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        location: user.location,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    res.status(500).json({
      success: false,
      message: "Server error during login",
    });
  }
};

// ==========================================
// GET ALL BUYERS
// ==========================================
const getBuyers = async (req, res) => {
  try {
    const buyers = await User.find({
      role: "buyer",
      isActive: true,
    })
      .select("name email phone role location createdAt")
      .sort({ createdAt: -1 });

    const formattedBuyers = buyers.map((buyer) => ({
      id: buyer._id,
      name: buyer.name,
      email: buyer.email,
      phone: buyer.phone,

      type: "Buyer",

      region:
        buyer.location?.region || "Location not provided",

      town: buyer.location?.town || "",

      deals: 0,

      rating: 0,

      crops: "Not specified",

      verified: "Registered",
    }));

    res.status(200).json({
      success: true,
      count: formattedBuyers.length,
      buyers: formattedBuyers,
    });
  } catch (error) {
    console.error("Get buyers error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while loading buyers",
    });
  }
};

// ==========================================
// EXPORT CONTROLLERS
// ==========================================
module.exports = {
  registerUser,
  loginUser,
  getBuyers,
};