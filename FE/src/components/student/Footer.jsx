import { assets } from "../../assets/assets";

const Footer = () => {
  return (
    <>
      <footer className="w-full md:px-36 text-left bg-gray-900 text-gray-400 mt-10">
        <div className="flex flex-col md:flex-row justify-center items-center md:items-start px-8 md:px-0 gap-10 md:gap-32 py-10 border-b border-white/30">
          <div className="flex flex-col items-center md:items-start w-full">
            <img
              className="hover:scale-110 duration-300 ease-in cursor-pointer"
              src={assets.logo_dark}
              alt="logo"
            />
            <p className="mt-6 text-center md:text-left text-sm">
              Encourages users to connect beyond the platform itself, So be the
              part of our thriving learning community!
            </p>
          </div>
          <div className="flex flex-col items-center md:items-start w-full">
            <h2 className="font-semibold text-white mb-5">Company</h2>
            <ul className="flex md:flex-col w-full justify-between text-sm md:space-y-2">
              <li>
                <a href="">Home</a>
              </li>
              <li>
                <a href="">About Us</a>
              </li>
              <li>
                <a href="">Contact Us</a>
              </li>
              <li>
                <a href=""></a>Privacy Policy
              </li>
            </ul>
          </div>
          <div className="hidden md:flex flex-col items-center w-full">
            <h2 className="font-semibold text-white mb-5">
              Subscribe To Our Newsletter
            </h2>
            <p className="text-sm ">
              The latest news, articles, & resources, sent to your inbox weekly.
            </p>
            <div className="flex items-center gap-2 pt-4">
              <input
                className="outline-none border border-gray-500/30 px-2 rounded bg-gray-800 text-gray-400 placeholder-gray-500 w-64 h-9 text-sm"
                type="email"
                placeholder="Enter your email"
              />
              <button className="bg-red-500 w-24 h-9 text-white px-2 rounded cursor-pointer hover:opacity-80 duration-200 ease-in">
                Subscribe
              </button>
            </div>
          </div>
        </div>
        <p className="py-4 text-center text-xs md:text-sm">
          Copyright 2025 &copy; E-learn. All Rights Reserved.
        </p>
      </footer>
    </>
  );
};

export default Footer;
