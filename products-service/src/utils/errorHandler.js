const errorHandler = (error, req, res, next) => {
  if (error.name === "CastError") {
    return res.status(400).json({ error: "malformatted id" });
  }
  next();
};

module.exports = errorHandler;
