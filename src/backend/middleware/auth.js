// Middleware to check if user is authenticated
export const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({
    success: false,
    message: 'You must be logged in to access this resource',
  });
};

// Middleware to check if user is NOT authenticated (for login/signup pages)
export const isNotAuthenticated = (req, res, next) => {
  if (!req.isAuthenticated()) {
    return next();
  }
  return res.status(400).json({
    success: false,
    message: 'You are already logged in',
  });
};

// Optional authentication (doesn't block if not authenticated)
export const optionalAuth = (req, res, next) => {
  next();
};
