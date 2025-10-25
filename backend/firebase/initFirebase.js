import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import fs from "fs";


const rawPath = process.env.FIREBASE_SA_PATH || process.env.GOOGLE_APPLICATION_CREDENTIALS || "";
const saPath = rawPath && rawPath.trim();

if (!saPath) {
    throw new Error(
        "FIREBASE_SA_PATH or GOOGLE_APPLICATION_CREDENTIALS is not set. Set it to the path of your service account JSON."
    );
}

let app;
if (saPath) {
    const serviceAccount = JSON.parse(fs.readFileSync(saPath, "utf8"));
    app = initializeApp({
        credential: cert(serviceAccount),
    });
} else {
    app = initializeApp();
}

export const db = getFirestore(app);