import React from "react";
import { assets } from "../../assets/assets";

const CallToAction = () => {
  return (
    <>
      <div className="flex flex-col items-center gap-5 text-center pt-10 pb-24 px-8 md:px-0 ">
        <h1 className="md:text-4xl text-xl font-semibold text-gray-800">Learn anything, anytime, anywhere</h1>
        <p className="text-sm md:text-base text-gray-500 ">
          Learning that fits your life, not the other way around. Dive into
          diverse courses and resources, accessible from any device, whenever
          you're ready to learn.
        </p>
        <div className="flex  items-center font-medium gap-5 mt-4">
          <button className="bg-violet-500 text-white py-3 px-10 rounded-md cursor-pointer">Get Started</button>
          <button className="flex gap-2 items-center justify-center cursor-pointer">
            Learn More <img className="hover:translate-x-1.5 duration-300 ease-in" src={assets.arrow_icon} alt="arrow_icon" />
          </button>
        </div>
      </div>
    </>
  );
};

export default CallToAction;
