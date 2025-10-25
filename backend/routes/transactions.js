import express from "express";
import mockData from "../data/mockTransactions.json" assert {type: "json"};

const router = express.Router();

router.get("/:id", (req, res) => {
    const userData = mockData[req.params.id] || mockData["default"];
    res.json(userData);
});

export default router;