import Course from "../models/courseModel.js";

//Get All Courses
export const getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find({ isPublished: true })
      .select([`-courseContent`, `-enrolledStudents`])
      .populate({ path: "educator" });
    res.status(200).json({
      success: true,
      message: "All Courses Fetch Successfully!",
      courses,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Course by Id
export const getCourseById = async (req, res) => {
  const { id } = req.params;
  try {
    const courseData = await Course.findById(id).populate({ path: "educator" });

    if (!courseData) {
      return res.status(404).json({
        success: false,
        message: "Please Enter a Valid Course Id",
      });
    }

    //Remove lectureUrl if is PreviewFree is false
    courseData.courseContent.forEach((chapter) => {
      chapter.chapterContent.forEach((lecture) => {
        if (!lecture.isPreviewFree) {
          lecture.lectureUrl = "";
        }
      });
    });

    res.status(200).json({
      success: true,
      message: "Course Fetched Successfully!",
      courseData,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

