import React from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Link } from "react-router-dom";

const Login = () => {
  return (
    <>
      <Header />

      <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-pink-500 via-red-500 to-orange-500 px-4">
        <div className="bg-white shadow-2xl rounded-2xl p-8 w-full max-w-md">
          
          <h2 className="text-3xl font-bold text-center text-pink-600 mb-6">
            Login 💍
          </h2>

          <form className="space-y-5">
            {/* Email */}
            <div>
              <label className="block mb-2 font-medium">Email</label>
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block mb-2 font-medium">Password</label>
              <input
                type="password"
                placeholder="Enter your password"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>

            {/* Forgot Password */}
            <div className="text-right text-sm">
              <a href="#" className="text-pink-600 hover:underline">
                Forgot Password?
              </a>
            </div>

            {/* Button */}
            <button
              type="submit"
              className="w-full bg-pink-600 text-white py-2 rounded-lg hover:bg-pink-700 transition duration-300"
            >
              Login
            </button>
          </form>

          {/* Register Link */}
          <p className="text-center mt-6 text-sm">
            Don’t have an account?{" "}
            <Link to="/register" className="text-pink-600 font-semibold hover:underline">
              Register
            </Link>
          </p>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default Login;