import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Loader from "../components/Loader";
import { useNavigate } from "react-router-dom";

const getApiBase = () => {
  const host = window.location.hostname;
  return host === "localhost" ? "http://localhost:5000" : `http://${host}:5000`;
};

const Matches = () => {
  const navigate = useNavigate();
  const API_BASE = getApiBase();

  const loggedUser = JSON.parse(localStorage.getItem("logged_user") || "null");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [profiles, setProfiles] = useState([]);

  const [filters, setFilters] = useState({
    q: "",
    gender: "",
    minAge: "",
    maxAge: "",
    city: "",
    religion: "",
    caste: "",
    sort: "relevance", // relevance | ageAsc | ageDesc | nameAsc
  });

  const loadProfiles = async (isRefresh = false) => {
    try {
      isRefresh ? setRefreshing(true) : setLoading(true);

      const res = await axios.get(`${API_BASE}/api/profiles`);
      const list = res.data || [];

      // ✅ remove logged user + blocked users
      const cleaned = list
        .filter((p) => (loggedUser?._id ? p._id !== loggedUser._id : true))
        .filter((p) => (p.status || "active") !== "blocked");

      setProfiles(cleaned);
    } catch (err) {
      alert("Failed to load matches ❌");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadProfiles(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (e) => {
    setFilters((p) => ({ ...p, [e.target.name]: e.target.value }));
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

    let out = profiles.filter((p) => {
      // gender
      if (filters.gender && p.gender !== filters.gender) return false;

      // age
      const age = Number(p.age || 0);
      if (filters.minAge && age < Number(filters.minAge)) return false;
      if (filters.maxAge && age > Number(filters.maxAge)) return false;

      // city/religion/caste
      if (filters.city && !(p.city || "").toLowerCase().includes(filters.city.toLowerCase()))
        return false;

      if (filters.religion && !(p.religion || "").toLowerCase().includes(filters.religion.toLowerCase()))
        return false;

      if (filters.caste && !(p.caste || "").toLowerCase().includes(filters.caste.toLowerCase()))
        return false;

      // search
      if (q) {
        const hay = `${p.name || ""} ${p.city || ""} ${p.religion || ""} ${p.caste || ""} ${
          p.education || ""
        } ${p.occupation || ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }

      return true;
    });

    // sort
    if (filters.sort === "ageAsc")
      out.sort((a, b) => Number(a.age || 0) - Number(b.age || 0));
    if (filters.sort === "ageDesc")
      out.sort((a, b) => Number(b.age || 0) - Number(a.age || 0));
    if (filters.sort === "nameAsc")
      out.sort((a, b) => String(a.name || "").localeCompare(String(b.name || "")));

    return out;
  }, [profiles, filters]);

  return (
    <div className="page-fade min-h-screen bg-gradient-to-r from-pink-200 to-purple-200 px-4 py-10">
      <div className="max-w-6xl mx-auto">
        {/* Top header */}
        <div className="card-glass p-6 md:p-8 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-3xl font-extrabold text-pink-600">💞 Matches</h2>
              <p className="text-gray-700">
                Find profiles using filters & search. Results:{" "}
                <b>{filtered.length}</b>
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => loadProfiles(true)}
                className="btn-outline"
                disabled={refreshing}
              >
                {refreshing ? "Refreshing..." : "🔄 Refresh"}
              </button>

              <button onClick={clearFilters} className="btn-outline">
                ✨ Clear
              </button>
            </div>
          </div>
        </div>

        {/* Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Sidebar */}
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

          {/* Results */}
          <main className="lg:col-span-8">
            {loading ? (
              <div className="card-glass p-10 flex justify-center">
                <Loader text="Loading matches..." />
              </div>
            ) : filtered.length === 0 ? (
              <div className="card-glass p-10 text-center">
                <p className="text-gray-700 font-semibold">No matches found.</p>
                <p className="text-gray-600">Try changing filters.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filtered.map((p) => (
                  <ListCard
                    key={p._id}
                    p={p}
                    onView={() => navigate(`/matches/${p._id}`)}
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

const ListCard = ({ p, onView }) => {
  return (
    <div className="card-glass p-5 hover:scale-[1.01] transition">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        {/* Avatar */}
        <div className="flex items-center gap-3 min-w-0">
          {p.photo ? (
            <img
              src={p.photo}
              alt="profile"
              className="w-16 h-16 rounded-full object-cover border-2 border-pink-400"
              onError={(e) => (e.currentTarget.style.display = "none")}
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-pink-100 border border-pink-200 flex items-center justify-center text-pink-600 text-2xl font-extrabold">
              {p.name?.[0] || "U"}
            </div>
          )}

          <div className="min-w-0">
            <p className="text-lg font-extrabold text-gray-900 truncate">
              {p.name || "-"}
            </p>
            <p className="text-sm text-gray-700 truncate">
              {p.age ? `${p.age} yrs` : "-"} • {p.city || "-"} •{" "}
              {p.gender || "-"}
            </p>
          </div>
        </div>

        {/* Details */}
        <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-2">
          <Mini label="Religion" value={p.religion} />
          <Mini label="Caste" value={p.caste} />
          <Mini label="Education" value={p.education} />
          <Mini label="Job" value={p.occupation} />
        </div>

        {/* Action */}
        <div className="sm:ml-auto">
          <button onClick={onView} className="btn-primary w-full sm:w-auto">
            View Profile
          </button>
        </div>
      </div>

      {p.about && (
        <p className="mt-4 text-gray-700 text-sm line-clamp-2">{p.about}</p>
      )}
    </div>
  );
};

const Mini = ({ label, value }) => (
  <div className="bg-white/70 border border-pink-100 rounded-xl p-2">
    <p className="text-[11px] text-pink-700 font-bold">{label}</p>
    <p className="text-gray-800 text-sm truncate">{value || "-"}</p>
  </div>
);

export default Matches;