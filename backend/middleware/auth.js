const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'electrorec_super_secret_jwt_key_2026';

const requireAdmin = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No authentication token provided.',
    });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.admin = decoded;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired authentication session. Please login again.',
    });
  }
};

module.exports = { requireAdmin, JWT_SECRET };
