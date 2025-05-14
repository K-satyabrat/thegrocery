import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import morgan from "morgan";
import connnectDB from "./config/connectDb.js";
import userRouter from "./routes/user.routes.js";

dotenv.config();
connnectDB();
const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(cors({ Credential: true, origin: process.env.FRONTENT_URL }));
app.use(express.json());
app.use(cookieParser());
app.use(morgan("combined"));
app.use(helmet({ contentSecurityPolicy: false }));

app.get("/", (req, res) => res.send("Hare Krishna"));
app.use("/api/user", userRouter);

const PORT = process.env.PORT || 8001;
app.listen(8000, () => {

  console.log(`server running at http://localhost:${PORT}`);
});
