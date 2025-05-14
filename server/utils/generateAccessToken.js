import jwt from "jsonwebtoken";

const genetatedAccessToken = async (userId) => {
  const token = await jwt.sign(
    { id: userId },
    process.env.SECRETE_KEY_ACCESS_TOKEN,
    { expiresIn: "12h" }
  );
  return token
};

export default genetatedAccessToken;
