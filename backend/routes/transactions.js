import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const mockData = JSON.parse(
    fs.readFileSync(path.join(__dirname, "../data/mockTransactions.json"), "utf8")
);

router.get("/:id", (req, res) => {
    const userData = mockData[req.params.id] || mockData["default"];
    res.json(userData);
});

export default router;