import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Loader from "../components/Loader";

const getApiBase = () => {
  const host = window.location.hostname;
  return host === "localhost" ? "http://localhost:5000" : `http://${host}:5000`;
};

const MatchProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const API_BASE = getApiBase();

  const me = JSON.parse(localStorage.getItem("logged_user") || "null");

  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [p, setP] = useState(null);

  const loadOne = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/api/profiles/${id}`);
      setP(res.data);
    } catch (err) {
      alert("Profile not found ❌");
      navigate("/matches");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOne();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const sendInterest = async () => {
    try {
      if (!me?._id) {
        alert("Please login again");
        navigate("/login");
        return;
      }
      setSending(true);

      await axios.post(`${API_BASE}/api/interests/send`, {
        fromUserId: me._id,
        toUserId: p._id,
      });

      alert("Interest sent ✅");
    } catch (err) {
      alert(err?.response?.data?.message || "Failed ❌");
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-pink-200 to-purple-200">
        <Loader text="Loading profile..." />
      </div>
    );
  }

  if (!p) return null;

  return (
    <div className="page-fade min-h-screen bg-gradient-to-r from-pink-200 to-purple-200 px-4 py-10">
      <div className="card-glass p-8 w-full max-w-4xl mx-auto">
        <div className="flex items-center justify-between gap-3 mb-6">
          <h2 className="text-3xl font-extrabold text-pink-600">👤 Match Profile</h2>
          <button onClick={() => navigate("/matches")} className="btn-outline">
            ⬅ Back
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-6 items-start">
          {/* Left */}
          <div className="w-full md:w-1/3">
            <div className="bg-white/70 border border-pink-100 rounded-2xl p-5 text-center">
              {p.photo ? (
                <img
                  src={p.photo}
                  alt="profile"
                  className="w-32 h-32 mx-auto rounded-full object-cover border-4 border-pink-500 shadow-lg"
                />
              ) : (
                <div className="w-32 h-32 mx-auto rounded-full bg-pink-100 border-4 border-pink-300 flex items-center justify-center text-pink-600 text-4xl font-extrabold">
                  {p.name?.[0] || "U"}
                </div>
              )}

              <h3 className="mt-4 text-xl font-extrabold text-gray-900">{p.name}</h3>
              <p className="text-gray-700">
                {p.age ? `${p.age} yrs` : "-"} • {p.city || "-"}
              </p>

              <div className="mt-4 grid grid-cols-2 gap-2">
                <MiniTag text={p.gender || "—"} />
                <MiniTag text={p.religion || "—"} />
              </div>

              <button
                className="btn-primary w-full mt-5"
                onClick={sendInterest}
                disabled={sending}
              >
                {sending ? "Sending..." : "💌 Send Interest"}
              </button>
            </div>
          </div>

          {/* Right */}
          <div className="w-full md:w-2/3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Info label="Phone" value={p.phone} />
              <Info label="Email" value={p.email} />
              <Info label="Education" value={p.education} />
              <Info label="Occupation" value={p.occupation} />
              <Info label="Caste" value={p.caste} />
              <Info label="Mother Tongue" value={p.motherTongue} />
              <Info label="Marital Status" value={p.maritalStatus} />
              <Info label="Country" value={p.country} />
            </div>

            {p.about && (
              <div className="mt-6">
                <h3 className="text-lg font-extrabold text-pink-700 mb-2">About</h3>
                <div className="bg-white/70 border border-pink-100 rounded-xl p-4">
                  <p className="text-gray-800">{p.about}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const MiniTag = ({ text }) => (
  <div className="px-3 py-2 rounded-full bg-white/80 border border-pink-100 text-pink-700 font-bold text-sm">
    {text}
  </div>
);

const Info = ({ label, value }) => (
  <div className="bg-white/70 border border-pink-100 rounded-xl p-3">
    <p className="text-sm text-pink-700 font-semibold">{label}</p>
    <p className="text-gray-800">{value || "-"}</p>
  </div>
);

export default MatchProfile;