import { UserButton, useUser } from "@clerk/clerk-react";
import { Link } from "react-router-dom";
import { assets, dummyEducatorData } from "../../assets/assets";

const Navbar = () => {
  const educatorData = dummyEducatorData;
  const { user } = useUser();
  return (
    <>
      <div className="flex items-center justify-between px-4 md:px-8 shadow-md py-3">
        <Link to={"/"}>
          <img className="w-28 lg:w-32" src={assets.logo} alt="logo" />
        </Link>
        <div className="flex items-center gap-5 text-gray-500 relative">
          <p>Hi! {user ? user.fullName : "Devs"}</p>
          {user ? (
            <UserButton />
          ) : (
            <img className="max-w-8" src={assets.profile_img} />
          )}
        </div>
      </div>
    </>
  );
};

export default Navbar;
