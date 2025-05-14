import { Router } from "express";
import {
  forgetPasswordController,
  loginController,
  logout,
  registerUser,
  resetpassword,
  updateUserDetails,
  uploadAvatar,
  verifyEamil,
  verifyForgotPasswordOtp,
} from "../controllers/user.Controller.js";
import { auth } from "../middlewares/auth.js";
import upload from "../middlewares/multer.js";

const userRouter = Router();

userRouter.post("/register", registerUser);
userRouter.post("/verify-email", verifyEamil);
userRouter.post("/login", loginController);
userRouter.get("/logout", auth, logout);
userRouter.put("/upload-avatar", auth, upload.single("avatar"), uploadAvatar);
userRouter.put("/update-user", auth, updateUserDetails);
userRouter.put("/forgot-password-otp", forgetPasswordController);
userRouter.put("/verify-forgot-password-otp",verifyForgotPasswordOtp);
userRouter.put("/reset-password",resetpassword);

export default userRouter;
