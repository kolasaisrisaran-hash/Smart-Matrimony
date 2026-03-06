import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const getApiBase = () => {
  const host = window.location.hostname;
  return host === "localhost" ? "http://localhost:5000" : `http://${host}:5000`;
};

const ChangePassword = () => {
  const navigate = useNavigate();
  const API_BASE = getApiBase();

  const user = useSelector((state) => state.auth.user);

  const [form, setForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.newPassword.length < 4) {
      alert("New password minimum 4 characters");
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      alert("New password & confirm password not matching");
      return;
    }

    try {
      const res = await axios.post(`${API_BASE}/api/change-password`, {
        email: user.email,
        oldPassword: form.oldPassword,
        newPassword: form.newPassword,
      });

      alert(res.data.message);
      navigate("/dashboard");
    } catch (err) {
      alert(err?.response?.data?.message || "Change password failed ❌");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-pink-200 to-purple-200 px-4">
      <div className="card-glass p-8 w-full max-w-md">
        <h2 className="text-3xl font-extrabold text-center text-pink-600 mb-6">
          🔐 Change Password
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            name="oldPassword"
            placeholder="Old Password"
            value={form.oldPassword}
            onChange={handleChange}
            className="input-soft"
            required
          />

          <input
            type="password"
            name="newPassword"
            placeholder="New Password"
            value={form.newPassword}
            onChange={handleChange}
            className="input-soft"
            required
          />

          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm New Password"
            value={form.confirmPassword}
            onChange={handleChange}
            className="input-soft"
            required
          />

          <button type="submit" className="btn-primary w-full">
            Update Password
          </button>

          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="btn-outline w-full"
          >
            Back
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;