import { Router } from "express";
import { signUp,Login,profileLogout,userLogin} from "../controller/user.controller.js";
import { verifyJWT } from "../middleware/login.middleware.js";


const router =Router()

router.route("/signup").post(signUp);
router.route("/login").post(Login)
router.route("/userlogout").get(profileLogout)
router.route("/navlogin").get(verifyJWT, userLogin)


export default router