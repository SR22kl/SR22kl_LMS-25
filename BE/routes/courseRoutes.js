import express from "express";
import {
  getAllCourses,
  getCourseById,
} from "../controllers/courseController.js";

const courseRouter = express.Router();

// Get All Courses- /api/courses/all-courses
courseRouter.get("/all", getAllCourses);

//Get Course by Id- /api/course/:id
courseRouter.get("/:id", getCourseById);

export default courseRouter;
