import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import adviceRoutes from "./routes/advice.js";
import userRoutes from "./routes/user.js";
import transactionRoutes from "./routes/transactions.js";

dotenv.config();

const app = express();
app.use(cors());

app.use(express.json());
app.use("/api/advice", adviceRoutes);
app.use("/api/user", userRoutes);
app.use("/api/transactions", transactionRoutes);

app.get("/", (req, res) => {
    res.send("FinBridge backend is running.");
})

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${Port}`));