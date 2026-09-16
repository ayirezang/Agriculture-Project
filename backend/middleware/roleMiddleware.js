const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    // ==========================================
    // CHECK IF USER IS AUTHENTICATED
    // ==========================================
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Not authorized. Please login first.",
      });
    }

    // ==========================================
    // ONLY ALLOW VALID SYSTEM ROLES
    // ==========================================
    const validRoles = ["farmer", "buyer"];

    if (!validRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Invalid user role.",
      });
    }

    // ==========================================
    // CHECK ROUTE-SPECIFIC PERMISSION
    // ==========================================
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to access this resource.",
      });
    }

    next();
  };
};

module.exports = {
  authorizeRoles,
};