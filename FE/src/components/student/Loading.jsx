import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

const Loading = () => {
  const { path } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (path) {
      const timer = setTimeout(() => {
        navigate(`/${path}`);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <div className="flex items-center justify-center md:min-h-screen min-h-[85vh] bg-transparent text-white flex-col">
      {/* Spinner element */}
      <div
        className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-20"
        style={{
          animation: "spin 1s linear infinite", // Applies the 'spin' animation
          "@keyframes spin": {
            // Defines the 'spin' keyframe animation
            "0%": { transform: "rotate(0deg)" },
            "100%": { transform: "rotate(360deg)" },
          },
        }}
      ></div>
    </div>
  );
};

export default Loading;
