import { useEffect, useState } from "react";
import { dummyStudentEnrolled } from "../../assets/assets";
import Loading from "../../components/student/Loading";
import { useContext } from "react";
import { AppContext } from "../../context/AppContext.jsx";
import { toast } from "react-toastify";
import axios from "axios";

const StudentsEnrolled = () => {
  const { BeUrl, iseducator, getToken } = useContext(AppContext);

  const [enrolledStudents, setEnrolledStudents] = useState(null);
  console.log(enrolledStudents);

  const fetchEnrolledStudents = async () => {
    try {
      const token = await getToken();
      const { data } = await axios.get(
        `${BeUrl}/api/educator/enrolled-students`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (data.success) {
        setEnrolledStudents(data.enrolledStudents.reverse());
      }else{
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    if (iseducator) {
      fetchEnrolledStudents();
    }
  }, [iseducator]);

  console.log(enrolledStudents);

  return enrolledStudents ? (
    <>
      <div className="min-h-screenv  flex flex-col items-start justify-between md:p-8 md:pb-0 p-4 pt-8 pb-0">
        <div className="flex flex-col shadow-md  items-center max-w-4xl w-full overflow-hidden rounded-md bg-white border border-gray-500/20">
          <table className="table-fixed  md:table-auto w-full overflow-hidden pb-4">
            <thead className=" text-gray-900 border-b border-gray-500/20 text-sm text-left">
              <tr>
                <th className="px-4 py-3 font-semibold text-center hidden sm:table-cell">
                  #
                </th>
                <th className="px-4 py-3 font-semibold">Student Name</th>
                <th className="px-4 py-3 font-semibold">Course Title</th>
                <th className="px-4 py-3 font-semibold hidden sm:table-cell">
                  Enrollment Date
                </th>
              </tr>
            </thead>
            <tbody>
              {enrolledStudents.map((students, index) => (
                <tr
                  key={index}
                  className="border-b border-gray-200 hover:bg-gray-50 text-gray-500 text-sm"
                >
                  <td className="px-4 py-3 text-center hidden sm:table-cell">
                    {index + 1}
                  </td>
                  <td className="flex items-center gap-2 px-4 py-3">
                    <img
                      className="w-6 rounded-[50%]"
                      src={students.student.imageUrl}
                      alt=""
                    />
                    <span className="truncate">{students.student.name}</span>
                  </td>
                  <td className="px-4 py-3 truncate">{students.courseTitle}</td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    {new Date(students.purchaseDate).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  ) : (
    <Loading />
  );
};

export default StudentsEnrolled;
