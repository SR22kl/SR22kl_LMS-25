import { createContext, useEffect, useState } from "react";
import { dummyCourses } from "../assets/assets";
import humanizeDuration from "humanize-duration";
import { useAuth, useUser } from "@clerk/clerk-react";
import axios from "axios";
import { toast } from "react-toastify";

export const AppContext = createContext();

export const AppcontextProvider = (props) => {
  const currency = import.meta.env.VITE_CURRENCY;
  const { getToken } = useAuth();
  const { user } = useUser();
  const [allcourses, setAllcourses] = useState([]);
  const [iseducator, setisEducator] = useState(false);
  const [enrollCourses, setEnrollCourses] = useState([]);
  const [userData, setUserData] = useState(null);

  const BeUrl = import.meta.env.VITE_BE_URL;

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const token = await getToken();
        console.log("Clerk Token:", token);
      } catch (error) {
        console.error("Error fetching token:", error);
      }
    };

    fetchToken();
  }, [getToken]); // Add getToken to the dependency array

  //Fetch all courses
  const fetchAllCourses = async () => {
    try {
      const { data } = await axios.get(`${BeUrl}/api/course/all`);
      if (data.success) {
        setAllcourses(data.courses);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  //fetch UserData
  const fetchUserData = async () => {
    if (user.publicMetadata.role === "educator") {
      setisEducator(true);
    }
    try {
      const token = await getToken();
      const { data } = await axios.get(`${BeUrl}/api/user/data`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (data.success) {
        setUserData(data.user);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  //Function to calculate avg rating of course
  const calculateRating = (course) => {
    // Add a check to ensure course.courseRatings exists and is an array
    if (
      !course ||
      !Array.isArray(course?.courseRating) ||
      course?.courseRating.length === 0
    ) {
      return 0;
    }
    let totalRating = 0;
    course.courseRating.forEach((rating) => {
      totalRating += rating.rating;
    });
    return Math.floor(totalRating / course.courseRating.length);
  };

  // Fuction to calculate course chapter time
  const calculateChapterTime = (chapter) => {
    let time = 0;
    chapter.chapterContent.map((lecture) => (time += lecture.lectureDuration));
    return humanizeDuration(time * 60 * 1000, { units: ["h", "m"] });
  };

  //Function to calculate course duration
  const calculateCourseDuration = (course) => {
    let time = 0;
    course.courseContent.map((chapter) => {
      chapter.chapterContent.map(
        (lecture) => (time += lecture.lectureDuration)
      );
    });
    return humanizeDuration(time * 60 * 1000, { units: ["h", "m"] });
  };

  //Function to calculate No of lectures in the course
  const calculateNoOfLectures = (course) => {
    let totalLectures = 0;
    course.courseContent.forEach((chapter) => {
      if (Array.isArray(chapter.chapterContent)) {
        totalLectures += chapter.chapterContent.length;
      }
    });
    return totalLectures;
  };

  // Fetch User Enrolled Courses
  const fetchEnrolledCourses = async () => {
    try {
      const token = await getToken();
      const { data } = await axios.get(`${BeUrl}/api/user/enrolled-courses`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (data.success) {
        setEnrollCourses(data.enrolledCourses.reverse());
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    fetchAllCourses();
  }, []);

  useEffect(() => {
    if (user) {
      fetchUserData();
      fetchEnrolledCourses();
    }
  }, [user]);

  const value = {
    currency,
    allcourses,
    calculateRating,
    iseducator,
    setisEducator,
    calculateChapterTime,
    calculateNoOfLectures,
    calculateCourseDuration,
    enrollCourses,
    fetchEnrolledCourses,
    BeUrl,
    userData,
    setUserData,
    getToken,
    fetchAllCourses,
  };
  return (
    <>
      <AppContext.Provider value={value}>{props.children}</AppContext.Provider>
    </>
  );
};
