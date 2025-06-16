import mongoose from "mongoose";

const lectureSchema = new mongoose.Schema(
  {
    lectureId: {
      type: String,
      require: true,
    },
    lectureTitle: {
      type: String,
      require: true,
    },
    lectureUrl: {
      type: String,
      require: true,
    },
    lectureDuration: {
      type: Number,
      require: true,
    },
    isPreviewFree: {
      type: Boolean,
      require: true,
    },
    lectureOrder: {
      type: Number,
      require: true,
    },
  },
  { _id: false }
);

const chapterSchema = new mongoose.Schema(
  {
    chapterId: {
      type: String,
      require: true,
    },
    chapterOrder: {
      type: Number,
      require: true,
    },
    chapterTitle: {
      type: String,
      require: true,
    },
    chapterContent: [lectureSchema],
  },
  { _id: false }
);

const courseSchema = new mongoose.Schema(
  {
    courseTitle: {
      type: String,
      require: true,
    },
    courseDescription: {
      type: String,
      require: true,
    },
    courseThumbnail: { type: String },
    coursePrice: {
      type: Number,
      require: true,
    },
    discount: {
      type: Number,
      require: true,
      min: 0,
      max: 100,
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
    courseContent: [chapterSchema],
    courseRating: [
      { userId: { type: String }, rating: { type: Number, min: 1, max: 5 } },
    ],
    educator: { type: String, ref: "User", required: true },
    enrolledStudents: [{ type: String, ref: "User" }],
  },
  { timestamps: true, minimize: false }
);

const Course = mongoose.model("Course", courseSchema);

export default Course;


//Dummy courseData

// {
//   "courseTitle": "Test course 1",
//   "courseDescription": "Test course description",
//   "coursePrice": "50",
//   "discount": "20",
//   "courseContent": [
//     {
//       "chapterId": "ch01",
//       "chapterOrder": "1",
//       "chapterTitle": "Test chapter 1",
//       "chapterContent": [
//         {
//           "lectureId": "lect01",
//           "lectureTitle": "Test lecture 1",
//           "lectureUrl": "https://youtu.be/-HeadgoqJ7A",
//           "lectureDuration": "20",
//           "isPreviewFree": true,
//           "lectureOrder": "1"
//         }
//       ]
//     }
//   ] 
// }