import express from "express";
import {
  getEnrolledCourses,
  getUserData,
  purchaseCourse,
} from "../controllers/userController.js";

const userRouter = express.Router();

//Get User Data - /api/user/data
userRouter.get("/data", getUserData);

//Get User Enrolled courses - /api/user/enrolled-courses
userRouter.get("/enrolled-courses", getEnrolledCourses);

//Purchase cours - /api/user/purchase
userRouter.post("/purchase", purchaseCourse);

export default userRouter;
