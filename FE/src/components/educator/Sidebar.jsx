import React, { useContext } from "react";
import { assets } from "../../assets/assets";
import { AppContext } from "../../context/AppContext";
import { NavLink } from "react-router-dom";

const Sidebar = () => {
  const { iseducator } = useContext(AppContext);

  const menuItems = [
    { name: "Dashboard", path: "/educator", icon: assets.home_icon },
    { name: "Add Course", path: "/educator/add-course", icon: assets.add_icon },
    {
      name: "My Courses",
      path: "/educator/mycourse",
      icon: assets.my_course_icon,
    },
    {
      name: "Students Enrolled",
      path: "/educator/students-enroll",
      icon: assets.person_tick_icon,
    },
  ];
  return (
    iseducator && (
      <>
        <div className="flex flex-col md:w-64 w-16 shadow-lg min-h-screen text-base py-1 ">
          {menuItems.map((item) => (
            <NavLink
              className={({ isActive }) =>
                `flex items-center md:flex-row flex-col md:justify-start justify-center py-3.5 md:px-10 gap-3 ${
                  isActive
                    ? "bg-indigo-50 border-r-[6px] border-indigo-500/30 text-indigo-600"
                    : "hover:bg-gray-100/50 border-r-[6px] border-white hover:border-gray-100/90"
                }`
              }
              to={item.path}
              key={item.name}
              end={item.path === "/educator"}
            >
              <img src={item.icon} alt="icon" className="w-6 h-6" />
              <p className="md:block hidden text-center">{item.name}</p>
            </NavLink>
          ))}
        </div>
      </>
    )
  );
};

export default Sidebar;
