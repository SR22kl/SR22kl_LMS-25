import { useContext, useEffect, useState } from "react";
import { assets, dummyDashboardData } from "../../assets/assets";
import Loading from "../../components/student/Loading";
import { AppContext } from "../../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";

const Dashboard = () => {
  const { currency, BeUrl, iseducator, getToken } = useContext(AppContext);

  const [dashboardData, setDashboardData] = useState(null);

  const fetchDashboardData = async () => {
    try {
      const token = await getToken();
      const { data } = await axios.get(`${BeUrl}/api/educator/dashboard`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (data.success) {
        setDashboardData(data.dasboardData);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };
  // console.log(dashboardData);

  useEffect(() => {
    if (iseducator) {
      fetchDashboardData();
    }
  }, [iseducator]);

  return dashboardData ? (
    <>
      <div className="min-h-screen flex flex-col items-start justify-between gap-8 md:p-8 md:pb-0 p-4 pt-8 pb-0">
        <div className="space-y-5">
          <div className="flex flex-wrap gap-5 items-center">
            <div className="flex items-center gap-3 shadow-md p-4 w-56 rounded-md border-t border-gray-100 hover:-translate-y-1.5 duration-300 ease-linear cursor-pointer">
              <img src={assets.patients_icon} alt="" />
              <div>
                <p className="text-2xl font-medium text-gray-600">
                  {dashboardData?.enrolledStudentsData.length}
                </p>
                <p className="text-base text-gray-500">Total Enrollments</p>
              </div>
            </div>

            <div className="flex items-center gap-3 shadow-md p-4 w-56 rounded-md border-t border-gray-100 hover:-translate-y-1.5 duration-300 ease-linear cursor-pointer">
              <img src={assets.appointments_icon} alt="" />
              <div>
                <p className="text-2xl font-medium text-gray-600">
                  {dashboardData?.totalCourses}
                </p>
                <p className="text-base text-gray-500">Total Courses</p>
              </div>
            </div>

            <div className="flex items-center gap-3 shadow-md p-4 w-56 rounded-md border-t border-gray-100 hover:-translate-y-1.5 duration-300 ease-linear cursor-pointer">
              <img src={assets.earning_icon} alt="" />
              <div>
                <p className="text-2xl font-medium text-gray-600">
                  {currency}
                  {dashboardData?.totalEarnings}
                </p>
                <p className="text-base text-gray-500">Total Earnings</p>
              </div>
            </div>
          </div>
          <div>
            <h2 className="pb-4 text-lg font-medium">Latest Enrollments</h2>
            <div className="flex flex-col items-center max-w-4xl w-full overflow-hidden rounded-md bg-white shadow-md border-t border-gray-200">
              <table className="table-fixed md:table-auto w-full overflow-hidden">
                <thead className="text-gray-900 border-b border-gray-500/20 text-sm text-left">
                  <tr>
                    <th className="px-4 py-3 font-semibold hidden sm:table-cell">
                      #
                    </th>
                    <th className="px-4 py-3 font-semibold">Student Name</th>
                    <th className="px-4 py-3 font-semibold">Course Name</th>
                  </tr>
                </thead>
                <tbody className="text-sm text-gray-500">
                  {dashboardData?.enrolledStudentsData?.map((item, index) => (
                    <tr
                      key={index}
                      className="border-b border-gray-500/20 hover:bg-gray-50 transition-colors duration-200"
                    >
                      <td className="px-4 py-2 text-center hidden sm:table-cell">
                        {index + 1}
                      </td>
                      <td className="md:px-4 px-2 py-3 flex items-center space-x-3">
                        <img
                          className="w-9 h-9 rounded-full"
                          src={item?.student?.imageUrl}
                          alt="profile"
                        />
                        <span className="truncate">{item?.student?.name}</span>
                      </td>
                      <td className="px-4 py-2 truncate">{item?.courseTitle}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  ) : (
    <Loading />
  );
};

export default Dashboard;
