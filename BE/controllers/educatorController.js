import { clerkClient } from "@clerk/express";
import Course from "../models/courseModel.js";
import { v2 as cloudinary } from "cloudinary";
import Purchase from "../models/purchaseModel.js";
import User from "../models/userModel.js";

//update role to educator
export const updateRoleToEducator = async (req, res) => {
  try {
    const userId = req.auth.userId;

    await clerkClient.users.updateUserMetadata(userId, {
      publicMetadata: {
        role: "educator",
      },
    });

    res
      .status(200)
      .json({ success: true, message: "You can publish a course now" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

//Add New Course
export const addCourse = async (req, res) => {
  try {
    const { courseData } = req.body;
    const imageFile = req.file;
    const educatorId = req.auth.userId;

    if (!imageFile) {
      return res
        .status(400)
        .json({ success: false, message: "Please upload a course thumbnail" });
    }

    const parsedCourseData = await JSON.parse(courseData);
    parsedCourseData.educator = educatorId;

    const newCourse = await Course.create(parsedCourseData);
    const imageUpload = await cloudinary.uploader.upload(imageFile.path);
    newCourse.courseThumbnail = imageUpload.secure_url;

    await newCourse.save();

    res
      .status(201)
      .json({ success: true, message: "Course added successfully", newCourse });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

//Get Educator Courses
export const getEducatorCourses = async (req, res) => {
  try {
    const educator = req.auth.userId;
    const courses = await Course.find({ educator });
    res.status(200).json({
      success: true,
      message: "Educator Courses Fetched Successfully",
      courses,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Educator Dashboard Data {Earnings, Enrolled Students, No.of courses}

export const educatorDashboardData = async (req, res) => {
  try {
    const educator = req.auth.userId;
    const courses = await Course.find({ educator });
    const totalCourses = courses.length;

    const courseIds = courses.map((course) => course._id);

    //Calculate total earnings from purchase
    const purchase = await Purchase.find({
      courseId: { $in: courseIds },
      status: "completed",
    });

    const totalEarnings = purchase.reduce(
      (sum, purchase) => sum + purchase.amount,
      0
    );

    //Collect student enrolled Id's with their course titles
    const enrolledStudentsData = [];

    for (const course of courses) {
      const students = await User.find(
        {
          _id: { $in: course.enrolledStudents },
        },
        "name imageUrl"
      );

      students.forEach((student) => {
        enrolledStudentsData.push({
          courseTitle: course.courseTitle,
          student,
        });
      });
    }

    res.status(200).json({
      success: true,
      message: "Educator Dashboard Data Fetched Successfully",
      dasboardData: {
        totalEarnings,
        enrolledStudentsData,
        totalCourses,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

//Get Enrolled Students Data with Purchase Data
export const getEnrolledStudentsData = async (req, res) => {
  try {
    const educator = req.auth.userId;
    const courses = await Course.find({ educator });
    const courseIds = courses.map((course) => course._id);

    const purchase = await Purchase.find({
      courseId: { $in: courseIds },
      status: "completed",
    })
      .populate("userId", "name imageUrl")
      .populate("courseId", "courseTitle");

    const enrolledStudents = purchase.map((purchase) => ({
      student: purchase.userId,
      courseTitle: purchase.courseId.courseTitle,
      purchaseDate: purchase.createdAt,
    }));

    res.status(200).json({
      success: true,
      message: "Enrolled Students Data Fetched Successfully",
      enrolledStudents,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
