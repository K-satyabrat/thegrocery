import mongoose from "mongoose";
import { configDotenv } from "dotenv";
import colors from "colors";
configDotenv()

if (!process.env.MONGO_URL) {
  throw new Error(
    "please provide Mongo_Uri in .env file"
  )
}

async function connnectDB() {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URL,);
    console.log(`MongoDb database connected ${conn.connection.host}`.bgBlue);
  } catch (error) {
    console.log(`mongo error`, error)
    process.exit(1)
  }
}

export default connnectDB;