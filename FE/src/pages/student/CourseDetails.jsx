import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { AppContext } from "../../context/AppContext";
import Loading from "../../components/student/Loading";
import { assets } from "../../assets/assets";
import humanizeDuration from "humanize-duration";
import Footer from "../../components/student/Footer";
import YouTube from "react-youtube";
import axios from "axios";
import { toast } from "react-toastify";

const CourseDetails = () => {
  const { id } = useParams();
  const [courseData, setCourseData] = useState(null);
  const [openSection, setOpenSection] = useState({});
  const [isEnroll, setIsEnroll] = useState(false);
  const [playerData, setPlayerData] = useState(null);
  const [btnLoading, setBtnLoading] = useState(false);

  console.log(courseData)

  const {
    allcourses,
    calculateRating,
    calculateChapterTime,
    calculateNoOfLectures,
    calculateCourseDuration,
    currency,
    BeUrl,
    userData,
    getToken,
  } = useContext(AppContext);

  // Find the course with the matching ID
  const fetchCourseData = async () => {
    try {
      const { data } = await axios.get(`${BeUrl}/api/course/${id}`);
      if (data.success) {
        setCourseData(data.courseData);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const enrollCourse = async () => {
    setBtnLoading(true);
    try {
      if (!userData) {
        return toast.warn("Please Login First To Enroll!");
      }
      if (isEnroll) {
        return toast.warn("Already Enrolled!");
      }

      console.log("Course ID to be sent:", courseData?._id);

      const token = await getToken();

      const { data } = await axios.post(
        `${BeUrl}/api/user/purchase`,
        {
          courseId: courseData._id,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (data.success) {
        const { url } = data;
        window.location.replace(url);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setBtnLoading(false);
    }
  };

  // Fetch course data when component mounts
  useEffect(() => {
    fetchCourseData();
  }, []);

  useEffect(() => {
    if (userData && courseData) {
      setIsEnroll(userData.enrolledCourses.includes(courseData._id));
    }
  }, [userData, courseData]);

  // Toggle section open/close
  const toggleSection = (index) => {
    setOpenSection((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  return courseData ? (
    <>
      <div className="flex md:flex-row flex-col-reverse gap-10 relative items-start justify-between md:px-36 px-8 md:pt-28 pt-20 text-left">
        <div className="w-full h-[500px] absolute top-0 left-0  bg-gradient-to-b from-violet-300/70"></div>

        {/* left column */}
        <div className="max-w-xl z-10 text-gray-500">
          <h1 className="md:text-[40px] text-[26px] font-semibold">
            {courseData.courseTitle}
          </h1>
          <p
            className="pt-4 md:text-base text-sm"
            dangerouslySetInnerHTML={{
              __html: courseData.courseDescription.slice(0, 267),
            }}
          ></p>

          {/* reviews & ratings */}
          <div className="flex items-center space-x-2 pt-3 pb-1 text-sm">
            <p>{calculateRating(courseData)}</p>
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <img
                  key={i}
                  src={
                    i < Math.floor(calculateRating(courseData))
                      ? assets.star
                      : assets.star_blank
                  }
                  alt="stars"
                  className="w-3.5 h-3.5"
                />
              ))}
            </div>
            <p className="text-blue-600">
              ({courseData?.courseRatings?.length}&nbsp;
              {courseData?.courseRatings?.length > 1 ? "Ratings" : "Rating"})
            </p>
            <p>
              {courseData?.enrolledStudents?.length}{" "}
              {courseData?.enrolledStudents?.length > 1
                ? "Students"
                : "Student"}
            </p>
          </div>
          <p className="text-sm">
            Course By{" "}
            <span className="text-blue-600 underline">{courseData?.educator?.name || "Tunnel-Rat"}</span>
          </p>
          <div className="pt-8 text-gray-800">
            <h2 className="text-xl font-semibold">Course Structure</h2>
            <div className="pt-5">
              {courseData.courseContent.map((chapter, index) => (
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
                            src={assets.play_icon}
                            alt="play icon"
                            className="w-4 h-4 mt-1"
                          />
                          <div className="flex items-center justify-between w-full text-gray-800 text-xs md:text-base">
                            <p className="md:mt-0 mt-1">
                              {lecture.lectureTitle}
                            </p>
                            <div className="flex gap-2">
                              {lecture.isPreviewFree && (
                                <p
                                  onClick={() => {
                                    setPlayerData({
                                      videoId: lecture.lectureUrl
                                        .split("/")
                                        .pop(),
                                    });
                                    window.scrollTo(0, 0); // Add this line
                                  }}
                                  className="text-blue-500 cursor-pointer md:mt-0 mt-[4px]"
                                >
                                  Preview
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
          <div>
            <div>
              <h3 className="text-3xl font-semibold mt-5 text-gray-800">
                Course Description
              </h3>
              <p
                className="pt-1 rich-text"
                dangerouslySetInnerHTML={{
                  __html: courseData.courseDescription,
                }}
              ></p>
            </div>
          </div>
        </div>

        {/* right column */}
        <div className=" max-w-[424px] shadow-lg z-10 rounded-md overflow-hidden bg-white min-h-[300px] sm:min-w-[420px]">
          {playerData ? (
            <YouTube
              videoId={playerData.videoId}
              opts={{ playerVars: { autoplay: 1 } }}
              iframeClassName="w-full rounded-md aspect-video"
            />
          ) : (
            <img src={courseData.courseThumbnail} alt="courseThumbnail" />
          )}
          <div className="p-5">
            <div className="flex items-center  gap-2">
              <img
                className="w-3.5"
                src={assets.time_clock_icon}
                alt="time-clock"
              />
              <p className="text-red-500">
                <span className="font-medium">5 days</span> left at this price!
              </p>
            </div>
            <div className="flex gap-3 items-center pt-2">
              <p className="text-gray-800 md:text-4xl text-2xl font-semibold">
                {currency}
                {(
                  courseData.coursePrice -
                  (courseData.discount * courseData.coursePrice) / 100
                ).toFixed(2)}
              </p>
              <p className="md:text-lg text-gray-500 line-through">
                {currency}
                {courseData.coursePrice}
              </p>
              <p className="md:text-lg text-gray-500">
                {courseData.discount}% off
              </p>
            </div>
            <div className="flex items-center text-sm md:text-base gap-4 pt-2 md:pt-4 text-gray-500">
              <div className="flex items-center gap-2">
                <img src={assets.star} alt="star-icon" />
                <p>{calculateRating(courseData)}</p>
              </div>

              <div className="h-4 w-px bg-gray-500/40"></div>

              <div className="flex items-center gap-2">
                <img src={assets.time_clock_icon} alt="time_clock" />
                <p>{calculateCourseDuration(courseData)}</p>
              </div>

              <div className="h-4 w-px bg-gray-500/40"></div>

              <div className="flex items-center gap-2">
                <img src={assets.lesson_icon} alt="time_clock" />
                <p>{calculateNoOfLectures(courseData)} lessons</p>
              </div>
            </div>

            <div className="items-center justify-center">
              <button
                onClick={enrollCourse}
                disabled={btnLoading}
                className="bg-violet-500 md:mt-6 mt-4 text-white w-full rounded font-medium py-3 cursor-pointer hover:opacity-90 duration-200 ease-in"
              >
                {isEnroll ? "Already Enrolled" : "Enroll Now"}
              </button>

              <div className="pt-6">
                <p className="md:text-xl text-lg font-medium text-gray-800">
                  what's in the course?
                </p>
                <ul className="list-disc ml-4 pt-2 md:text-base text-gray-500 text-sm">
                  <li>Lifetime access with free updates.</li>
                  <li>Step-by-step, hands-on project guidance.</li>
                  <li>Downloadable resources & source code.</li>
                  <li>Quizzes to test your knowledge.</li>
                  <li>Certificate of completion.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  ) : (
    <Loading />
  );
};

export default CourseDetails;
