import jwt from "jsonwebtoken";
import UserModel from "../models/user.model.js";

const genetatedRefreshToken = async (userId) => {
  const token = await jwt.sign(
    { id: userId },
    process.env.SECRETE_KEY_REFRESH_TOKEN,
    { expiresIn: "7d" }
  );
  const updateRefreshToken = await UserModel.updateOne(
    { _id: userId },
    { refresh_token: token }
  );

  return token;
};

export default genetatedRefreshToken;
