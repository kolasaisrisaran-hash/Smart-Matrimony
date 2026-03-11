import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

const Chat = () => {
  const location = useLocation();
  const loggedUser = JSON.parse(localStorage.getItem("logged_user") || "null");

  const [matchedUsers, setMatchedUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [unreadMap, setUnreadMap] = useState({});
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchMatchedUsers();
    fetchUnreadCounts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!selectedUser?._id || !loggedUser?._id) return;

    const interval = setInterval(() => {
      fetchMessages(selectedUser, false);
      fetchUnreadCounts();
    }, 3000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedUser?._id, loggedUser?._id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchUnreadCounts = async () => {
    try {
      if (!loggedUser?._id) return;

      const res = await axios.get(
        `${API_BASE}/api/messages/unread/${loggedUser._id}`
      );

      const map = {};
      (res.data || []).forEach((item) => {
        map[item._id] = item.count;
      });

      setUnreadMap(map);
    } catch (error) {
      console.error("Failed to fetch unread counts", error);
    }
  };

  const markMessagesAsSeen = async (otherUserId) => {
    try {
      if (!loggedUser?._id || !otherUserId) return;

      await axios.patch(`${API_BASE}/api/messages/seen`, {
        senderId: otherUserId,
        receiverId: loggedUser._id,
      });

      setUnreadMap((prev) => ({
        ...prev,
        [otherUserId]: 0,
      }));
    } catch (error) {
      console.error("Failed to mark messages as seen", error);
    }
  };

  const fetchMatchedUsers = async () => {
    try {
      if (!loggedUser?._id) return;

      const inboxRes = await axios.get(
        `${API_BASE}/api/interests/inbox/${loggedUser._id}`
      );
      const sentRes = await axios.get(
        `${API_BASE}/api/interests/sent/${loggedUser._id}`
      );

      const acceptedInbox = (inboxRes.data || [])
        .filter((item) => item.status === "accepted")
        .map((item) => item.fromUserId)
        .filter(Boolean);

      const acceptedSent = (sentRes.data || [])
        .filter((item) => item.status === "accepted")
        .map((item) => item.toUserId)
        .filter(Boolean);

      const allMatched = [...acceptedInbox, ...acceptedSent];

      const uniqueMatched = allMatched.filter(
        (user, index, self) =>
          user?._id &&
          index === self.findIndex((u) => u?._id === user?._id)
      );

      setMatchedUsers(uniqueMatched);

      const routeSelectedUser = location.state?.selectedUser;

      if (routeSelectedUser?._id) {
        const matchedRouteUser =
          uniqueMatched.find((u) => u._id === routeSelectedUser._id) ||
          routeSelectedUser;

        await openChat(matchedRouteUser);
      }
    } catch (error) {
      console.error("Failed to load matched users", error);
    }
  };

  const fetchMessages = async (otherUser, shouldSetSelected = true) => {
    try {
      if (!otherUser?._id || !loggedUser?._id) return;

      if (shouldSetSelected) {
        setSelectedUser(otherUser);
      }

      const res = await axios.get(
        `${API_BASE}/api/messages/${loggedUser._id}/${otherUser._id}`
      );

      setMessages(res.data || []);
    } catch (error) {
      console.error("Failed to load messages", error);
      setMessages([]);
    }
  };

  const openChat = async (user) => {
    if (!user?._id) return;

    setSelectedUser(user);
    await fetchMessages(user, false);
    await markMessagesAsSeen(user._id);
    await fetchUnreadCounts();
  };

  const handleSend = async () => {
    try {
      if (!text.trim() || !selectedUser?._id || !loggedUser?._id) return;

      const res = await axios.post(`${API_BASE}/api/messages/send`, {
        sender: loggedUser._id,
        receiver: selectedUser._id,
        text: text.trim(),
      });

      setMessages((prev) => [...prev, res.data.data]);
      setText("");
    } catch (error) {
      alert(error?.response?.data?.message || "Failed to send message");
    }
  };

  const getLastMessage = (userId) => {
    const related = messages.filter((msg) => {
      const senderId = msg.sender?._id || msg.sender;
      const receiverId = msg.receiver?._id || msg.receiver;

      return senderId === userId || receiverId === userId;
    });

    if (!related.length) return "No messages yet";

    return related[related.length - 1]?.text || "No messages yet";
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-pink-100 via-rose-50 to-purple-100 p-4 md:p-6">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card-glass p-4 md:col-span-1">
          <h2 className="text-2xl font-bold text-pink-600 mb-4">My Chats 💬</h2>

          {matchedUsers.length === 0 ? (
            <p className="text-gray-600">No accepted matches yet.</p>
          ) : (
            <div className="space-y-3">
              {matchedUsers.map((user) => (
                <button
                  key={user._id}
                  onClick={() => openChat(user)}
                  className={`w-full text-left p-3 rounded-2xl border transition ${
                    selectedUser?._id === user._id
                      ? "border-pink-400 bg-pink-50"
                      : "border-pink-200 bg-white hover:bg-pink-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={user.photo || "https://via.placeholder.com/50"}
                      alt={user.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-semibold text-gray-800 truncate">
                          {user.name}
                        </p>

                        {unreadMap[user._id] > 0 && (
                          <span className="min-w-6 h-6 px-2 rounded-full bg-pink-500 text-white text-xs font-bold flex items-center justify-center">
                            {unreadMap[user._id]}
                          </span>
                        )}
                      </div>

                      <p className="text-sm text-gray-500 truncate">
                        {getLastMessage(user._id)}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="card-glass p-4 md:col-span-2 flex flex-col h-[70vh]">
          {!selectedUser ? (
            <div className="flex items-center justify-center h-full text-gray-500 text-lg">
              Select a match to start chatting
            </div>
          ) : (
            <>
              <div className="border-b border-pink-200 pb-3 mb-3 flex items-center gap-3">
                <img
                  src={selectedUser.photo || "https://via.placeholder.com/50"}
                  alt={selectedUser.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <h3 className="font-bold text-lg text-pink-600">
                    {selectedUser.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {selectedUser.city || "City not added"}
                  </p>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                {messages.length === 0 ? (
                  <p className="text-gray-500">No messages yet.</p>
                ) : (
                  messages.map((msg) => {
                    const isMine =
                      msg.sender === loggedUser._id ||
                      msg.sender?._id === loggedUser._id;

                    return (
                      <div
                        key={msg._id}
                        className={`flex ${
                          isMine ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-[75%] px-4 py-2 rounded-2xl shadow ${
                            isMine
                              ? "bg-pink-500 text-white"
                              : "bg-white text-gray-800 border border-pink-100"
                          }`}
                        >
                          <p>{msg.text}</p>
                          <p
                            className={`text-[10px] mt-1 ${
                              isMine ? "text-pink-100" : "text-gray-400"
                            }`}
                          >
                            {new Date(msg.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="mt-4 flex gap-2">
                <input
                  type="text"
                  placeholder="Type your message..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="input-soft"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSend();
                    }
                  }}
                />
                <button onClick={handleSend} className="btn-primary px-6">
                  Send
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;