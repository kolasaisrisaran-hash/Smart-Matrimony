import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Loader from "../components/Loader";
import { useNavigate } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

const Matches = () => {
  const navigate = useNavigate();
  const loggedUser = JSON.parse(localStorage.getItem("logged_user") || "null");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [profiles, setProfiles] = useState([]);
  const [acceptedMatchIds, setAcceptedMatchIds] = useState([]);
  const [shortlistedIds, setShortlistedIds] = useState([]);
  const [shortlistingId, setShortlistingId] = useState("");
  const [removingShortlistId, setRemovingShortlistId] = useState("");

  const [filters, setFilters] = useState({
    q: "",
    gender: "",
    minAge: "",
    maxAge: "",
    city: "",
    religion: "",
    caste: "",
    sort: "relevance",
  });

  const loadProfiles = async (isRefresh = false) => {
    try {
      isRefresh ? setRefreshing(true) : setLoading(true);

      const [profilesRes, inboxRes, sentRes, shortlistRes] = await Promise.all([
        axios.get(`${API_BASE}/api/profiles`),
        loggedUser?._id
          ? axios.get(`${API_BASE}/api/interests/inbox/${loggedUser._id}`)
          : Promise.resolve({ data: [] }),
        loggedUser?._id
          ? axios.get(`${API_BASE}/api/interests/sent/${loggedUser._id}`)
          : Promise.resolve({ data: [] }),
        loggedUser?._id
          ? axios.get(`${API_BASE}/api/shortlist/${loggedUser._id}`)
          : Promise.resolve({ data: [] }),
      ]);

      const list = profilesRes.data || [];

      const cleaned = list
        .filter((p) => (loggedUser?._id ? p._id !== loggedUser._id : true))
        .filter((p) => (p.status || "active") !== "blocked");

      setProfiles(cleaned);

      const inboxAccepted = (inboxRes.data || [])
        .filter((item) => item.status === "accepted")
        .map((item) => item.fromUserId?._id || item.fromUserId);

      const sentAccepted = (sentRes.data || [])
        .filter((item) => item.status === "accepted")
        .map((item) => item.toUserId?._id || item.toUserId);

      const uniqueAcceptedIds = [...new Set([...inboxAccepted, ...sentAccepted])];
      setAcceptedMatchIds(uniqueAcceptedIds);

      const shortlistIds = (shortlistRes.data || [])
        .map((item) => item.profileId?._id || item.profileId)
        .filter(Boolean);

      setShortlistedIds(shortlistIds);
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to load matches ❌");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadProfiles(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addToShortlist = async (profileId) => {
    try {
      if (!loggedUser?._id) {
        alert("Please login again");
        navigate("/login");
        return;
      }

      if (shortlistedIds.includes(profileId)) return;

      setShortlistingId(profileId);

      const res = await axios.post(`${API_BASE}/api/shortlist/add`, {
        userId: loggedUser._id,
        profileId,
      });

      setShortlistedIds((prev) => [...prev, profileId]);

      alert(res.data?.message || "Added to shortlist ⭐");
    } catch (err) {
      console.error("Shortlist add error:", err);
      alert(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to add shortlist ❌"
      );
    } finally {
      setShortlistingId("");
    }
  };

  const removeFromShortlist = async (profileId) => {
    try {
      if (!loggedUser?._id) {
        alert("Please login again");
        navigate("/login");
        return;
      }

      setRemovingShortlistId(profileId);

      const res = await axios.delete(`${API_BASE}/api/shortlist/remove`, {
        data: {
          userId: loggedUser._id,
          profileId,
        },
      });

      setShortlistedIds((prev) => prev.filter((id) => id !== profileId));

      alert(res.data?.message || "Removed from shortlist ❌");
    } catch (err) {
      console.error("Shortlist remove error:", err);
      alert(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to remove shortlist ❌"
      );
    } finally {
      setRemovingShortlistId("");
    }
  };

  const handleChange = (e) => {
    setFilters((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const clearFilters = () => {
    setFilters({
      q: "",
      gender: "",
      minAge: "",
      maxAge: "",
      city: "",
      religion: "",
      caste: "",
      sort: "relevance",
    });
  };

  const filtered = useMemo(() => {
    const q = filters.q.trim().toLowerCase();

    const out = profiles.filter((p) => {
      if (filters.gender && p.gender !== filters.gender) return false;

      const age = Number(p.age || 0);
      if (filters.minAge && age < Number(filters.minAge)) return false;
      if (filters.maxAge && age > Number(filters.maxAge)) return false;

      if (
        filters.city &&
        !(p.city || "").toLowerCase().includes(filters.city.toLowerCase())
      ) {
        return false;
      }

      if (
        filters.religion &&
        !(p.religion || "").toLowerCase().includes(filters.religion.toLowerCase())
      ) {
        return false;
      }

      if (
        filters.caste &&
        !(p.caste || "").toLowerCase().includes(filters.caste.toLowerCase())
      ) {
        return false;
      }

      if (q) {
        const hay =
          `${p.name || ""} ${p.city || ""} ${p.religion || ""} ${p.caste || ""} ${p.education || ""} ${p.occupation || ""}`.toLowerCase();

        if (!hay.includes(q)) return false;
      }

      return true;
    });

    if (filters.sort === "ageAsc") {
      out.sort((a, b) => Number(a.age || 0) - Number(b.age || 0));
    }

    if (filters.sort === "ageDesc") {
      out.sort((a, b) => Number(b.age || 0) - Number(a.age || 0));
    }

    if (filters.sort === "nameAsc") {
      out.sort((a, b) =>
        String(a.name || "").localeCompare(String(b.name || ""))
      );
    }

    return out;
  }, [profiles, filters]);

  const activeFilterChips = [
    filters.gender && `Gender: ${filters.gender}`,
    filters.minAge && `Min Age: ${filters.minAge}`,
    filters.maxAge && `Max Age: ${filters.maxAge}`,
    filters.city && `City: ${filters.city}`,
    filters.religion && `Religion: ${filters.religion}`,
    filters.caste && `Caste: ${filters.caste}`,
    filters.q && `Search: ${filters.q}`,
  ].filter(Boolean);

  return (
    <div className="page-fade min-h-screen bg-gradient-to-r from-pink-200 to-purple-200 px-4 py-10">
      <div className="max-w-6xl mx-auto">
        <div className="card-glass p-6 md:p-8 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h2 className="text-3xl font-extrabold text-pink-600">
                💞 Discover Matches
              </h2>
              <p className="text-gray-700 mt-1">
                Explore compatible profiles and connect with the right match.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <span className="bg-pink-100 text-pink-700 px-3 py-2 rounded-full text-sm font-bold border border-pink-200">
                {filtered.length} Profiles
              </span>

              <button
                onClick={() => loadProfiles(true)}
                className="btn-outline"
                disabled={refreshing}
              >
                {refreshing ? "Refreshing..." : "🔄 Refresh"}
              </button>

              <button onClick={clearFilters} className="btn-outline">
                ✨ Clear Filters
              </button>
            </div>
          </div>

          {activeFilterChips.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {activeFilterChips.map((chip) => (
                <span
                  key={chip}
                  className="px-3 py-1 rounded-full bg-white/80 border border-pink-200 text-pink-700 text-sm font-semibold"
                >
                  {chip}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <aside className="lg:col-span-4">
            <div className="card-glass p-6 sticky top-24">
              <h3 className="text-xl font-extrabold text-pink-600 mb-4">
                Filters
              </h3>

              <div className="space-y-3">
                <input
                  name="q"
                  value={filters.q}
                  onChange={handleChange}
                  placeholder="Search name, city, job..."
                  className="input-soft"
                />

                <select
                  name="gender"
                  value={filters.gender}
                  onChange={handleChange}
                  className="input-soft"
                >
                  <option value="">Gender (Any)</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>

                <div className="grid grid-cols-2 gap-3">
                  <input
                    name="minAge"
                    value={filters.minAge}
                    onChange={handleChange}
                    placeholder="Min Age"
                    className="input-soft"
                    inputMode="numeric"
                  />
                  <input
                    name="maxAge"
                    value={filters.maxAge}
                    onChange={handleChange}
                    placeholder="Max Age"
                    className="input-soft"
                    inputMode="numeric"
                  />
                </div>

                <input
                  name="city"
                  value={filters.city}
                  onChange={handleChange}
                  placeholder="City"
                  className="input-soft"
                />

                <input
                  name="religion"
                  value={filters.religion}
                  onChange={handleChange}
                  placeholder="Religion"
                  className="input-soft"
                />

                <input
                  name="caste"
                  value={filters.caste}
                  onChange={handleChange}
                  placeholder="Caste"
                  className="input-soft"
                />

                <select
                  name="sort"
                  value={filters.sort}
                  onChange={handleChange}
                  className="input-soft"
                >
                  <option value="relevance">Sort: Relevance</option>
                  <option value="ageAsc">Age: Low → High</option>
                  <option value="ageDesc">Age: High → Low</option>
                  <option value="nameAsc">Name: A → Z</option>
                </select>

                <div className="pt-2">
                  <button onClick={clearFilters} className="btn-primary w-full">
                    Apply / Reset
                  </button>
                </div>
              </div>
            </div>
          </aside>

          <main className="lg:col-span-8">
            {loading ? (
              <div className="card-glass p-10 flex justify-center">
                <Loader text="Loading matches..." />
              </div>
            ) : filtered.length === 0 ? (
              <div className="card-glass p-10 text-center">
                <div className="text-5xl mb-3">💔</div>
                <p className="text-gray-800 font-bold text-lg">
                  No matches found
                </p>
                <p className="text-gray-600 mt-1">
                  Try changing filters to discover more profiles.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filtered.map((p) => (
                  <ListCard
                    key={p._id}
                    p={p}
                    canMessage={acceptedMatchIds.includes(p._id)}
                    isShortlisted={shortlistedIds.includes(p._id)}
                    onView={() => navigate(`/matches/${p._id}`)}
                    onMessage={() =>
                      navigate("/chat", { state: { selectedUser: p } })
                    }
                    onShortlist={() => addToShortlist(p._id)}
                    onRemoveShortlist={() => removeFromShortlist(p._id)}
                    shortlisting={shortlistingId === p._id}
                    removingShortlist={removingShortlistId === p._id}
                  />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

const ListCard = ({
  p,
  onView,
  onMessage,
  canMessage,
  onShortlist,
  onRemoveShortlist,
  shortlisting,
  removingShortlist,
  isShortlisted,
}) => {
  return (
    <div className="card-glass p-5 hover:scale-[1.02] hover:shadow-xl transition duration-300">
      <div className="flex flex-col lg:flex-row lg:items-start gap-4">
        <div className="flex items-center gap-3 min-w-0 lg:w-[220px]">
          {p.photo ? (
            <img
              src={p.photo}
              alt="profile"
              className="w-16 h-16 rounded-full object-cover border-2 border-pink-400 shadow-sm"
              onError={(e) => (e.currentTarget.style.display = "none")}
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-pink-100 border border-pink-200 flex items-center justify-center text-pink-600 text-2xl font-extrabold">
              {p.name?.[0] || "U"}
            </div>
          )}

          <div className="min-w-0">
            <p className="text-lg font-extrabold text-gray-900 truncate flex items-center gap-2">
              {p.name || "-"}
              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">
                Verified
              </span>
            </p>
            <p className="text-sm text-gray-700 truncate">
              {p.age ? `${p.age} yrs` : "-"} • {p.city || "-"} • {p.gender || "-"}
            </p>
          </div>
        </div>

        <div className="flex-1 grid grid-cols-2 md:grid-cols-2 xl:grid-cols-3 gap-3">
          <Mini label="Religion" value={p.religion} />
          <Mini label="Caste" value={p.caste} />
          <Mini label="Education" value={p.education} />
          <Mini label="Job" value={p.occupation} />
          <Mini label="Height" value={p.height} />
          <Mini label="Income" value={p.income} />
        </div>

        <div className="lg:ml-auto flex flex-col sm:flex-row lg:flex-col gap-2 lg:min-w-[170px]">
          <button onClick={onView} className="btn-primary w-full">
            View Profile
          </button>

          {isShortlisted ? (
            <button
              onClick={onRemoveShortlist}
              className="w-full px-4 py-3 rounded-2xl font-bold bg-pink-100 text-pink-600 border border-pink-200 hover:bg-pink-200 transition"
              disabled={removingShortlist}
            >
              {removingShortlist ? "Removing..." : "❌ Remove Shortlist"}
            </button>
          ) : (
            <button
              onClick={onShortlist}
              className="btn-outline w-full"
              disabled={shortlisting}
            >
              {shortlisting ? "Adding..." : "⭐ Shortlist"}
            </button>
          )}

          {canMessage && (
            <button onClick={onMessage} className="btn-outline w-full">
              Chat Now 💬
            </button>
          )}
        </div>
      </div>

      {p.about && (
        <p className="mt-4 text-gray-700 text-sm leading-6 line-clamp-2">
          {p.about}
        </p>
      )}
    </div>
  );
};

const Mini = ({ label, value }) => (
  <div className="bg-white/80 border border-pink-100 rounded-xl p-3 min-w-0">
    <p className="text-[11px] text-pink-700 font-bold mb-1">{label}</p>
    <p className="text-gray-800 text-sm break-words">{value || "-"}</p>
  </div>
);

export default Matches;