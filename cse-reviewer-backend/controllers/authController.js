// controllers/authController.js
const { User } = require('../models'); // ✅ Import from models/index.js
const jwt = require('jsonwebtoken');
const { logActivity } = require('../middleware/activityTracker'); // ✅ ADD THIS

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// @desc    Register user
// @route   POST /api/auth/signup
// @access  Public
exports.signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ where: { email } });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
    });

    // ✅ ADD THIS - Log registration activity
    await logActivity(
      user.id,
      'user_register',
      `${user.name} created an account`,
      { email: user.email },
      req
    );

    // Generate token
    const token = generateToken(user.id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Error creating user', error: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    // Check for admin credentials
    if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
      // Find or create admin user
      let admin = await User.findOne({ where: { email: process.env.ADMIN_EMAIL } });
      
      if (!admin) {
        admin = await User.create({
          name: 'Admin',
          email: process.env.ADMIN_EMAIL,
          password: process.env.ADMIN_PASSWORD,
          role: 'admin',
        });
      }

      // ✅ ADD THIS - Log admin login
      await logActivity(
        admin.id,
        'user_login',
        `${admin.name} (Admin) logged in`,
        { email: admin.email, isAdmin: true },
        req
      );

      const token = generateToken(admin.id);

      return res.status(200).json({
        success: true,
        token,
        isAdmin: true,
        user: {
          id: admin.id,
          name: admin.name,
          email: admin.email,
          role: 'admin',
        },
      });
    }

    // Check for regular user
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isPasswordCorrect = await user.comparePassword(password);

    if (!isPasswordCorrect) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Update last active
    user.lastActive = new Date();
    await user.save();

    // ✅ ADD THIS - Log user login
    await logActivity(
      user.id,
      'user_login',
      `${user.name} logged in`,
      { email: user.email },
      req
    );

    // Generate token
    const token = generateToken(user.id);

    res.status(200).json({
      success: true,
      token,
      isAdmin: false,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        testsCompleted: user.testsCompleted,
        avgScore: user.avgScore,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Error logging in', error: error.message });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);

    res.status(200).json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        testsCompleted: user.testsCompleted,
        avgScore: user.avgScore,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user', error: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/update-profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;

    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.name = name || user.name;
    user.email = email || user.email;

    await user.save();

    // ✅ ADD THIS - Log profile update
    await logActivity(
      req.user.id,
      'profile_updated',
      `${user.name} updated their profile`,
      { fields: Object.keys(req.body) },
      req
    );

    res.status(200).json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating profile', error: error.message });
  }
};