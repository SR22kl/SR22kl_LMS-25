import React from "react";
import { assets } from "../../assets/assets";

const Footer = () => {
  return (
    <>
      <footer className="flex md:flex-row flex-col-reverse items-center justify-between text-left w-full px-8 bg-indigo-100 border-t border-gray-200 ">
        <div className="flex items-center gap-4">
          <img
            className="hidden md:block w-20 hover:scale-110 duration-300 ease-in cursor-pointer"
            src={assets.logo}
            alt="logo"
          />
          <div className="hidden md:block h-7 w-px bg-gray-500/60"></div>
          <p className="py-4 text-center text-xs md:text-sm text-gray-500">
            Copyright 2025 &copy; E-learn. All Rights Reserved.
          </p>
        </div>

        <div className="flex items-center gap-3 max-md:mt-4">
          <a href="#">
            <img src={assets.facebook_icon} alt="fb" />
          </a>
          <a href="#">
            <img src={assets.twitter_icon} alt="x" />
          </a>
          <a href="#">
            <img src={assets.instagram_icon} alt="insta" />
          </a>
        </div>
      </footer>
    </>
  );
};

export default Footer;
