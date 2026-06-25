import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.set("trust proxy", 1);
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

import ProfileRout from "./routes/profile.routes.js";

import ProjectRout from "./routes/project.routes.js";

import UserRout from "./routes/user.routes.js";

app.use("/profile", ProfileRout);

app.use("/project", ProjectRout);

app.use("/user", UserRout);

app.use((error, req, res, next) => {
  res.status(error.statusCode || 500).json({
    status: error.statusCode || 500,
    message: error.message || "Internal server error",
  });
});

export default app;
