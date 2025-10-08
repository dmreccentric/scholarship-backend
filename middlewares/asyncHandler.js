// simple wrapper to catch async errors (or use express-async-handler package)
module.exports = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
