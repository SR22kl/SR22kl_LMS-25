import express from "express";
import {
  addCourse,
  educatorDashboardData,
  getEducatorCourses,
  getEnrolledStudentsData,
  updateRoleToEducator,
} from "../controllers/educatorController.js";
import upload from "../configs/multer.js";
import { protectEducator } from "../middlewares/authMiddleware.js";

const educatorRouter = express.Router();

// Add educator Role -/api/educator/update-role
educatorRouter.get("/update-role", updateRoleToEducator);

// Add course -/api/educator/add-course
educatorRouter.post(
  "/add-course",
  upload.single("image"),
  protectEducator,
  addCourse
);

// Get educator courses -/api/educator/courses
educatorRouter.get("/courses", getEducatorCourses, protectEducator);

// Get educator dashboard data -/api/educator/dashboard
educatorRouter.get("/dashboard", protectEducator, educatorDashboardData);

//Get enrolled students data -/api/educator/enrolled-students
educatorRouter.get(
  "/enrolled-students",
  protectEducator,
  getEnrolledStudentsData
);

export default educatorRouter;
