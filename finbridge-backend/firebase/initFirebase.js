
import * as admin from 'firebase-admin/app';
import {getAuth} from 'firebase-admin/auth';
import {getFirestore} from "firebase-admin/firestore";
import serviceAccount from "./serviceAccountKey.json" with {type:"json"}
import { initializeApp, getApps, cert } from "firebase-admin/app";

let app;



if(getApps().length===0){
    app=initializeApp({
    
        credential: cert(serviceAccount)
    });
}else{
    app=getApps([0]);
}

export const db=getFirestore(app);
export const auth=getAuth();