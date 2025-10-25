import {db} from "./initFirebase.js";

import mockData from "./fireData/mockTransactions.json" with {type:'json'};


async function loadMockData(){

    for(const userId in mockData){
        const userRef =db.collection("users").doc(userId);

        const userSnap=await userRef.get();

        if(!userSnap.exists){
            await userRef.set(mockData[userId]);
            console.log(`created user`);
        }else{
            console.log("Skipping");
        }
    }
    console.log("firebase loading");
}

loadMockData().catch(error => {
  console.error("Error loading mock data:", error);
  process.exit(1); // Exit with an error code
});