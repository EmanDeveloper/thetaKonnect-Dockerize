import jwt from "jsonwebtoken";
import ApiError from "../utils/ApiError.js";
import AsyncWrap from "../utils/AsyncWrap.js";

function decodeToken(token) {
  const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  return {
    _id: decoded._id,
    email: decoded.email,
    username: decoded.username,
  };
}

// Strict: requires a valid token cookie, otherwise rejects the request.
const verifyJWT = AsyncWrap(async (req, res, next) => {
  const token = req.cookies?.token;
  if (!token) {
    throw new ApiError(401, "Please login first");
  }
  try {
    req.user = decodeToken(token);
  } catch (err) {
    throw new ApiError(401, "Invalid or expired token");
  }
  next();
});

// Soft: populates req.user when a valid token is present, but never blocks.
const attachUser = AsyncWrap(async (req, res, next) => {
  const token = req.cookies?.token;
  if (token) {
    try {
      req.user = decodeToken(token);
    } catch (err) {
      // Ignore invalid/expired tokens for optional auth.
    }
  }
  next();
});

export { verifyJWT, attachUser };
