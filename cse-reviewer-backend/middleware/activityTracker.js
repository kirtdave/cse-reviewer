// middleware/activityTracker.js
const Activity = require('../models/Activity');
const User = require('../models/User');

/**
 * Middleware to update user's lastActive timestamp
 */
const updateLastActive = async (req, res, next) => {
  if (req.user && req.user.id) {
    try {
      await User.update(
        { lastActive: new Date() },
        { where: { id: req.user.id } }
      );
    } catch (error) {
      console.error('Error updating lastActive:', error.message);
    }
  }
  next();
};

/**
 * Helper function to log activities throughout the app
 */
const logActivity = async (userId, type, action, metadata = null, req = null) => {
  try {
    const ipAddress = req ? (req.ip || req.connection.remoteAddress) : null;
    
    await Activity.create({
      userId,
      type,
      action,
      metadata,
      ipAddress
    });
    
    console.log(`✅ Activity logged: ${type} - ${action}`); // ✅ FIXED THIS LINE
  } catch (error) {
    console.error('❌ Error logging activity:', error.message);
  }
};

module.exports = {
  updateLastActive,
  logActivity
};