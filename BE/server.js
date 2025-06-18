import cors from "cors";
import "dotenv/config";
import express from "express";
import connectDB from "./configs/mongodb.js";
import { clerkWebhooks, stripeWebhooks } from "./controllers/webhooks.js";
import educatorRouter from "./routes/educatorRoutes.js";
import { clerkMiddleware } from "@clerk/express";
import connectCloudinary from "./configs/cloundinary.js";
import courseRouter from "./routes/courseRoutes.js";
import userRouter from "./routes/userRoutes.js";
import bodyParser from "body-parser";

//Initialize Express
const app = express();

//Connect to MongoDB
connectDB();

//Connect to Cloudinary
connectCloudinary();

//Port
const PORT = process.env.PORT || 5000;

//Middlewares
app.use(cors());

app.post(
  "/stripe",
  bodyParser.raw({ type: "application/json" }),
  stripeWebhooks
);
console.log("Configured webhook route with raw body parser: /stripe");

app.use(express.json());
app.use(clerkMiddleware());

//API Routes
app.get("/", (req, res) => {
  res.send("Welcome to the API!");
});
app.post("/clerk", express.json(), clerkWebhooks);
app.use("/api/educator", educatorRouter);
app.use("/api/course", courseRouter);
app.use("/api/user", userRouter);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
