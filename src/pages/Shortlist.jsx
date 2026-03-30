import React, { useEffect, useState } from "react";
import axios from "axios";
import Loader from "../components/Loader";
import { useNavigate } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

const Shortlist = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("logged_user") || "null");

  const [loading, setLoading] = useState(true);
  const [profiles, setProfiles] = useState([]);
  const [removingId, setRemovingId] = useState("");

  const loadShortlist = async () => {
    try {
      if (!user?._id) {
        alert("Please login again");
        navigate("/login");
        return;
      }

      setLoading(true);

      const res = await axios.get(`${API_BASE}/api/shortlist/${user._id}`);
      setProfiles(res.data || []);
    } catch (err) {
      console.error("Shortlist load error:", err);
      alert(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load shortlist ❌"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadShortlist();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const removeShortlist = async (profileId) => {
    try {
      if (!user?._id) return;

      setRemovingId(profileId);

      await axios.delete(`${API_BASE}/api/shortlist/remove`, {
        data: {
          userId: user._id,
          profileId,
        },
      });

      setProfiles((prev) =>
        prev.filter((item) => (item.profileId?._id || item.profileId) !== profileId)
      );
    } catch (err) {
      console.error("Shortlist remove error:", err);
      alert(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to remove ❌"
      );
    } finally {
      setRemovingId("");
    }
  };

  return (
    <div className="page-fade min-h-screen bg-gradient-to-r from-pink-200 to-purple-200 px-4 py-10">
      <div className="max-w-5xl mx-auto card-glass p-6 md:p-8">
        <div className="flex justify-between items-center mb-6 gap-4 flex-wrap">
          <h2 className="text-3xl font-extrabold text-pink-600">
            ⭐ My Shortlist
          </h2>

          <button
            onClick={() => navigate("/matches")}
            className="btn-outline"
          >
            ⬅ Back to Matches
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader text="Loading shortlist..." />
          </div>
        ) : profiles.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-3">⭐</div>
            <p className="font-bold text-gray-800">No shortlisted profiles</p>
            <p className="text-gray-600 mt-1">
              Save profiles from matches to see them here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {profiles.map((item) => {
              const p = item.profileId;
              if (!p) return null;

              return (
                <div
                  key={item._id}
                  className="bg-white/70 border border-pink-100 rounded-2xl p-4 flex flex-col lg:flex-row lg:items-center gap-4 hover:shadow-lg transition"
                >
                  <div className="flex items-center gap-3 min-w-0 lg:w-[260px]">
                    {p.photo ? (
                      <img
                        src={p.photo}
                        alt="profile"
                        className="w-16 h-16 rounded-full object-cover border-2 border-pink-400"
                        onError={(e) => (e.currentTarget.style.display = "none")}
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-pink-100 border border-pink-200 flex items-center justify-center text-pink-600 font-extrabold text-2xl">
                        {p.name?.[0] || "U"}
                      </div>
                    )}

                    <div className="min-w-0">
                      <p className="font-extrabold text-gray-900 flex items-center gap-2 truncate">
                        {p.name || "-"}
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">
                          Verified
                        </span>
                      </p>
                      <p className="text-sm text-gray-700 truncate">
                        {p.age ? `${p.age} yrs` : "-"} • {p.city || "-"} •{" "}
                        {p.gender || "-"}
                      </p>
                    </div>
                  </div>

                  <div className="flex-1 grid grid-cols-2 md:grid-cols-2 xl:grid-cols-4 gap-3">
                    <Mini label="Religion" value={p.religion} />
                    <Mini label="Caste" value={p.caste} />
                    <Mini label="Occupation" value={p.occupation} />
                    <Mini label="Income" value={p.income} />
                  </div>

                  <div className="lg:ml-auto flex flex-col sm:flex-row lg:flex-col gap-2 lg:min-w-[160px]">
                    <button
                      onClick={() => navigate(`/matches/${p._id}`)}
                      className="btn-primary w-full"
                    >
                      View Profile
                    </button>

                    <button
                      onClick={() => removeShortlist(p._id)}
                      className="btn-outline w-full"
                      disabled={removingId === p._id}
                    >
                      {removingId === p._id ? "Removing..." : "Remove ❌"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

const Mini = ({ label, value }) => (
  <div className="bg-white/80 border border-pink-100 rounded-xl p-3 min-w-0">
    <p className="text-[11px] text-pink-700 font-bold mb-1">{label}</p>
    <p className="text-gray-800 text-sm break-words">{value || "-"}</p>
  </div>
);

export default Shortlist;
