import { Route, Routes, useMatch } from "react-router-dom";
import CourseDetails from "./pages/student/CourseDetails";
import CourseList from "./pages/student/CoursedList";
import Home from "./pages/student/Home";
import MyEnrollments from "./pages/student/MyEnrollments";
import Player from "./pages/student/Player";
import Loading from "./components/student/Loading";
import Educator from "./pages/educator/Educator";
import Mycourse from "./pages/educator/MyCources";
import Addcourse from "./pages/educator/AddCourse";
import Dashboard from "./pages/educator/Dashboard";
import StudentsEnroll from "./pages/educator/StudentsEnrolled";
import { ToastContainer, toast } from "react-toastify";

import Navbar from "./components/student/Navbar";
import "quill/dist/quill.snow.css";

const App = () => {
  const isEducatorRoute = useMatch("/educator/*");

  return (
    <>
      <div className="text-default min-h-screen bg-white">
        <ToastContainer />
        {/* Render Navbar only if not on Educator routes */}
        {!isEducatorRoute && <Navbar />}

        <Routes>
          {/* Student Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/course/:id" element={<CourseDetails />} />
          <Route path="/course-list" element={<CourseList />} />
          <Route path="/course-list/:input" element={<CourseList />} />
          <Route path="/my-enrollments" element={<MyEnrollments />} />
          <Route path="/player/:courseId" element={<Player />} />
          <Route path="/loading/:path" element={<Loading />} />
          <Route path="/loading" element={<Loading />} />

          {/* Educator Nested Routes */}
          <Route path="/educator" element={<Educator />}>
            <Route path="/educator" element={<Dashboard />} />
            <Route path="mycourse" element={<Mycourse />} />
            <Route path="add-course" element={<Addcourse />} />
            <Route path="students-enroll" element={<StudentsEnroll />} />
          </Route>

          <Route />
        </Routes>
      </div>
    </>
  );
};

export default App;
