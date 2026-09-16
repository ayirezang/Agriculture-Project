const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// ==========================================
// GENERATE JWT TOKEN
// ==========================================
const generateToken = (userId, role) => {
  return jwt.sign(
    {
      id: userId,
      role,
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
    console.log("REGISTER BODY:", req.body);

    const {
      name,
      email,
      phone,
      password,
      role,
      location,
    } = req.body;

    // ------------------------------------------
    // CHECK REQUIRED FIELDS
    // ------------------------------------------
    if (!name || !email || !phone || !password) {
      return res.status(400).json({
        success: false,
        message:
          "Name, email, phone and password are required",
      });
    }

    // ------------------------------------------
    // CHECK ROLE
    // ------------------------------------------
    if (!role || !["farmer", "buyer"].includes(role)) {
      return res.status(400).json({
        success: false,
        message:
          "Please select either farmer or buyer",
      });
    }

    // ------------------------------------------
    // CLEAN INPUT
    // ------------------------------------------
    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone.trim();

    if (!cleanName) {
      return res.status(400).json({
        success: false,
        message: "Name cannot be empty",
      });
    }

    // ------------------------------------------
    // CHECK EMAIL
    // ------------------------------------------
    const existingEmail = await User.findOne({
      email: cleanEmail,
    });

    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message:
          "A user with this email already exists",
      });
    }

    // ------------------------------------------
    // CHECK PHONE
    // ------------------------------------------
    const existingPhone = await User.findOne({
      phone: cleanPhone,
    });

    if (existingPhone) {
      return res.status(400).json({
        success: false,
        message:
          "A user with this phone number already exists",
      });
    }

    // ------------------------------------------
    // HASH PASSWORD
    // ------------------------------------------
    const hashedPassword = await bcrypt.hash(
      password,
      10
    );

    // ------------------------------------------
    // CREATE USER
    // ------------------------------------------
    const user = await User.create({
      name: cleanName,
      email: cleanEmail,
      phone: cleanPhone,
      password: hashedPassword,
      role,
      location,
    });

    // ------------------------------------------
    // GENERATE TOKEN
    // ------------------------------------------
    const token = generateToken(
      user._id,
      user.role
    );

    // ------------------------------------------
    // RESPONSE
    // ------------------------------------------
    res.status(201).json({
      success: true,
      message: "Account created successfully",
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
    console.error(
      "Registration error:",
      error
    );

    // Handle duplicate MongoDB fields
    if (error.code === 11000) {
      const duplicateField =
        Object.keys(error.keyPattern || {})[0];

      return res.status(400).json({
        success: false,
        message: `A user with this ${duplicateField} already exists`,
      });
    }

    res.status(500).json({
      success: false,
      message:
        "Server error during registration",
    });
  }
};

// ==========================================
// LOGIN USER
// ==========================================
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // ------------------------------------------
    // CHECK REQUIRED FIELDS
    // ------------------------------------------
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message:
          "Email and password are required",
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    // ------------------------------------------
    // FIND USER
    // ------------------------------------------
    const user = await User.findOne({
      email: cleanEmail,
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid email or password",
      });
    }

    // ------------------------------------------
    // CHECK ACCOUNT STATUS
    // ------------------------------------------
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message:
          "Your account has been deactivated",
      });
    }

    // ------------------------------------------
    // CHECK PASSWORD
    // ------------------------------------------
    const isPasswordCorrect =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid email or password",
      });
    }

    // ------------------------------------------
    // GENERATE TOKEN
    // ------------------------------------------
    const token = generateToken(
      user._id,
      user.role
    );

    // ------------------------------------------
    // RESPONSE
    // ------------------------------------------
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
    console.error(
      "Login error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Server error during login",
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
      region: buyer.location?.region || "Location not provided",
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
// EXPORT
// ==========================================
module.exports = {
  registerUser,
  loginUser,
  getBuyers,
};