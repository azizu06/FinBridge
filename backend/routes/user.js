import express from "express";
import {db} from "../firebase/initFirebase.js";
import {doc, getDoc, setDoc} from "firebase/firestore";

const router = express.Router();

router.get("/:id", async (req, res) => {
    try {
        const userRef = doc(db, "users", req.params.id);
        const userSnap = await getDoc(userRef);

        if(userSnap.exists()) {
            res.json(userSnap.data());
        }
        else {
            res.status(404).json({ message: "User not found"});
        }
    } catch(error) {
        console.error("Get user error:", error);
        res.status(500).json({ error: "Failed to fetch user data"});
    }
});

router.put("/:id", async (req, res) => {
    try {
        const {language, culture} = req.body;
        await setDoc(doc(db, "users", req.params.id), {language, culture}, {merge: true});
    } catch(error){
        console.error("Update user error:", error);
        res.status(500).json({ error: "Failed to update user data"});
    }
});

export default router;