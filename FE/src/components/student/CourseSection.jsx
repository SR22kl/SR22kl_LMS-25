import React, { useContext } from "react";
import { Link } from "react-router-dom";
import CourseCard from "./CourseCard";
import { AppContext } from "../../context/AppContext";

const CourseSection = () => {
  const { allcourses } = useContext(AppContext);
  return (
    <>
      <div className="py-16 md:px-40 px-8">
        <h2 className="text-3xl font-medium text-gray-800">
          Learn form the best
        </h2>
        <p className="text-sm md:text-base text-gray-400 mt-3">
          Discover our top-rated courses across various categories. From coding
          & design to <br /> business & wellness, our courses are crafted to deliver
          results.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 md:px-0 px-4 md:my-12 my-8"> 
          {allcourses.slice(0, 4).map((allcourses, index) => {
            return <CourseCard key={index} course={allcourses} />;
          })}
        </div>

        <Link
          className="text-gray-500 border border-gray-500/30 px-10 py-3 rounded"
          to={"/course-list"}
          onClick={() => scrollTo(0, 0)}
        >
          Show all courses
        </Link>
      </div>
    </>
  );
};

export default CourseSection;
