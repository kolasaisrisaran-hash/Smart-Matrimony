import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE } from "../utils/api";

const AdminEditUser = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    city: "",
    state: "",
    country: "",
    gender: "",
    age: "",
    religion: "",
    caste: "",
    education: "",
    occupation: "",
    status: "active",
    about: "",
  });

  const loadUser = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/api/profiles/${id}`);
      const p = res.data;

      setForm({
        name: p.name || "",
        phone: p.phone || "",
        city: p.city || "",
        state: p.state || "",
        country: p.country || "",
        gender: p.gender || "",
        age: p.age ?? "",
        religion: p.religion || "",
        caste: p.caste || "",
        education: p.education || "",
        occupation: p.occupation || "",
        status: p.status || "active",
        about: p.about || "",
      });
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to load user ❌");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);

      await axios.patch(`${API_BASE}/api/profiles/${id}`, {
        ...form,
        age: form.age === "" ? "" : Number(form.age),
      });

      alert("Profile updated ✅");
      navigate(`/admin/profile/${id}`);
    } catch (err) {
      alert(err?.response?.data?.message || "Update failed ❌");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-pink-200 to-purple-200">
        <p className="text-gray-700 font-semibold">Loading user...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-pink-200 to-purple-200 px-4 py-10">
      <div className="card-glass p-8 w-full max-w-3xl mx-auto">
        <div className="flex items-center justify-between gap-3 mb-6">
          <h2 className="text-3xl font-extrabold text-pink-600">
            ✏️ Admin Edit User
          </h2>
          <button
            onClick={() => navigate(`/admin/profile/${id}`)}
            className="btn-outline"
          >
            ⬅ Back
          </button>
        </div>

        <form
          onSubmit={handleSave}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <input
            className="input-soft"
            name="name"
            placeholder="Name"
            value={form.name}
            onChange={handleChange}
            required
          />

          <input
            className="input-soft"
            name="phone"
            placeholder="Phone"
            value={form.phone}
            onChange={handleChange}
          />

          <input
            className="input-soft"
            name="city"
            placeholder="City"
            value={form.city}
            onChange={handleChange}
          />

          <input
            className="input-soft"
            name="state"
            placeholder="State"
            value={form.state}
            onChange={handleChange}
          />

          <input
            className="input-soft"
            name="country"
            placeholder="Country"
            value={form.country}
            onChange={handleChange}
          />

          <select
            className="input-soft"
            name="gender"
            value={form.gender}
            onChange={handleChange}
          >
            <option value="">Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>

          <input
            className="input-soft"
            name="age"
            placeholder="Age"
            value={form.age}
            onChange={handleChange}
          />

          <input
            className="input-soft"
            name="religion"
            placeholder="Religion"
            value={form.religion}
            onChange={handleChange}
          />

          <input
            className="input-soft"
            name="caste"
            placeholder="Caste"
            value={form.caste}
            onChange={handleChange}
          />

          <input
            className="input-soft"
            name="education"
            placeholder="Education"
            value={form.education}
            onChange={handleChange}
          />

          <input
            className="input-soft"
            name="occupation"
            placeholder="Occupation"
            value={form.occupation}
            onChange={handleChange}
          />

          <select
            className="input-soft"
            name="status"
            value={form.status}
            onChange={handleChange}
          >
            <option value="active">ACTIVE</option>
            <option value="blocked">BLOCKED</option>
          </select>

          <textarea
            className="input-soft md:col-span-2"
            name="about"
            placeholder="About"
            rows="4"
            value={form.about}
            onChange={handleChange}
          />

          <button
            type="submit"
            disabled={saving}
            className="btn-primary w-full md:col-span-2"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminEditUser;