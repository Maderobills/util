import express from "express";
import cors from "cors";

const app = express();

// ✅ Allow your frontend domain
app.use(cors({
  origin: "https://util-psi.vercel.app", // your Vercel frontend URL
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true
}));

// Parse JSON
app.use(express.json());

// Example route
app.get("/api/test", (req, res) => {
  res.json({ message: "Backend is working!" });
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});
