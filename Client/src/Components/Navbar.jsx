import React, { useState } from "react";
import { FaUserDoctor } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import { HiMenu, HiX } from "react-icons/hi";
import Buttons from "./Buttons";
import { useAppContext } from "../Context/AppContext";
import Profile from "./Profile";
import axios from "axios";

const Navbar = () => {
  const navigate = useNavigate();
  const { isLoggedIn, userData, setisLoggedIn, setUserData, BACKEND_URL } = useAppContext();
  const [isMenuOpen, setMenuOpen] = useState(false);

  const routes = {
    Home: "/",
    About: "/About",
    Contact: "/Contact",
    "AI Health Assistant": "/AIHealthAssistant",
    Developer: "/Developer",
  };

  const menuItems = Object.keys(routes);

  const changePage = (item) => {
    navigate(routes[item]);
    setMenuOpen(false);
  };

  const logout = async () => {
    try {
      await axios.post(`${BACKEND_URL}/api/auth/logout`, {}, { withCredentials: true });
      setisLoggedIn(false);
      setUserData(null);
      navigate("/");
    } catch (err) {
      // console.error("Logout failed:", err);
    }
  };

  return (
    <div className="bg-gradient-to-bl from-blue-900 via-blue-800 to-sky-700 w-full px-[4vw] py-[2vh] shadow-lg flex justify-between items-center relative z-50">
      
      {/* Logo */}
      <div
        onClick={() => navigate("/")}
        className="flex items-center gap-2 text-white cursor-pointer text-[5vw] md:text-[1.5vw] font-bold"
      >
        <FaUserDoctor className="text-white text-[6vw] md:text-[2vw]" />
        <p>Dr. IntelliCare</p>
      </div>

      {/* Desktop Menu */}
      <div className="hidden md:flex gap-[2vw]">
        {menuItems.map((item) => (
          <p
            key={item}
            onClick={() => changePage(item)}
            className="text-white hover:text-yellow-300 font-semibold text-[1.4vw] cursor-pointer transition-all duration-200"
          >
            {item}
          </p>
        ))}
      </div>

      {/* Desktop Profile or Buttons */}
      <div className="hidden md:flex">
        {isLoggedIn ? <Profile name={userData?.name} /> : <Buttons />}
      </div>

      {/* Mobile Menu Icon */}
      <div
        className="md:hidden text-white text-[8vw] cursor-pointer"
        onClick={() => setMenuOpen(!isMenuOpen)}
      >
        {isMenuOpen ? <HiX /> : <HiMenu />}
      </div>

      {/* Mobile Dropdown Menu */}
      {isMenuOpen && (
        <div className="absolute top-full left-0 w-full bg-blue-900 text-white z-50 flex flex-col gap-4 px-6 py-6 shadow-xl md:hidden">
          {menuItems.map((item) => (
            <p
              key={item}
              onClick={() => changePage(item)}
              className="  hover:text-yellow-300 text-center text-[5vw]  font-medium cursor-pointer"
            >
              {item}
            </p>
          ))}

          {/* Mobile Profile instead of Buttons */}
          <div className="mt-4 self-center">
            {isLoggedIn ? <Profile name={userData?.name} /> : <Buttons />}
          </div>
        </div>
      )}
    </div>
  );
};

export default Navbar;
