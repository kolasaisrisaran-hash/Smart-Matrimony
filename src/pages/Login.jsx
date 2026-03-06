import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { loginSuccess } from "../redux/authSlice";
import axios from "axios";
import Loader from "../components/Loader";

const getApiBase = () => {
  const host = window.location.hostname;
  return host === "localhost" ? "http://localhost:5000" : `http://${host}:5000`;
};

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const API_BASE = getApiBase();

  const isAuth = useSelector((state) => state.auth.isAuthenticated);

  useEffect(() => {
    if (isAuth) navigate("/dashboard", { replace: true });
  }, [isAuth, navigate]);

  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      const res = await axios.post(`${API_BASE}/api/login`, {
        email: form.email.trim(),
        password: form.password,
      });

      localStorage.setItem("logged_user", JSON.stringify(res.data.user));
      dispatch(loginSuccess(res.data.user));

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

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            className="input-soft"
            required
          />

          <button type="submit" className="btn-primary w-full" disabled={loading}>
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