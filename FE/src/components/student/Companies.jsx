import React from "react";
import { assets } from "../../assets/assets";

const Companies = () => {
  return (
    <>
      <div className="pt-16 md:px-0 px-0.5">
        <p className="text-base text-gray-500">Trusted by learners form</p>
        <div className="flex flex-wrap justify-center items-center gap-6 md:gap-16 md:mt-10 mt-5">
          <img src={assets.microsoft_logo} alt="ms" className="w-20 md:w-28" />
          <img
            src={assets.accenture_logo}
            alt="accenture"
            className="w-20 md:w-28"
          />
          <img
            src={assets.walmart_logo}
            alt="walmart"
            className="w-20 md:w-28"
          />
          <img src={assets.adobe_logo} alt="adobe" className="w-20 md:w-28" />
          <img src={assets.paypal_logo} alt="payapl" className="w-20 md:w-28" />
        </div>
      </div>
    </>
  );
};

export default Companies;
