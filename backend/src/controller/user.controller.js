import { User } from "../models/user.models.js";
import ApiError from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import AsyncWrap from "../utils/AsyncWrap.js";

const isProduction = process.env.NODE_ENV === "production";

// Cross-site cookies require Secure + SameSite=None in production (HTTPS);
// locally over HTTP we use Lax so the browser stores and sends the cookie.
const cookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "none" : "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

function safeUser(user) {
  return { _id: user._id, username: user.username, email: user.email };
}

const signUp = AsyncWrap(async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    throw new ApiError(400, "All field require");
  }

  const userfind = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (userfind) {
    throw new ApiError(400, "Username or email already exsist");
  }

  const user = await User.create({ username, email, password });

  const token = user.generateAccessToken();

  return res
    .status(200)
    .cookie("token", token, cookieOptions)
    .json(new ApiResponse(200, safeUser(user), "Successfully login"));
});

const Login = AsyncWrap(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "Email and password are required");
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(401, "Invalid email or password");
  }

  const isMatch = await user.isPasswordCorrect(password);
  if (!isMatch) {
    throw new ApiError(401, "Invalid email or password");
  }

  const token = user.generateAccessToken();

  return res
    .status(200)
    .cookie("token", token, cookieOptions)
    .json(new ApiResponse(200, safeUser(user), "Login successful"));
});

const userLogin = AsyncWrap(async (req, res) => {
  // verifyJWT guarantees req.user is set by the time we get here.
  return res.status(200).json(new ApiResponse(200, req.user, "User login"));
});

const profileLogout = AsyncWrap(async (req, res) => {
  return res
    .status(200)
    .clearCookie("token", cookieOptions)
    .json(new ApiResponse(200, "User logout"));
});

export { signUp, Login, profileLogout, userLogin };
