import React from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";

import bgVideo from "../assets/premium-bg.mp4";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      <Header />

      <section className="relative overflow-hidden min-h-[85vh] flex items-center">
        <video
          className="absolute inset-0 w-full h-full object-cover"
          src={bgVideo}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          controls={false}
        />

        <div className="absolute inset-0 bg-black/35" />

        <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-pink-500/25 blur-3xl float-slow" />
        <div className="absolute top-28 -right-24 w-80 h-80 rounded-full bg-purple-500/25 blur-3xl float-slow2" />
        <div className="absolute -bottom-24 left-1/3 w-80 h-80 rounded-full bg-rose-500/15 blur-3xl float-slow3" />

        <div className="relative z-10 w-full">
          <div className="max-w-6xl mx-auto px-6 py-16 text-center text-white">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-md">
              <span className="premium-dot" />
              Premium Matrimony Experience
            </span>

            <h1 className="mt-6 text-4xl md:text-6xl font-extrabold leading-tight hero-text-shadow">
              <span className="hero-title">Find Your Perfect Life Partner</span>
              <span className="ring-bounce inline-flex align-middle ml-2">
                <RingIcon />
              </span>
            </h1>

            <p className="mt-5 text-base md:text-xl text-white/90 max-w-2xl mx-auto hero-text-shadow">
              Verified profiles • Smart matches • Secure experience — All in one
              place.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate("/register")}
                className="btn-hero-primary w-full sm:w-auto"
              >
                Get Started
              </button>

              <button
                onClick={() => navigate("/login")}
                className="btn-hero-outline w-full sm:w-auto"
              >
                Login
              </button>
            </div>

            <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
              <Stat icon="✅" title="100% Verified" desc="Trusted Profiles" />
              <Stat icon="🎯" title="Smart Filters" desc="Better Matches" />
              <Stat icon="🇮🇳" title="All India" desc="Wider Reach" />
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-6 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">
          Why Choose Smart Matrimony?
        </h2>

        <div className="grid md:grid-cols-3 gap-8 text-center">
          <Feature
            title="🔒 Verified Profiles"
            desc="We verify profiles to keep your experience safe and genuine."
          />
          <Feature
            title="💖 Smart Matchmaking"
            desc="Advanced filters and suggestions to find your ideal partner."
          />
          <Feature
            title="⚡ Premium Experience"
            desc="Smooth UI, fast onboarding, and modern design."
          />
        </div>
      </section>

      <Footer />
    </div>
  );
};

const RingIcon = () => (
  <svg width="44" height="44" viewBox="0 0 64 64" fill="none">
    <defs>
      <linearGradient id="ringGrad" x1="8" y1="8" x2="56" y2="56">
        <stop offset="0" stopColor="#ffd1e8" />
        <stop offset="0.5" stopColor="#ec4899" />
        <stop offset="1" stopColor="#a855f7" />
      </linearGradient>
      <linearGradient id="diaGrad" x1="22" y1="4" x2="42" y2="24">
        <stop offset="0" stopColor="#ffffff" />
        <stop offset="1" stopColor="#fbcfe8" />
      </linearGradient>
    </defs>

    <path
      d="M32 6 L40 16 L32 26 L24 16 Z"
      fill="url(#diaGrad)"
      stroke="url(#ringGrad)"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    <path
      d="M24 16 H40"
      stroke="rgba(255,255,255,0.65)"
      strokeWidth="2"
      strokeLinecap="round"
    />

    <circle cx="32" cy="41" r="16" stroke="url(#ringGrad)" strokeWidth="4" />
    <circle
      cx="32"
      cy="41"
      r="11"
      stroke="rgba(255,255,255,0.28)"
      strokeWidth="2.5"
    />

    <path
      d="M23 42c-1 2-0.6 5 1.1 6.8"
      stroke="rgba(255,255,255,0.65)"
      strokeWidth="2.2"
      strokeLinecap="round"
    />
  </svg>
);

const Stat = ({ title, desc, icon }) => (
  <div className="stat-card">
    <div className="stat-icon">{icon}</div>
    <div>
      <p className="stat-title">{title}</p>
      <p className="stat-desc">{desc}</p>
    </div>
  </div>
);

const Feature = ({ title, desc }) => (
  <div className="card-glass p-6 hover:scale-[1.02] transition">
    <h3 className="text-xl font-semibold mb-3">{title}</h3>
    <p className="text-gray-700">{desc}</p>
  </div>
);

export default Home;