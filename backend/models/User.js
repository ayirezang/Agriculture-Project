const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    // ==========================================
    // BASIC USER INFORMATION
    // ==========================================
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
    },

    // ==========================================
    // USER ROLE
    // ONLY FARMER OR BUYER
    // ==========================================
    role: {
      type: String,
      enum: ["farmer", "buyer"],
      required: true,
    },

    // ==========================================
    // USER LOCATION
    // ==========================================
    location: {
      town: {
        type: String,
        trim: true,
      },

      region: {
        type: String,
        trim: true,
      },

      latitude: {
        type: Number,
      },

      longitude: {
        type: Number,
      },
    },

    // ==========================================
    // ACCOUNT STATUS
    // ==========================================
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);