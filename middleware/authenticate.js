const { verifyAccessToken } = require('../services/jwtservice');

const authenticate = async (req, res, next) => {
  const token = req.cookies?.accessToken 

  if (!token) {
    return res.status(401).json({ message: "Access token missing" });
  }

  try {
    const user = await verifyAccessToken(token);
    req.user = user;
    next();
  } catch (err) {
    console.error("Token verification failed:", err.message);
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};

module.exports = authenticate;
