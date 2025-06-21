import { useContext, useEffect, useState } from "react";
import { AppContext } from "../../context/AppContext";
import Loading from "../../components/student/Loading";
import { toast } from "react-toastify";
import axios from "axios";

const MyCources = () => {
  const { currency, BeUrl, iseducator, getToken } = useContext(AppContext);
  const [courses, setCourses] = useState(null);
  console.log(courses)

  const fetchEducatorCourses = async () => {
    try {
      const token = await getToken();
      const { data } = await axios.get(`${BeUrl}/api/educator/courses`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      data.success && setCourses(data.courses);
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    if (iseducator) {
      fetchEducatorCourses();
    }
  }, [iseducator]);

  return courses ? (
    <>
      <div className="h-screen flex flex-col items-start justify-between md:p-8 md:pb-0 p-4 pt-8 pb-0 ">
        <div className="w-full">
          <h1 className="pb-4 text-lg font-medium">My Cources</h1>
          <div className="flex flex-col items-center max-w-4xl w-full overflow-hidden rounded-md bg-white shadow-md border-t border-gray-200">
            <table className="md:table-auto table-fixed w-full overflow-hidden">
              <thead className="text-gray-900 border-b border-gray-500/20 text-sm text-left">
                <tr>
                  <th className="px-4 py-3 truncate">All Courses</th>
                  <th className="px-4 py-3 truncate">Earnings</th>
                  <th className="px-4 py-3 truncate">Students</th>
                  <th className="px-4 py-3 truncate">Published On</th>
                </tr>
              </thead>
              <tbody className="text-gray-500 text-sm">
                {courses.map((course) => (
                  <tr
                    key={course._id}
                    className="border-b border-gray-200 hover:bg-gray-50"
                  >
                    <td className="md:px-4 pl-2 md:pl-4 py-3 flex items-center space-x-3 truncate">
                      <img
                        className="w-16"
                        src={course?.courseThumbnail}
                        alt=""
                      />
                      <span className="truncate hidden md:block">
                        {course?.courseTitle}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {currency}{" "}
                      {Math.floor(
                        course?.enrolledStudents?.length *
                          (course?.coursePrice -
                            (course?.discount * course?.coursePrice) / 100)
                      )}
                    </td>
                    <td className="px-4 py-3 ">
                      {course?.enrolledStudents?.length}
                    </td>
                    <td className="px-4 py-3 truncate">
                      {new Date(course?.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  ) : (
    <Loading />
  );
};

export default MyCources;
