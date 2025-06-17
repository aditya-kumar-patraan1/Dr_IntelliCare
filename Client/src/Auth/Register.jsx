import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast, Toaster } from "react-hot-toast";
import { FiUser, FiMail, FiLock } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../Context/AppContext";

const Register = () => {
  const Navigate = useNavigate();
  const { BACKEND_URL, setisLoggedIn, isLoggedIn, userData, getUserData } = useAppContext();
  const [formData, setFormdata] = useState({
    name: "",
    email: "",
    password: "",
  });

  async function handleSubmit(e) {
    e.preventDefault();

    await axios
      .post(`${BACKEND_URL}/api/auth/register`, formData, {
        withCredentials: true,
      })
      .then((myData) => {
        // console.log("Form data sent to Backend: ", myData.data);
        setFormdata({ name: "", email: "", password: "" });

        if (myData.data.status === 1) {
          toast.success("Registered Successfully...");
          setisLoggedIn(true);
          getUserData();
          Navigate("/");
        } else {
          toast.error("Registration not done...");
          setisLoggedIn(false);
        }
      })
      .catch((e) => {
        // console.log(`Form data not sent to Backend...`);
        toast.error("Something went wrong...");
      });
  }

  function handleChange(e) {
    setFormdata({ ...formData, [e.target.name]: e.target.value });
  }

  function showToaster() {
    if (!formData.email || !formData.password || !formData.name) {
      toast.error(`Please fill all details.`);
    }
  }

  useEffect(() => {
    // console.log("Form Data Updated: ", formData);
  }, [formData]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 md:px-10  bg-gradient-to-br from-sky-700 via-blue-800 to-gray-900">
      <div className="w-full max-w-md sm:max-w-lg md:max-w-xl rounded-xl shadow-xl p-6 sm:p-8 md:p-10 bg-gradient-to-br from-sky-700 via-blue-800 to-gray-900">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-6 sm:mb-8 text-white">
          Create Your Account
        </h2>

        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-2 text-yellow-300">
              Name
            </label>
            <div className="relative">
              <FiUser className="absolute top-1/2 left-3 transform -translate-y-1/2 text-yellow-400" />
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your name"
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-yellow-600 bg-transparent text-yellow-100 placeholder-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2 text-yellow-300">
              Email
            </label>
            <div className="relative">
              <FiMail className="absolute top-1/2 left-3 transform -translate-y-1/2 text-yellow-400" />
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-yellow-600 bg-transparent text-yellow-100 placeholder-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-2 text-yellow-300">
              Password
            </label>
            <div className="relative">
              <FiLock className="absolute top-1/2 left-3 transform -translate-y-1/2 text-yellow-400" />
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Create a password"
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-yellow-600 bg-transparent text-yellow-100 placeholder-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
            <button
              type="submit"
              onClick={showToaster}
              className="w-full sm:w-auto px-6 py-3 rounded-lg font-medium text-white bg-yellow-400 hover:bg-yellow-500 transition cursor-pointer"
            >
              Register
            </button>

            <button type="button" className="text-sm text-yellow-300 hover:underline cursor-pointer">
              <div onClick={() => Navigate("/LoginPage")} type="button">
                Already have an account?
              </div>
            </button>
          </div>
        </form>

        <Toaster />
      </div>
    </div>
  );
};

export default Register;
