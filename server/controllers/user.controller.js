import UserModel from "../models/user.model.js";
import bcryptjs from "bcryptjs";
import { sendEmail } from "../config/sendEmail.js";
import { verifingEmailTemplate } from "../utils/verifingEmailTemplate.js";
import { configDotenv } from "dotenv";
import genetatedAccessToken from "../utils/generateAccessToken.js";
import genetatedRefreshToken from "../utils/generateRefreshToken.js";
import uploadImageCloudinary from "../utils/uploadImageCloudinary.js";
import generateOtp from "../utils/generateOtp.js";
import { forgotPasswordTamplate } from "../utils/forgotPasswordTamplate.js";
configDotenv();

// user registration
export async function registerUser(req, res) {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "please provide all fields",
      });
    }
    const existUser = await UserModel.findOne({ email });
    if (existUser) {
      return res.status(400).json({
        success: false,
        message: "Already register user",
      });
    }
    const salt = await bcryptjs.genSalt(10);
    const hassPassword = await bcryptjs.hash(password, salt);

    const newUser = await new UserModel({
      name,
      email,
      password: hassPassword,
    });
    const save = await newUser.save();

    const verifyEmailUrl = `${process.env.FRONTENT_URL}/verify-email?code=${save?._id}`;

    const verifyEmail = await sendEmail({
      sendTo: email,
      subject: "verify email from thegrocery",
      html: verifingEmailTemplate({
        name,
        url: verifyEmailUrl,
      }),
    });
    return res.status(201).json({
      success: true,
      error: false,
      message: "User register Successfully",
      data: save,
    });
  } catch (error) {
    console.error("Error adding product:", error);
    return res.status(500).json({
      success: false,
      error: true,
      message: error.message,
    });
  }
}

export async function verifyEamil(req, res) {
  try {
    const { code } = req.body;
    const user = await UserModel.findOne({ _id: code });
    if (!user) {
      return res.status(400).json({
        message: "Invalid code",
        error: true,
        success: false,
      });
    }
    const updateUser = await UserModel.updateOne(
      { _id: code },
      { verify_email: true }
    );
    return res.json({
      message: "Verifing email successfull",
      success: true,
      error: false,
    });
  } catch (error) {
    console.error("Error adding product:", error);
    return res.status(500).json({
      success: false,
      error: true,
      message: error.message,
    });
  }
}

//Login controller
export async function loginController(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        message: "Please provide email and Password",
        success: false,
        error: true,
      });
    }

    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(400).json({
        message: "User is not registered",
        success: false,
        error: true,
      });
    }
    if (user.status !== "active") {
      return res.status(400).json({
        message: "contact to admin",
        success: false,
        error: true,
      });
    }

    const checkPassword = await bcryptjs.compare(password, user.password);
    if (!checkPassword) {
      return res.status(400).json({
        message: "check password",
        success: false,
        error: true,
      });
    }
    const accessToken = await genetatedAccessToken(user._id);
    const refreshToken = await genetatedRefreshToken(user._id);

    const cookiesOption = {
      httpOnly: true,
      secure: true,
      sameSite: "None",
    };
    res.cookie("accessToken", accessToken, cookiesOption);
    res.cookie("refreshToken", refreshToken, cookiesOption);

    res.status(200).json({
      message: "Login Successfull",
      success: true,
      error: false,
      data: {
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: true,
      message: error.message,
    });
  }
}

//Logout controller
export async function logout(req, res) {
  try {
    const cookiesOption = {
      httpOnly: true,
      secure: true,
      sameSite: "None",
    };

    res.clearCookie("accessToken", cookiesOption);
    res.clearCookie("refreshToken", cookiesOption);
    return res.status(200).json({
      message: "Logout Successfully",
      success: true,
      error: false,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: true,
      message: error.message,
    });
  }
}

// upload User Avatar
export async function uploadAvatar(req, res) {
  try {
    const userId = req.userId; // from auth middleware
    console.log(userId);
    const image = req.file; // from multer middleware
    const upload = await uploadImageCloudinary(image);
    const updateUser = await UserModel.findByIdAndUpdate(userId, {
      avatar: upload.url,
    });
    return res.json({
      message: "update profile",
      data: { _id: userId, avatar: upload.url },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: true,
      message: error.message,
    });
  }
}

//update user details
export async function updateUserDetails(req, res) {
  try {
    const userId = req.userId;
    const { name, email, mobile, password } = req.body;
    let hassPassword = "";
    if (password) {
      let salt = await bcryptjs.genSalt(10);
      hassPassword = await bcryptjs.hash(password, salt);
    }
    const updateUser = await UserModel.updateOne(
      { _id: userId },
      {
        ...(name && { name: name }),
        ...(email && { email: email }),
        ...(mobile && { mobile: mobile }),
        ...(password && { password: hassPassword }),
      }
    );

    return res.status(200).json({
      message: "User updated succesfullu",
      success: true,
      data: updateUser,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: true,
      message: error.message,
    });
  }
}

// Forget password(user has not login)
export async function forgetPasswordController(req, res) {
  try {
    const { email } = req.body;
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(400).json({
        message: "email is not available",
        success: true,
      });
    }
    const otp = generateOtp();
    const expireTime = new Date() + 60 * 60 * 1000; //1h
    const update = await UserModel.findByIdAndUpdate(user._id, {
      forgot_password: otp,
      forgot_password_expiry: new Date(expireTime).toISOString(),
    });

    await sendEmail({
      sendTo: email,
      subject: "forgot password from thegrocery",
      html: forgotPasswordTamplate({
        name: user.name,
        otp: otp,
      }),
    });
    console.log(user.name, otp);

    return res.json({
      message: "check you email",
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: true,
      message: error.message,
    });
  }
}

//Verify forgot password otp
export async function verifyForgotPasswordOtp(req, res) {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({
        success: true,
        message: "Please Provide all required Fields",
      });
    }
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(400).json({
        message: "email is not available",
        success: true,
      });
    }
    const currentTime = new Date().toISOString()
    if (user.forgot_password_expiry < currentTime) {
      return res.status(400).json({
        message: "Otp is expired",
        success: false,
      });
    }

    if (otp !== user.forgot_password) {
      return res.status(400).json({
        message: "Invalid otp",
        success: false,
        error: true,
      });
    }
    return res.status(200).json({
      message: "Otp is successfully verified",
      success: true,
      error: false,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: true,
      message: error.message || error,
    });
  }
}

//reset the password
export async function resetpassword(request,response){
    try {
        const { email , newPassword, confirmPassword } = request.body 

        if(!email || !newPassword || !confirmPassword){
            return response.status(400).json({
                message : "provide required fields email, newPassword, confirmPassword"
            })
        }

        const user = await UserModel.findOne({ email })

        if(!user){
            return response.status(400).json({
                message : "Email is not available",
                error : true,
                success : false
            })
        }

        if(newPassword !== confirmPassword){
            return response.status(400).json({
                message : "newPassword and confirmPassword must be same.",
                error : true,
                success : false,
            })
        }

        const salt = await bcryptjs.genSalt(10)
        const hashPassword = await bcryptjs.hash(newPassword,salt)

        const update = await UserModel.findOneAndUpdate(user._id,{
            password : hashPassword
        })

        return response.json({
            message : "Password updated successfully.",
            error : false,
            success : true
        })

    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}
