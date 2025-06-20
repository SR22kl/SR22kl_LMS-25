import { useContext, useEffect, useState } from "react";
import { AppContext } from "../../context/AppContext";
import { useNavigate } from "react-router-dom";
import { Line } from "rc-progress";
import Footer from "../../components/student/Footer";
import axios from "axios";
import { toast } from "react-toastify";

const MyEnrollments = () => {
  const {
    enrollCourses,
    calculateCourseDuration,
    userData,
    getToken,
    fetchEnrolledCourses,
    BeUrl,
    calculateNoOfLectures,
  } = useContext(AppContext);
  const [progressArray, setProgressArray] = useState([]);

  const getCourseProgress = async () => {
    try {
      const token = await getToken();
      const tempProgressArray = await Promise.all(
        enrollCourses.map(async (course) => {
          const { data } = await axios.post(
            `${BeUrl}/api/user/get-course-progress`,
            {
              courseId: course._id,
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          let totalLectures = calculateNoOfLectures(course);

          const lectureCompleted = data.progressData
            ? data.progressData.lectureCompleted.length
            : 0;

          return { totalLectures, lectureCompleted };
        })
      );
      setProgressArray(tempProgressArray);
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    fetchEnrolledCourses();
  }, [userData]);

  useEffect(() => {
    if (enrollCourses.length > 0) {
      getCourseProgress();
    }
  }, [enrollCourses]);

  const navigate = useNavigate();

  return (
    <>
      <div className="md:px-36 px-8 pt-10 md:mb-[100px] mb-[200px]">
        <h1 className="text-2xl font-semibold">My Enrollments</h1>
        <table className="md:table-auto table-fixed w-full overflow-hidden border border-gray-500/30 mt-10">
          <thead className="text-gray-900 border-b border-gray-500/20 text-sm text-left max-sm:hidden">
            <tr>
              <th className="px-4 py-3 font-semibold truncate">Course</th>
              <th className="px-4 py-3 font-semibold truncate">Duration</th>
              <th className="px-4 py-3 font-semibold truncate">Completed</th>
              <th className="px-4 py-3 font-semibold truncate">Status</th>
            </tr>
          </thead>
          <tbody className="text-gray-700">
            {enrollCourses.map((course, index) => (
              <tr className="border-b border-gray-500/20" key={index}>
                <td className="md:px-4 pl-2 md:pl-4 py-3 flex items-center space-x-3">
                  <img
                    src={course.courseThumbnail}
                    className="w-14 sm:w-24 md:w-28"
                    alt="ct"
                  />
                  <div className="flex-1">
                    <p className="mb-1 max-sm:text-xs">{course.courseTitle}</p>

                    <Line
                      strokeWidth={2}
                      percent={
                        progressArray[index]
                          ? (progressArray[index].lectureCompleted * 100) /
                            progressArray[index].totalLectures
                          : 0
                      }
                      className="bg-gray-300 rounded-full"
                    />
                  </div>
                </td>
                <td className="px-4 py-3 max-sm:hidden">
                  {calculateCourseDuration(course)}
                </td>
                <td className="px-4 py-3 max-sm:hidden">
                  {progressArray[index] &&
                    `${progressArray[index].lectureCompleted}/${progressArray[index].totalLectures}`}
                  <span>Lectures</span>
                </td>
                <td className="px-4 py-3 max-sm:text-right">
                  <button
                    onClick={() => navigate(`/player/${course._id}`)}
                    className="px-3 sm:px-5 py-1.5 sm:py-2 bg-violet-600 max-sm:text-xs text-white rounded cursor-pointer"
                  >
                    {progressArray[index] &&
                    progressArray[index].lectureCompleted /
                      progressArray[index].totalLectures ===
                      1
                      ? "Completed"
                      : "On Going"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Footer />
    </>
  );
};

export default MyEnrollments;
