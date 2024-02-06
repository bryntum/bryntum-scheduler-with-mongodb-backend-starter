import express from "express";
import cors from "cors";
import "./loadEnvironment.js";
import "express-async-errors";
import scheduler from "./routes/scheduler.js";

const PORT = process.env.PORT || 5050;
const app = express();

const corsOptions = {
  origin: process.env.FRONTEND_URL,
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
  credentials: true,
};

app.use(cors(corsOptions));

app.use(express.json());

// Load the /api routes
app.use("/api", scheduler);

// Global error handling
app.use((err, _req, res, next) => {
  res.status(500).send("Uh oh! An unexpected error occured.");
});

// start the Express server
app.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
});
