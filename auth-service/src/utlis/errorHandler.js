const errorHandler = (error, req, res, next) => {
  if (error.name === "JsonWebTokenError") {
    return res.status(401).json({ error: "token invalid" });
  }
  next();
};

module.exports = errorHandler;
