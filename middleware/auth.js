import jwt from "jsonwebtoken";

const auth = async (req, res, next) => {
  try {
    const token = req.headers.token;

    if (!token) {
      return res.json({ success: false, message: "Not Authorized Login Again" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

  
    req.userId = decoded.id;

    next();

  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export default auth;