import express from "express";
import {
  addUserRating,
  getEnrolledCourses,
  getUserCourseProgress,
  getUserData,
  purchaseCourse,
  updateUserCourseProgress,
} from "../controllers/userController.js";

const userRouter = express.Router();

//Get User Data - /api/user/data
userRouter.get("/data", getUserData);

//Get User Enrolled courses - /api/user/enrolled-courses
userRouter.get("/enrolled-courses", getEnrolledCourses);

//Purchase cours - /api/user/purchase
userRouter.post("/purchase", purchaseCourse);

//Update user course - api/user/update-course
userRouter.put("/update-course-progress", updateUserCourseProgress);

//Get user course progress - api/user/course-progress
userRouter.put("/get-course-progress", getUserCourseProgress);

//Add Course Ratings - api/user/course-rating
userRouter.put("/add-rating", addUserRating);

export default userRouter;
