import React from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";

const Home = () => {
  const navigate = useNavigate();   // 👈 navigation create chestunnam

  return (
    <>
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-pink-500 via-red-500 to-orange-500 text-white text-center py-20">
        <h1 className="text-4xl md:text-5xl font-bold mb-6">
          Find Your Perfect Life Partner 💍
        </h1>
        <p className="text-lg md:text-xl mb-8">
          Trusted Matrimony Service with Verified Profiles Across India
        </p>

        {/* 👇 Ikkada change chesam */}
        <button
          onClick={() => navigate("/login")}
          className="bg-white text-pink-600 px-6 py-3 rounded-full font-semibold hover:bg-gray-100 transition duration-300"
        >
          Get Started
        </button>
      </section>

      {/* Features Section */}
      <section className="py-16 px-6 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">
          Why Choose Smart Matrimony?
        </h2>

        <div className="grid md:grid-cols-3 gap-8 text-center">
          <div className="shadow-lg p-6 rounded-xl hover:scale-105 transition duration-300">
            <h3 className="text-xl font-semibold mb-4">🔒 100% Verified Profiles</h3>
            <p>
              We ensure all profiles are verified to maintain trust and security.
            </p>
          </div>

          <div className="shadow-lg p-6 rounded-xl hover:scale-105 transition duration-300">
            <h3 className="text-xl font-semibold mb-4">💖 Perfect Matchmaking</h3>
            <p>
              Advanced filters and smart suggestions to find your ideal partner.
            </p>
          </div>

          <div className="shadow-lg p-6 rounded-xl hover:scale-105 transition duration-300">
            <h3 className="text-xl font-semibold mb-4">🌍 All Over India</h3>
            <p>
              Connect with matches from different cities and communities.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
};

export default Home;