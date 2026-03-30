import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { loginSuccess } from "../redux/authSlice";
import axios from "axios";
import Loader from "../components/Loader";

// ✅ Use Vercel env (Production) OR localhost (dev)
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const isAuth = useSelector((state) => state.auth.isAuthenticated);

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem("logged_user") || "null");

    if (isAuth || savedUser?._id) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuth, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const res = await axios.post(`${API_BASE}/api/login`, {
        email: form.email.trim(),
        password: form.password,
      });

      const user = res.data.user;

      localStorage.setItem("logged_user", JSON.stringify(user));
      localStorage.setItem("matrimony_profile", JSON.stringify(user));

      dispatch(loginSuccess(user));

      alert("Login success ✅");
      navigate("/dashboard", { replace: true });
    } catch (err) {
      alert(err?.response?.data?.message || err?.message || "Login failed ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-fade min-h-screen flex items-center justify-center bg-gradient-to-r from-pink-200 to-purple-200 px-4">
      <div className="card-glass p-8 w-full max-w-md">
        <h2 className="text-3xl font-extrabold text-center text-pink-600 mb-6">
          Login 💖
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            className="input-soft"
            required
          />

          <div className="relative w-full">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              className="input-soft w-full pr-24 password-input"
              required
            />

            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-pink-600 hover:text-pink-700 z-10 bg-transparent border-none"
            >
              {showPassword ? "Hide" : "View"}
            </button>
          </div>

          <button
            type="submit"
            className="btn-primary w-full"
            disabled={loading}
          >
            {loading ? <Loader text="Logging in..." /> : "Login"}
          </button>

          <button
            type="button"
            onClick={() => navigate("/register")}
            className="btn-outline w-full"
            disabled={loading}
          >
            Create Profile
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;