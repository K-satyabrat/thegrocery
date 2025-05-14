import jwt from "jsonwebtoken";
export const auth = async (req, res, next) => {
  try {
    const token =
      req.cookies.accessToken || req?.header?.authorization?.split(" ")[1];
    console.log(token)
    if (!token) {
      return res.status(400).json({
        message: "Provide token  ",
      });
    }
    const decode = await jwt.verify(
      token,
      process.env.SECRETE_KEY_ACCESS_TOKEN
    );
    if(!decode){
        return res.status(401).json({
            message:"Unauthorized access",
            error:true,
            success:false
        })
    }
    req.userId = decode.id
    next()
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      success: false,
      error: true,
    });
  }
};
