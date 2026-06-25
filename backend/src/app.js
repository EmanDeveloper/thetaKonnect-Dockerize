import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import session from "express-session";

import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local"
import { User } from "./models/user.models.js";

import MongoStore from "connect-mongo"

const app = express();

app.set("trust proxy",1);
app.use(
  cors({
    origin: "https://theta-konnect.netlify.app",
    credentials: true,
  })
);


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


app.use(
  session({
    store:MongoStore.create({
      mongoUrl:process.env.DB_URL,
      crypto:{
        secret:process.env.session_secret 
      },
      touchAfter:24*3600,
    }),
    secret: process.env.session_secret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      secure: true,
      sameSite:"none"
    }
   
  })
);



app.use(passport.initialize())
app.use(passport.session())
passport.use(
  new LocalStrategy({ usernameField: 'email' }, User.authenticate())
);
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

import ProfileRout from "./routes/profile.routes.js";

import ProjectRout from "./routes/project.routes.js";

import UserRout from "./routes/user.routes.js"

app.use("/profile", ProfileRout);

app.use("/project", ProjectRout);

app.use("/user",UserRout)

app.use((error, req, res, next) => {
  res.status(error.statusCode || 500).json({
    status: error.statusCode || 500,
    message: error.message || "Internal server error",
  });
});

export default app;
