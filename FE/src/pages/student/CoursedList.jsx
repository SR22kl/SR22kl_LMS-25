import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import SearchBar from "../../components/student/SearchBar";
import { AppContext } from "../../context/AppContext";
import CourseCard from "../../components/student/CourseCard";
import { assets } from "../../assets/assets";
import Footer from "../../components/student/Footer";

const CoursedList = () => {
  const navigate = useNavigate();
  const { input } = useParams();
  const { allcourses } = useContext(AppContext);
  const [fileterCourse, setFileterCourse] = useState([]);

  useEffect(() => {
    if (allcourses && allcourses.length > 0) {
      const tempCourses = allcourses.slice();

      input
        ? setFileterCourse(
            tempCourses.filter((item) =>
              item.courseTitle.toLowerCase().includes(input.toLowerCase())
            )
          )
        : setFileterCourse(tempCourses);
    }
  }, [allcourses, input]);

  return (
    <>
      <div className="relative md:px-36 px-8 pt-12 text-left">
        <div className="flex md:flex-row flex-col gap-6 items-start justify-between w-full">
          <div className="">
            <h1 className="text-4xl font-semibold text-gray-800">
              Course List
            </h1>
            <p className="text-gray-500">
              <span
                className="text-gray-500 cursor-pointer"
                onClick={() => navigate("/")}
              >
                Home
              </span>
              /
              <span className="text-blue-500 cursor-pointer underline">
                Course List
              </span>
            </p>
          </div>
          <SearchBar data={input} />
        </div>

        {/* Display "No courses found" if filterCourse.length is 0 */}
        {fileterCourse.length === 0 ? (
          <div className="text-center mt-8">
            <h2 className="text-2xl font-semibold text-gray-700">
              No courses found
            </h2>
            <p className="text-gray-500">
              Try searching for a different course.
            </p>
            <button
              onClick={() => navigate("/course-list")}
              className="text-gray-800 cursor-pointer "
            >
              &#8592; back
            </button>
          </div>
        ) : (
          /* Display the input tag if 'input' has a value AND courses are found */
          input && (
            <div className="inline-flex items-center gap-4 px-4 py-2 border-t border-gray-200 mt-8 -mb-8 rounded shadow-md">
              <p>{input}</p>
              <img
                className="cursor-pointer"
                src={assets.cross_icon}
                alt="cross_icon"
                onClick={() => navigate("/course-list")}
              />
            </div>
          )
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 md:px-0 px-4 md:my-12 my-8">
          {fileterCourse.map((allcourses, index) => {
            return <CourseCard key={index} course={allcourses} />;
          })}
        </div>
      </div>
      <Footer/>
    </>
  );
};

export default CoursedList;
