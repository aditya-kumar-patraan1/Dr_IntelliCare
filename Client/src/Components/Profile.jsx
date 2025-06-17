import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../Context/AppContext";
import axios from "axios";
import { useEffect } from "react";

const Profile = ({ name }) => {
  const { BACKEND_URL, setisLoggedIn, setUserData,getUserData,userData } = useAppContext();
  const [showOptions, setShowOptions] = useState(false);
  const navigate = useNavigate();

  const logOutUser = async () => {
    try {
      await axios.post(`${BACKEND_URL}/api/auth/logout`, {}, { withCredentials: true });
      setisLoggedIn(false);
      setUserData(null);
      navigate("/");
    } catch (err) {
      // console.error("Logout error:", err);
    }
  };

  useEffect(()=>{
    // console.log("grf");
    getUserData();
  },[]);

  return (
    <div className="relative inline-block">
      <div
        className="rounded-full bg-white text-blue-900 h-12 w-12 font-bold shadow-md flex items-center justify-center cursor-pointer hover:bg-yellow-300 transition-all duration-200"
        onClick={() => setShowOptions(!showOptions)}
      >
        {name?.[0]?.toUpperCase() || "A"}
      </div>

      {showOptions && (
        <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 shadow-lg rounded-md z-50">
          <ul>
            {!userData.isAccountVerified && <li
              className="px-4 py-2 text-black hover:bg-yellow-200 cursor-pointer"
              onClick={() => {
                setShowOptions(false);
                navigate("/VerifyEmail");
              }}
            >
              Verify Email
            </li>}
            <li
              className="px-4 py-2 text-black hover:bg-yellow-200 cursor-pointer"
              onClick={() => {
                setShowOptions(false);
                navigate("/Dashboard");
              }}
            >
              Dashboard
            </li>
            <li
              className="px-4 py-2 text-black hover:bg-yellow-200 cursor-pointer"
              onClick={() => {
                setShowOptions(false);
                logOutUser();
              }}
            >
              Logout
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default Profile;
