import { Link, useNavigate } from "react-router-dom";
import { assets } from "../../assets/assets";
import { useClerk, useUser, UserButton } from "@clerk/clerk-react";
import { useContext } from "react";
import { AppContext } from "../../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";

const Navbar = () => {
  const navigate = useNavigate();
  const isCorseListPage = location.pathname.includes("/course-list");

  const { openSignIn } = useClerk();
  const { user } = useUser();

  const { iseducator, setisEducator, BeUrl, getToken } = useContext(AppContext);

  const becomeEducator = async () => {
    try {
      if (iseducator) {
        navigate("/educator");
        return;
      }
      const token = await getToken();
      const { data } = await axios.get(`${BeUrl}/api/educator/update-role`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data.success) {
        setisEducator(true);
        toast.success(data.message);
        navigate("/educator");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <>
      <div
        className={`flex justify-between items-center px-4 sm:px-10 md:px-14 lg:px-36 py-4 shadow-md transition-all duration-300 ease-in-out ${
          isCorseListPage ? "bg-white" : "bg-violet-200"
        }`}
      >
        <img
          src={assets.logo}
          alt="Logo"
          onClick={() => navigate("/")}
          className="md:w-28 lg:w-32 w-[6rem]  cursor-pointer hover:scale-110 duration-300 ease-in-out"
        />

        <div className="hidden md:flex items-center gap-5 text-gray-500">
          <div className="flex items-center gap-5">
            {user && (
              <>
                <button onClick={becomeEducator} className="cursor-pointer">
                  {iseducator ? "Educator Dasboard" : "Become Educator"}
                </button>
                | <Link to={"/my-enrollments"}>My Enrollments</Link>
              </>
            )}
          </div>

          {user ? (
            <UserButton />
          ) : (
            <button
              onClick={() => openSignIn()}
              className="bg-blue-600 text-white px-5 py-2 rounded-full opacity-90 hover:opacity-100 duration-200 ease-in cursor-pointer"
            >
              Create Account
            </button>
          )}
        </div>

        {/* for small devices */}
        <div className="md:hidden flex items-center gap-2 sm:gap-5 text-gray-500">
          <div className="flex items-center gap-1 sm:gap-2 max-sm:text-xs">
            {user && (
              <>
                <button onClick={becomeEducator} className="cursor-pointer">
                  {iseducator ? "Educator Dasboard" : "Become Educator"}
                </button>
                | <Link to={"/my-enrollments"}>My Enrollments</Link>
              </>
            )}
          </div>

          {user ? (
            <UserButton />
          ) : (
            <button onClick={() => openSignIn()}>
              <img src={assets.user_icon} alt="user" />
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default Navbar;
