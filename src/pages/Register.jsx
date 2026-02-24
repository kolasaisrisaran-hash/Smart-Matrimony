import React from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";

const Register = () => {
  return (
    <>
      <Header />

      <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-pink-500 via-red-500 to-orange-500 px-4">
        <div className="bg-white shadow-2xl rounded-2xl p-8 w-full max-w-md">

          <h2 className="text-3xl font-bold text-center text-pink-600 mb-6">
            Register 💍
          </h2>

          <form className="space-y-4">
            
            <input
              type="text"
              placeholder="Full Name"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 outline-none"
            />

            <input
              type="email"
              placeholder="Email"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 outline-none"
            />

            <input
              type="password"
              placeholder="Password"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 outline-none"
            />

            <button
              type="submit"
              className="w-full bg-pink-600 text-white py-2 rounded-lg hover:bg-pink-700 transition"
            >
              Create Account
            </button>
          </form>

        </div>
      </div>

      <Footer />
    </>
  );
};

export default Register;