import "dotenv/config";
import express from "express";
import adviceRoutes from "./routes/advice.js";
import userRoutes from "./routes/user.js";
import transactionRoutes from "./routes/transactions.js";
import translateRoutes from "./routes/translate.js";

async function runTests() {
  const app = express();
  app.use(express.json());
  app.use("/api/advice", adviceRoutes);
  app.use("/api/user", userRoutes);
  app.use("/api/transactions", transactionRoutes);
  app.use("/api/translate", translateRoutes);
  app.get("/", (req, res) => res.send("FinBridge backend is running."));

  const server = app.listen(0);

  await new Promise((resolve) => server.once("listening", resolve));
  const { port } = server.address();
  const baseUrl = `http://127.0.0.1:${port}`;

  async function logFetch(name, url, options = {}) {
    try {
      const res = await fetch(url, options);
      const contentType = res.headers.get("content-type") || "";
      let body;
      if (contentType.includes("application/json")) {
        body = await res.json();
      } else {
        body = await res.text();
      }
      console.log(`${name} -> status ${res.status}`, body);
    } catch (error) {
      console.error(`${name} -> request failed`, error.message);
    }
  }

  await logFetch("Root", `${baseUrl}/`);
  await logFetch("Transactions default", `${baseUrl}/api/transactions/default`);
  await logFetch("Transactions user123", `${baseUrl}/api/transactions/user123`);

  await logFetch("Translate endpoint", `${baseUrl}/api/translate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: "Hello", targetLang: "es" }),
  });

  await logFetch("Advice endpoint", `${baseUrl}/api/advice`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message: "I live in India and want to manage my expenses better while supporting my parents’ medical costs and saving for Diwali gifts.",
      language: "hi",
      culture: "Indian",
    }),
  });

  await logFetch("User GET missing", `${baseUrl}/api/user/user123`);

  await logFetch("User PUT update", `${baseUrl}/api/user/user123`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ language: "es", culture: "Spanish" }),
  });

  server.close();
}

runTests().catch((error) => {
  console.error("Test runner crashed:", error);
  process.exitCode = 1;
});
