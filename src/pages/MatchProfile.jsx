import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Loader from "../components/Loader";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

const MatchProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const me = JSON.parse(localStorage.getItem("logged_user") || "null");

  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [p, setP] = useState(null);
  const [interestStatus, setInterestStatus] = useState("none");

  const loadOne = async () => {
    try {
      setLoading(true);

      const profileRes = await axios.get(`${API_BASE}/api/profiles/${id}`);
      const profileData = profileRes.data;
      setP(profileData);

      if (!me?._id || me._id === profileData._id) {
        setInterestStatus("self");
        return;
      }

      const [inboxRes, sentRes] = await Promise.all([
        axios.get(`${API_BASE}/api/interests/inbox/${me._id}`),
        axios.get(`${API_BASE}/api/interests/sent/${me._id}`),
      ]);

      const inboxList = inboxRes.data || [];
      const sentList = sentRes.data || [];

      const sentInterest = sentList.find(
        (item) => item.toUserId?._id === profileData._id
      );

      const receivedInterest = inboxList.find(
        (item) => item.fromUserId?._id === profileData._id
      );

      const existingInterest = sentInterest || receivedInterest;

      if (!existingInterest) {
        setInterestStatus("none");
      } else if (existingInterest.status === "pending") {
        setInterestStatus("pending");
      } else if (existingInterest.status === "accepted") {
        setInterestStatus("accepted");
      } else if (existingInterest.status === "rejected") {
        setInterestStatus("rejected");
      } else {
        setInterestStatus("none");
      }
    } catch (err) {
      alert(err?.response?.data?.message || "Profile not found ❌");
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

      if (!p?._id || me._id === p._id) return;

      setSending(true);

      await axios.post(`${API_BASE}/api/interests/send`, {
        fromUserId: me._id,
        toUserId: p._id,
      });

      setInterestStatus("pending");
      alert("Interest sent ✅");
    } catch (err) {
      alert(err?.response?.data?.message || "Failed ❌");
    } finally {
      setSending(false);
    }
  };

  const renderInterestButton = () => {
    if (interestStatus === "self") return null;

    if (interestStatus === "accepted") {
      return (
        <button
          className="w-full mt-5 py-3 rounded-2xl font-bold text-white bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 shadow-md transition duration-300"
          onClick={() =>
            navigate("/chat", {
              state: {
                selectedUser: p,
              },
            })
          }
        >
          💬 Chat Now
        </button>
      );
    }

    if (interestStatus === "pending") {
      return (
        <button className="w-full mt-5 py-3 rounded-2xl font-bold bg-pink-100 text-pink-600 border border-pink-200 cursor-not-allowed">
          ⏳ Interest Sent
        </button>
      );
    }

    if (interestStatus === "rejected") {
      return (
        <button className="w-full mt-5 py-3 rounded-2xl font-bold bg-gray-100 text-gray-500 border border-gray-200 cursor-not-allowed">
          ❌ Rejected
        </button>
      );
    }

    return (
      <button
        className="btn-primary w-full mt-5"
        onClick={sendInterest}
        disabled={sending}
      >
        {sending ? "Sending..." : "💌 Send Interest"}
      </button>
    );
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
      <div className="card-glass p-8 w-full max-w-6xl mx-auto">
        <div className="flex items-center justify-between gap-3 mb-6">
          <h2 className="text-3xl font-extrabold text-pink-600">
            👤 Match Profile
          </h2>
          <button onClick={() => navigate("/matches")} className="btn-outline">
            ⬅ Back
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 items-start">
          <div className="w-full lg:w-1/3">
            <div className="bg-white/70 border border-pink-100 rounded-2xl p-5 text-center">
              {p.photo ? (
                <img
                  src={p.photo}
                  alt="profile"
                  className="w-32 h-32 mx-auto rounded-full object-cover border-4 border-pink-500 shadow-lg"
                  onError={(e) => (e.currentTarget.style.display = "none")}
                />
              ) : (
                <div className="w-32 h-32 mx-auto rounded-full bg-pink-100 border-4 border-pink-300 flex items-center justify-center text-pink-600 text-4xl font-extrabold">
                  {p.name?.[0] || "U"}
                </div>
              )}

              <h3 className="mt-4 text-2xl font-extrabold text-gray-900">
                {p.name}
              </h3>
              <p className="text-gray-700">
                {p.age ? `${p.age} yrs` : "-"} • {p.city || "-"}
              </p>

              <div className="mt-4 grid grid-cols-2 gap-2">
                <MiniTag text={p.gender || "—"} />
                <MiniTag text={p.religion || "—"} />
              </div>

              {renderInterestButton()}
            </div>
          </div>

          <div className="w-full lg:w-2/3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Info label="Phone" value={p.phone} />
              <Info label="Email" value={p.email} />
              <Info label="Date of Birth" value={p.dob} />
              <Info label="Age" value={p.age ? `${p.age} yrs` : "-"} />
              <Info label="Height" value={p.height} />
              <Info label="Gender" value={p.gender} />
              <Info label="Marital Status" value={p.maritalStatus} />
              <Info label="Mother Tongue" value={p.motherTongue} />
              <Info label="Religion" value={p.religion} />
              <Info label="Caste" value={p.caste} />
              <Info label="Sub-Caste" value={p.subCaste} />
              <Info label="Education" value={p.education} />
              <Info label="Occupation" value={p.occupation} />
              <Info label="Annual Income" value={p.income} />
              <Info label="Country" value={p.country} />
              <Info label="State" value={p.state} />
              <Info label="City" value={p.city} />
              <Info label="Father Name" value={p.fatherName} />
              <Info label="Mother Name" value={p.motherName} />
              <Info label="Siblings" value={p.siblings} />
            </div>

            <div className="mt-6">
              <h3 className="text-lg font-extrabold text-pink-700 mb-2">
                About
              </h3>
              <div className="bg-white/70 border border-pink-100 rounded-xl p-4">
                <p className="text-gray-800">
                  {p.about || "No about information added yet."}
                </p>
              </div>
            </div>
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
    <p className="text-gray-800 break-words">{value || "-"}</p>
  </div>
);

export default MatchProfile;