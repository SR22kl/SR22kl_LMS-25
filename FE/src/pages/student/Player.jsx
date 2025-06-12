import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../../context/AppContext";
import { useParams } from "react-router-dom";
import { assets } from "../../assets/assets";
import humanizeDuration from "humanize-duration";
import YouTube from "react-youtube";
import Footer from "../../components/student/Footer";
import Rating from "../../components/student/Rating";

const Player = () => {
  const [courseData, setCourseData] = useState(null);
  const [openSection, setOpenSection] = useState({});
  const [playerData, setPlayerData] = useState(null);

  const { courseId } = useParams();
  const { enrollCourses, calculateChapterTime } = useContext(AppContext);

  const getCourseData = () => {
    enrollCourses.map((course) => {
      if (course._id === courseId) {
        setCourseData(course);
      }
    });
  };

  useEffect(() => {
    getCourseData();
  }, [enrollCourses, courseId]);

  // Toggle section open/close
  const toggleSection = (index) => {
    setOpenSection((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  return (
    <>
      <div className="p-4 sm:p-10 flex flex-col-reverse md:grid md:grid-cols-2 gap-10 md:px-36">
        {/* left column */}
        <div className="text-gray-800 ">
          <h2 className="text-xl font-semibold">Course Structure</h2>

          <div className="pt-8 text-gray-800">
            <div className="pt-5">
              {courseData &&
                courseData.courseContent.map((chapter, index) => (
                  <div
                    key={index}
                    className="border border-gray-300 bg-white mb-2 rounded-md"
                  >
                    <div
                      onClick={() => toggleSection(index)}
                      className="flex items-center justify-between px-4 py-3 cursor-pointer select-none"
                    >
                      <div className="flex items-center gap-2">
                        <img
                          src={assets.down_arrow_icon}
                          alt="down arrow"
                          className={`transform transition-transform duration-700 ease-in-out ${
                            openSection[index] ? "rotate-180" : "rotate-0"
                          } `}
                        />
                        <p className="font-medium md:text-base text-sm">
                          {chapter.chapterTitle}
                        </p>
                      </div>
                      <p className="text-sm md:text-base">
                        {chapter.chapterContent.length} lectures -
                        {calculateChapterTime(chapter)}
                      </p>
                    </div>

                    <div
                      className={`overflow-hidden transition-all duration-700 ease-in-out ${
                        openSection[index] ? "max-h-96" : "max-h-0"
                      }`}
                    >
                      <ul className="list-disc md:pl-10 pl-4 pr-4 py-2 text-gray-600 border-t border-gray-300">
                        {chapter.chapterContent.map((lecture, i) => (
                          <li className="flex items-start gap-2 py-1" key={i}>
                            <img
                              src={
                                false ? assets.blue_tick_icon : assets.play_icon
                              }
                              alt="play icon"
                              className="w-4 h-4 mt-1"
                            />
                            <div className="flex items-center justify-between w-full text-gray-800 text-xs md:text-base">
                              <p className="md:mt-0 mt-1">
                                {lecture.lectureTitle}
                              </p>
                              <div className="flex gap-2">
                                {lecture.lectureUrl && (
                                  <p
                                    onClick={() => {
                                      setPlayerData({
                                        ...lecture,
                                        chapter: index + 1,
                                        lecture: i + 1,
                                      });
                                      window.scrollTo(0, 0); // Add this line
                                    }}
                                    className="text-blue-500 cursor-pointer md:mt-0 mt-[4px]"
                                  >
                                    Watch
                                  </p>
                                )}
                                <p className="md:text-base text-[11px] md:mt-0 mt-[5px]">
                                  {humanizeDuration(
                                    lecture.lectureDuration * 60 * 1000,
                                    { units: ["h", "m"] }
                                  )}
                                </p>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
            </div>
          </div>
          <div className="flex items-center gap-2 py-3 mt-10">
            <h1 className="text-xl font-semibold">Rate This Course:</h1>
            <Rating initialRating={0}/>
          </div>
        </div>

        {/* right column */}
        <div className="md:mt-10">
          {playerData ? (
            <div>
              <YouTube
                videoId={playerData.lectureUrl.split("/").pop()}
                opts={{ playerVars: { autoplay: 1 } }}
                iframeClassName="w-full rounded-md aspect-video"
              />
              <div className="flex justify-between items-center mt-1">
                <p>
                  {playerData.chapter}.{playerData.lecture}{" "}
                  {playerData.lectureTitle}
                </p>
                <button className="text-blue-600">
                  {false ? "Completed" : "Mark Complete"}
                </button>
              </div>
            </div>
          ) : (
            <img src={courseData ? courseData.courseThumbnail : "ct"} alt="" />
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Player;
