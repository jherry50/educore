import dotenv from "dotenv";
import app from "./app.js";
import { connectDatabase } from "./config/database.js";

dotenv.config();

await connectDatabase(process.env.MONGO_URI);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 EduCore API running on http://localhost:${PORT}`);
});