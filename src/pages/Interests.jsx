import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Loader from "../components/Loader";

// ✅ Use Vercel env (Production) OR localhost (dev)
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

const Interests = () => {
  const user = JSON.parse(localStorage.getItem("logged_user") || "null");

  const [tab, setTab] = useState("inbox"); // inbox | sent | accepted
  const [loading, setLoading] = useState(true);
  const [inbox, setInbox] = useState([]);
  const [sent, setSent] = useState([]);

  const loadAll = async () => {
    try {
      setLoading(true);
      const [inb, snt] = await Promise.all([
        axios.get(`${API_BASE}/api/interests/inbox/${user._id}`),
        axios.get(`${API_BASE}/api/interests/sent/${user._id}`),
      ]);
      setInbox(inb.data || []);
      setSent(snt.data || []);
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to load interests ❌");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateStatus = async (interestId, status) => {
    try {
      await axios.patch(`${API_BASE}/api/interests/${interestId}`, { status });
      await loadAll();
    } catch (err) {
      alert(err?.response?.data?.message || "Update failed ❌");
    }
  };

  const pendingCount = useMemo(
    () => (inbox || []).filter((it) => it.status === "pending").length,
    [inbox]
  );

  const acceptedList = useMemo(() => {
    const a1 = (inbox || [])
      .filter((it) => it.status === "accepted")
      .map((it) => ({
        interestId: it._id,
        person: it.fromUserId,
      }));

    const a2 = (sent || [])
      .filter((it) => it.status === "accepted")
      .map((it) => ({
        interestId: it._id,
        person: it.toUserId,
      }));

    const map = new Map();
    [...a1, ...a2].forEach((x) => {
      const id = x.person?._id;
      if (id && !map.has(id)) map.set(id, x);
    });

    return Array.from(map.values());
  }, [inbox, sent]);

  return (
    <div className="page-fade min-h-screen bg-gradient-to-r from-pink-200 to-purple-200 px-4 py-10">
      <div className="max-w-5xl mx-auto card-glass p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-3xl font-extrabold text-pink-600">
              💌 Interests
            </h2>
            <p className="text-gray-700">Inbox, Sent & Accepted matches.</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              className={tab === "inbox" ? "btn-primary" : "btn-outline"}
              onClick={() => setTab("inbox")}
            >
              Inbox ({pendingCount})
            </button>

            <button
              className={tab === "sent" ? "btn-primary" : "btn-outline"}
              onClick={() => setTab("sent")}
            >
              Sent ({sent.length})
            </button>

            <button
              className={tab === "accepted" ? "btn-primary" : "btn-outline"}
              onClick={() => setTab("accepted")}
            >
              ✅ Accepted ({acceptedList.length})
            </button>

            <button className="btn-outline" onClick={loadAll}>
              🔄 Refresh
            </button>
          </div>
        </div>

        {loading ? (
          <div className="py-16 flex justify-center">
            <Loader text="Loading interests..." />
          </div>
        ) : tab === "inbox" ? (
          inbox.length === 0 ? (
            <p className="text-center text-gray-700">No inbox requests.</p>
          ) : (
            <div className="space-y-4">
              {inbox.map((it) => (
                <InterestCard
                  key={it._id}
                  user={it.fromUserId}
                  subText="Requested you"
                  rightButtons={
                    it.status === "pending" ? (
                      <div className="flex gap-2">
                        <button
                          className="btn-primary"
                          onClick={() => updateStatus(it._id, "accepted")}
                        >
                          ✅ Accept
                        </button>
                        <button
                          className="btn-outline"
                          onClick={() => updateStatus(it._id, "rejected")}
                        >
                          ❌ Reject
                        </button>
                      </div>
                    ) : (
                      <StatusBadge status={it.status} />
                    )
                  }
                />
              ))}
            </div>
          )
        ) : tab === "sent" ? (
          sent.length === 0 ? (
            <p className="text-center text-gray-700">No sent requests.</p>
          ) : (
            <div className="space-y-4">
              {sent.map((it) => (
                <InterestCard
                  key={it._id}
                  user={it.toUserId}
                  subText="You requested"
                  rightButtons={<StatusBadge status={it.status} />}
                />
              ))}
            </div>
          )
        ) : acceptedList.length === 0 ? (
          <p className="text-center text-gray-700">
            No accepted matches yet ✅
          </p>
        ) : (
          <div className="space-y-4">
            {acceptedList.map((m) => (
              <AcceptedCard
                key={m.person?._id || m.interestId}
                person={m.person}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const InterestCard = ({ user, rightButtons, subText }) => {
  return (
    <div className="bg-white/70 border border-pink-100 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center gap-4">
      <div className="flex items-center gap-3 min-w-0">
        {user?.photo ? (
          <img
            src={user.photo}
            alt="profile"
            className="w-14 h-14 rounded-full object-cover border-2 border-pink-400"
            onError={(e) => (e.currentTarget.style.display = "none")}
          />
        ) : (
          <div className="w-14 h-14 rounded-full bg-pink-100 border border-pink-200 flex items-center justify-center text-pink-600 font-extrabold text-xl">
            {user?.name?.[0] || "U"}
          </div>
        )}

        <div className="min-w-0">
          <p className="font-extrabold text-gray-900 truncate">
            {user?.name || "-"}
          </p>
          <p className="text-sm text-gray-700 truncate">
            {user?.age ? `${user.age} yrs` : "-"} • {user?.city || "-"} •{" "}
            {user?.gender || "-"}
          </p>
          <p className="text-xs text-gray-600 truncate">{subText}</p>
        </div>
      </div>

      <div className="sm:ml-auto">{rightButtons}</div>
    </div>
  );
};

const AcceptedCard = ({ person }) => {
  return (
    <div className="bg-white/70 border border-pink-100 rounded-2xl p-4 flex flex-col md:flex-row md:items-center gap-4">
      <div className="flex items-center gap-3 min-w-0">
        {person?.photo ? (
          <img
            src={person.photo}
            alt="profile"
            className="w-14 h-14 rounded-full object-cover border-2 border-pink-400"
            onError={(e) => (e.currentTarget.style.display = "none")}
          />
        ) : (
          <div className="w-14 h-14 rounded-full bg-pink-100 border border-pink-200 flex items-center justify-center text-pink-600 font-extrabold text-xl">
            {person?.name?.[0] || "U"}
          </div>
        )}

        <div className="min-w-0">
          <p className="font-extrabold text-gray-900 truncate">
            {person?.name || "-"}
          </p>
          <p className="text-sm text-gray-700 truncate">
            {person?.age ? `${person.age} yrs` : "-"} • {person?.city || "-"} •{" "}
            {person?.gender || "-"}
          </p>
        </div>
      </div>

      <div className="md:ml-auto grid grid-cols-1 sm:grid-cols-3 gap-2 w-full md:w-auto">
        <Mini label="Phone" value={person?.phone} />
        <Mini label="Email" value={person?.email} />
        <Mini label="Religion" value={person?.religion} />
      </div>
    </div>
  );
};

const Mini = ({ label, value }) => (
  <div className="bg-white/80 border border-pink-100 rounded-xl p-2">
    <p className="text-[11px] text-pink-700 font-bold">{label}</p>
    <p className="text-gray-800 text-sm truncate">{value || "-"}</p>
  </div>
);

const StatusBadge = ({ status }) => {
  const map = {
    pending: "⏳ Pending",
    accepted: "✅ Accepted",
    rejected: "❌ Rejected",
  };
  return (
    <div className="px-4 py-2 rounded-full bg-white border border-pink-200 text-pink-700 font-bold">
      {map[status] || status}
    </div>
  );
};

export default Interests;