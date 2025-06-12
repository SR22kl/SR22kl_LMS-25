import express from "express";
import cors from "cors";
import "dotenv/config";
import nodemon from "nodemon";
import { connect } from "mongoose";
import connectDB from "./configs/mongodb.js";
import { clerkWebhooks } from "./controllers/webhooks.js";

//Initialize Express
const app = express();

//Connect to MongoDB
connectDB();

//Port
const PORT = process.env.PORT || 5000;

//Middlewares
app.use(cors());
app.use(express.json());

//Routes
app.get("/", (req, res) => {
  res.send("Welcome to the API!");
});

app.post("/clerk", express.json(), clerkWebhooks);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
