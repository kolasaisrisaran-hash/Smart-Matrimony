import React, { useState } from "react";
import { Link } from "react-router-dom";

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="bg-gradient-to-r from-pink-500 via-red-500 to-orange-500 shadow-lg">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        
        {/* Logo */}
        <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-wide">
          💍 Smart Matrimony
        </h1>

        {/* Desktop Menu */}
        <nav className="hidden md:flex space-x-8 text-white font-medium">
          <Link to="/" className="hover:scale-110 transition duration-300">
            Home
          </Link>
          <Link to="/login" className="hover:scale-110 transition duration-300">
            Login
          </Link>
          <Link to="/register" className="bg-white text-pink-600 px-4 py-2 rounded-full hover:bg-gray-100 transition duration-300">
            Register
          </Link>
        </nav>

        {/* Mobile Button */}
        <button
          className="md:hidden text-white text-3xl"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          ☰
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-white text-center py-4 space-y-4 font-medium">
          <Link to="/" className="block hover:text-pink-600">
            Home
          </Link>
          <Link to="/login" className="block hover:text-pink-600">
            Login
          </Link>
          <Link to="/register" className="block hover:text-pink-600">
            Register
          </Link>
        </div>
      )}
    </header>
  );
};

export default Header;