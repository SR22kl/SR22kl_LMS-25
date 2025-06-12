import { useNavigate } from "react-router-dom";
import { assets } from "../../assets/assets";
import { useState } from "react";

const SearchBar = ({ data }) => {
  const nvaigate = useNavigate();

  const [input, setInput] = useState(data ? data : "");

  const onSearchHandler = (e) => {
    e.preventDefault();
    if (input.trim() === "") {
      return;
    }
    nvaigate(`/course-list/${input}`);
  };

  return (
    <>
      <form
        onSubmit={onSearchHandler}
        className="max-w-xl w-full md:h-14 h-12 flex items-center bg-white border border-gray-500/20 rounded shadow-md"
      >
        <img
          src={assets.search_icon}
          alt="search-icon"
          className="md:w-auto w-10 px-3"
        />
        <input
          onChange={(e) => setInput(e.target.value)}
          onKeyUp={(e) => {
            if (e.key === "Enter") {
              onSearchHandler(e);
            }
          }}
          value={input}
          type="text"
          placeholder="search for courses"
          className="w-full h-full text-gray-500/80  outline-none"
        />
        <button
          type="submit"
          className="bg-violet-600 rounded text-white md:px-10 px-7 md:py-3 py-2 mx-1 cursor-pointer"
        >
          Search
        </button>
      </form>
    </>
  );
};

export default SearchBar;
