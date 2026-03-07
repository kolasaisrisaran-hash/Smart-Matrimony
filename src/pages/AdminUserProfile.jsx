import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE } from "../utils/api";

const AdminUserProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [p, setP] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadOne = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/api/profiles/${id}`);
      setP(res.data);
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to load profile ❌");
      setP(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOne();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-pink-200 to-purple-200">
        <p className="text-gray-700 font-semibold">Loading profile...</p>
      </div>
    );
  }

  if (!p) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-pink-200 to-purple-200">
        <div className="card-glass p-6 text-center">
          <p className="text-gray-700 font-semibold">No profile found.</p>
          <button onClick={() => navigate("/admin")} className="btn-outline mt-4">
            ⬅ Back to Admin
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-pink-200 to-purple-200 px-4 py-10">
      <div className="card-glass p-8 w-full max-w-4xl mx-auto">
        <div className="flex items-center justify-between gap-3 mb-6">
          <h2 className="text-3xl font-extrabold text-pink-600">
            👤 Full Profile View
          </h2>

          <div className="flex gap-2">
            <button
              onClick={() => navigate(`/admin/profile/${id}/edit`)}
              className="btn-primary"
            >
              ✏️ Edit
            </button>

            <button onClick={() => navigate("/admin")} className="btn-outline">
              ⬅ Back
            </button>
          </div>
        </div>

        {p.photo ? (
          <div className="flex justify-center mb-6">
            <img
              src={p.photo}
              alt="profile"
              className="w-32 h-32 rounded-full object-cover border-4 border-pink-500 shadow-lg"
              onError={(e) => (e.currentTarget.style.display = "none")}
            />
          </div>
        ) : null}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Info label="Name" value={p.name} />
          <Info label="Email" value={p.email} />
          <Info label="Phone" value={p.phone} />
          <Info label="Status" value={(p.status || "active").toUpperCase()} />
          <Info label="Gender" value={p.gender} />
          <Info label="DOB" value={p.dob} />
          <Info label="Age" value={p.age} />
          <Info label="Height" value={p.height} />
          <Info label="Marital Status" value={p.maritalStatus} />
          <Info label="Mother Tongue" value={p.motherTongue} />
          <Info label="Religion" value={p.religion} />
          <Info label="Caste" value={p.caste} />
          <Info label="Sub Caste" value={p.subCaste} />
          <Info label="Education" value={p.education} />
          <Info label="Occupation" value={p.occupation} />
          <Info label="Income" value={p.income} />
          <Info label="Country" value={p.country} />
          <Info label="State" value={p.state} />
          <Info label="City" value={p.city} />
          <Info label="Father Name" value={p.fatherName} />
          <Info label="Mother Name" value={p.motherName} />
          <Info label="Siblings" value={p.siblings} />
        </div>

        {p.about && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-pink-700 mb-2">About</h3>
            <div className="bg-white/70 border border-pink-100 rounded-xl p-4">
              <p className="text-gray-800">{p.about}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const Info = ({ label, value }) => (
  <div className="bg-white/70 border border-pink-100 rounded-xl p-3">
    <p className="text-sm text-pink-700 font-semibold">{label}</p>
    <p className="text-gray-800">{value || "-"}</p>
  </div>
);

export default AdminUserProfile;