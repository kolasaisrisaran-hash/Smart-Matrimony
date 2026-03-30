import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import Loader from "../components/Loader";

// ✅ Use Vercel env (Production) OR localhost (dev)
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

const ProfilePreview = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const data =
    location.state?.data ||
    location.state ||
    JSON.parse(localStorage.getItem("matrimony_draft") || "null") ||
    JSON.parse(localStorage.getItem("matrimony_profile") || "null") ||
    {};

  const [saving, setSaving] = useState(false);

  // ✅ if user already exists (logged_user has _id) => EDIT MODE
  const loggedUser = JSON.parse(localStorage.getItem("logged_user") || "null");
  const isEdit = Boolean(loggedUser?._id);

  const handleConfirm = async () => {
    try {
      setSaving(true);

      if (isEdit) {
        // ✅ clean update payload
        const {
          _id,
          password,
          passwordHash,
          createdAt,
          updatedAt,
          __v,
          ...cleanData
        } = data;

        const res = await axios.put(
          `${API_BASE}/api/profiles/${loggedUser._id}`,
          cleanData
        );

        alert("Profile updated ✅");

        const updatedUser = res.data.user;
        localStorage.setItem("logged_user", JSON.stringify(updatedUser));
        localStorage.setItem("matrimony_profile", JSON.stringify(updatedUser));
        localStorage.setItem("matrimony_draft", JSON.stringify(updatedUser));
      } else {
        // ✅ NEW REGISTER
        const res = await axios.post(`${API_BASE}/api/register`, {
          ...data,
          password: data.password,
        });

        alert("Registered in MongoDB ✅");
        localStorage.setItem("matrimony_profile", JSON.stringify(res.data.user));
        localStorage.setItem("logged_user", JSON.stringify(res.data.user));
        localStorage.setItem("matrimony_draft", JSON.stringify(res.data.user));
      }

      navigate("/dashboard");
    } catch (err) {
      alert(err?.response?.data?.message || err?.message || "Save failed ❌");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = () => {
    localStorage.setItem("matrimony_draft", JSON.stringify(data));
    navigate("/register", { state: { mode: "edit", data } });
  };

  return (
    <div className="page-fade min-h-screen flex items-center justify-center bg-gradient-to-r from-pink-200 to-purple-200 px-4 py-10">
      <div className="card-glass p-8 md:p-10 w-full max-w-4xl">
        <h2 className="text-3xl md:text-4xl font-extrabold text-center text-pink-600 mb-8">
          💖 Profile Preview
        </h2>

        {Object.keys(data).length === 0 ? (
          <p className="text-center text-gray-700">No Profile Data Found.</p>
        ) : (
          <>
            {data.photo && (
              <div className="flex justify-center mb-8">
                <img
                  src={data.photo}
                  alt="Profile"
                  className="w-32 h-32 rounded-full object-cover border-4 border-pink-500 shadow-lg"
                  onError={(e) => (e.currentTarget.style.display = "none")}
                />
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-gray-700">
              <Info label="Name" value={data.name} />
              <Info label="Email" value={data.email} />
              <Info label="Phone" value={data.phone} />
              <Info label="City" value={data.city} />
              <Info label="Gender" value={data.gender} />
              <Info label="Date of Birth" value={data.dob} />
              <Info label="Age" value={data.age} />
              <Info label="Height" value={data.height} />
              <Info label="Marital Status" value={data.maritalStatus} />
              <Info label="Mother Tongue" value={data.motherTongue} />
              <Info label="Religion" value={data.religion} />
              <Info label="Caste" value={data.caste} />
              <Info label="Sub Caste" value={data.subCaste} />
              <Info label="Education" value={data.education} />
              <Info label="Occupation" value={data.occupation} />
              <Info label="Income" value={data.income} />
              <Info label="Country" value={data.country} />
              <Info label="State" value={data.state} />
              <Info label="Father Name" value={data.fatherName} />
              <Info label="Mother Name" value={data.motherName} />
              <Info label="Siblings" value={data.siblings} />
              <Info label="About" value={data.about} />
            </div>

            <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={handleEdit}
                className="btn-outline w-full"
                disabled={saving}
              >
                ✏️ Edit Profile
              </button>

              <button
                onClick={handleConfirm}
                className="btn-primary w-full"
                disabled={saving}
              >
                {saving ? (
                  <Loader text="Saving..." />
                ) : isEdit ? (
                  "✅ Confirm & Update"
                ) : (
                  "✅ Confirm & Register"
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const Info = ({ label, value }) => (
  <div className="bg-white/70 border border-pink-100 rounded-xl p-3">
    <p className="text-sm text-pink-700 font-semibold">{label}</p>
    <p className="text-gray-800 break-words">{value || "-"}</p>
  </div>
);

export default ProfilePreview;