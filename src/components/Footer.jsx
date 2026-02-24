import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-pink-600 via-red-500 to-orange-500 text-white mt-10">
      <div className="max-w-7xl mx-auto px-6 py-10 grid md:grid-cols-4 gap-8">
        
        {/* Brand */}
        <div>
          <h2 className="text-2xl font-bold mb-4">💍 Smart Matrimony</h2>
          <p className="text-sm leading-6">
            Find your perfect life partner with trust, security and happiness.
            We connect hearts ❤️ across India.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <Link to="/" className="hover:text-gray-200 transition">
                Home
              </Link>
            </li>
            <li>
              <Link to="/login" className="hover:text-gray-200 transition">
                Login
              </Link>
            </li>
            <li>
              <Link to="/register" className="hover:text-gray-200 transition">
                Register
              </Link>
            </li>
          </ul>
        </div>

        {/* Services */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Services</h3>
          <ul className="space-y-2 text-sm">
            <li className="hover:text-gray-200 cursor-pointer">Premium Membership</li>
            <li className="hover:text-gray-200 cursor-pointer">Verified Profiles</li>
            <li className="hover:text-gray-200 cursor-pointer">Matchmaking</li>
            <li className="hover:text-gray-200 cursor-pointer">Privacy & Security</li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
          <p className="text-sm">📍 India</p>
          <p className="text-sm">📞 +91 98765 43210</p>
          <p className="text-sm">✉ support@smartmatrimony.com</p>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="bg-black bg-opacity-20 text-center py-4 text-sm">
        © {new Date().getFullYear()} Smart Matrimony. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;