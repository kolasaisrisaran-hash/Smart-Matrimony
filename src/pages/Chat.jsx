import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import API_BASE from "../utils/api";

const ONLINE_RECENT_MS = 2 * 60 * 1000;

const Chat = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const loggedUser = JSON.parse(localStorage.getItem("logged_user") || "null");

  const routeSelectedUserRef = useRef(location.state?.selectedUser || null);
  const handledRouteRef = useRef(false);
  const pollRef = useRef(null);
  const currentRequestRef = useRef(0);
  const messagesEndRef = useRef(null);

  const [sidebarUsers, setSidebarUsers] = useState([]);
  const [selectedChatId, setSelectedChatId] = useState(
    routeSelectedUserRef.current?._id || null
  );
  const [selectedChatUser, setSelectedChatUser] = useState(
    routeSelectedUserRef.current || null
  );
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [searchText, setSearchText] = useState("");
  const [pageLoading, setPageLoading] = useState(true);
  const [chatLoading, setChatLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [sidebarRefreshing, setSidebarRefreshing] = useState(false);

  useEffect(() => {
    if (!loggedUser?._id) return;

    const init = async () => {
      setPageLoading(true);
      await loadSidebar(true);
      setPageLoading(false);
    };

    init();
    updatePresence(true);

    const handleBeforeUnload = () => {
      sendPresenceBeacon(false);
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      updatePresence(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loggedUser?._id]);

  useEffect(() => {
    if (!loggedUser?._id) return;

    pollRef.current = setInterval(async () => {
      await loadSidebar(false);

      if (selectedChatId) {
        await loadMessages(selectedChatId, false, true);
      }
    }, 4000);

    return () => clearInterval(pollRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loggedUser?._id, selectedChatId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendPresenceBeacon = (online) => {
    try {
      if (!loggedUser?._id) return;

      navigator.sendBeacon(
        `${API_BASE}/api/users/online`,
        new Blob([JSON.stringify({ userId: loggedUser._id, online })], {
          type: "application/json",
        })
      );
    } catch (_) {}
  };

  const updatePresence = async (online) => {
    try {
      if (!loggedUser?._id) return;

      await axios.post(`${API_BASE}/api/users/online`, {
        userId: loggedUser._id,
        online,
      });
    } catch (error) {
      console.error("Presence update failed", error);
    }
  };

  const getImageSrc = (photoValue) => {
    if (!photoValue) return "";

    const value = String(photoValue).trim();
    if (!value) return "";

    if (
      value.startsWith("data:image/") ||
      value.startsWith("blob:") ||
      value.startsWith("http://") ||
      value.startsWith("https://")
    ) {
      return value;
    }

    if (value.startsWith("/")) {
      return `${API_BASE}${value}`;
    }

    return `${API_BASE}/${value}`;
  };

  const getInitial = (name) =>
    String(name || "U").trim().charAt(0).toUpperCase();

  const formatTime = (value) => {
    if (!value) return "";
    return new Date(value).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDateDivider = (value) => {
    if (!value) return "";
    return new Date(value).toLocaleDateString([], {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const isActuallyOnline = (user) => {
    if (!user) return false;
    if (user.online !== true) return false;
    if (!user.lastActive) return true;

    const diff = Date.now() - new Date(user.lastActive).getTime();
    return diff >= 0 && diff <= ONLINE_RECENT_MS;
  };

  const getStatusText = (user) => {
    if (!user) return "offline";
    if (isActuallyOnline(user)) return "online";
    if (user.lastActive) return "last seen recently";
    return "offline";
  };

  const fetchUnreadCounts = async () => {
    try {
      const res = await axios.get(
        `${API_BASE}/api/messages/unread/${loggedUser._id}`
      );

      const map = {};
      (res.data || []).forEach((item) => {
        map[item._id] = item.count;
      });

      return map;
    } catch (error) {
      console.error("Unread counts fetch failed", error);
      return {};
    }
  };

  const fetchAcceptedUsers = async () => {
    const [inboxRes, sentRes] = await Promise.all([
      axios.get(`${API_BASE}/api/interests/inbox/${loggedUser._id}`),
      axios.get(`${API_BASE}/api/interests/sent/${loggedUser._id}`),
    ]);

    const acceptedInbox = (inboxRes.data || [])
      .filter((item) => item.status === "accepted")
      .map((item) => item.fromUserId)
      .filter(Boolean);

    const acceptedSent = (sentRes.data || [])
      .filter((item) => item.status === "accepted")
      .map((item) => item.toUserId)
      .filter(Boolean);

    const allUsers = [...acceptedInbox, ...acceptedSent];

    return allUsers.filter(
      (user, index, self) =>
        user?._id &&
        index === self.findIndex((u) => u?._id === user?._id)
    );
  };

  const addRouteUserIfMissing = (users) => {
    const routeUser = routeSelectedUserRef.current;
    if (!routeUser?._id) return users;

    const alreadyExists = users.some((u) => u._id === routeUser._id);
    if (alreadyExists) return users;

    return [
      {
        ...routeUser,
        lastMessage: "Start a conversation",
        lastMessageTime: null,
        unreadCount: 0,
      },
      ...users,
    ];
  };

  const loadSidebar = async (showLoader = false) => {
    try {
      if (showLoader) {
        setPageLoading(true);
      } else {
        setSidebarRefreshing(true);
      }

      const [acceptedUsers, unreadMap] = await Promise.all([
        fetchAcceptedUsers(),
        fetchUnreadCounts(),
      ]);

      let enrichedUsers = await Promise.all(
        acceptedUsers.map(async (user) => {
          try {
            const msgRes = await axios.get(
              `${API_BASE}/api/messages/${loggedUser._id}/${user._id}`
            );

            const arr = msgRes.data || [];
            const last = arr.length ? arr[arr.length - 1] : null;

            return {
              ...user,
              lastMessage: last?.text || "Start a conversation",
              lastMessageTime: last?.createdAt || null,
              unreadCount: unreadMap[user._id] || 0,
            };
          } catch {
            return {
              ...user,
              lastMessage: "Start a conversation",
              lastMessageTime: null,
              unreadCount: unreadMap[user._id] || 0,
            };
          }
        })
      );

      enrichedUsers = addRouteUserIfMissing(enrichedUsers);

      enrichedUsers.sort((a, b) => {
        const aTime = a.lastMessageTime
          ? new Date(a.lastMessageTime).getTime()
          : 0;
        const bTime = b.lastMessageTime
          ? new Date(b.lastMessageTime).getTime()
          : 0;
        return bTime - aTime;
      });

      setSidebarUsers(enrichedUsers);

      if (selectedChatId) {
        const latestSelected = enrichedUsers.find((u) => u._id === selectedChatId);
        if (latestSelected) {
          setSelectedChatUser(latestSelected);
        }
      }

      if (
        !handledRouteRef.current &&
        routeSelectedUserRef.current?._id &&
        !messages.length
      ) {
        handledRouteRef.current = true;
        await openChat(routeSelectedUserRef.current, false);
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    } catch (error) {
      console.error("Sidebar load failed", error);
    } finally {
      if (showLoader) {
        setPageLoading(false);
      } else {
        setSidebarRefreshing(false);
      }
    }
  };

  const markMessagesSeen = async (otherUserId) => {
    try {
      await axios.patch(`${API_BASE}/api/messages/seen`, {
        senderId: otherUserId,
        receiverId: loggedUser._id,
      });

      setSidebarUsers((prev) =>
        prev.map((user) =>
          user._id === otherUserId ? { ...user, unreadCount: 0 } : user
        )
      );
    } catch (error) {
      console.error("Mark seen failed", error);
    }
  };

  const loadMessages = async (
    otherUserId,
    showLoader = true,
    preserveOnFail = false
  ) => {
    try {
      const requestId = Date.now();
      currentRequestRef.current = requestId;

      if (showLoader) setChatLoading(true);

      const res = await axios.get(
        `${API_BASE}/api/messages/${loggedUser._id}/${otherUserId}`
      );

      if (currentRequestRef.current !== requestId) return;

      setMessages(res.data || []);
    } catch (error) {
      console.error("Messages load failed", error);
      if (!preserveOnFail) setMessages([]);
    } finally {
      if (showLoader) setChatLoading(false);
    }
  };

  const openChat = async (user, showLoader = true) => {
    if (!user?._id) return;

    setSelectedChatId(user._id);
    setSelectedChatUser(user);

    await loadMessages(user._id, showLoader, false);
    await markMessagesSeen(user._id);
  };

  const handleSend = async () => {
    try {
      if (!text.trim() || !selectedChatId || sending) return;

      setSending(true);

      const res = await axios.post(`${API_BASE}/api/messages/send`, {
        sender: loggedUser._id,
        receiver: selectedChatId,
        text: text.trim(),
      });

      const newMessage = res.data.data;
      setMessages((prev) => [...prev, newMessage]);
      setText("");

      setSidebarUsers((prev) =>
        prev
          .map((user) =>
            user._id === selectedChatId
              ? {
                  ...user,
                  lastMessage: newMessage.text,
                  lastMessageTime: newMessage.createdAt,
                  unreadCount: 0,
                }
              : user
          )
          .sort((a, b) => {
            const aTime = a.lastMessageTime
              ? new Date(a.lastMessageTime).getTime()
              : 0;
            const bTime = b.lastMessageTime
              ? new Date(b.lastMessageTime).getTime()
              : 0;
            return bTime - aTime;
          })
      );
    } catch (error) {
      alert(error?.response?.data?.message || "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const filteredUsers = useMemo(() => {
    const q = searchText.trim().toLowerCase();
    if (!q) return sidebarUsers;

    return sidebarUsers.filter((user) => {
      const name = String(user?.name || "").toLowerCase();
      const city = String(user?.city || "").toLowerCase();
      const lastMessage = String(user?.lastMessage || "").toLowerCase();

      return name.includes(q) || city.includes(q) || lastMessage.includes(q);
    });
  }, [sidebarUsers, searchText]);

  const selectedChatImage = useMemo(
    () => getImageSrc(selectedChatUser?.photo),
    [selectedChatUser]
  );

  if (!loggedUser?._id) {
    return (
      <div className="min-h-screen bg-[#efeae2] flex items-center justify-center p-4">
        <div className="max-w-md w-full rounded-[28px] bg-white shadow-xl p-8 text-center">
          <div className="text-5xl mb-4">🔐</div>
          <h2 className="text-2xl font-extrabold text-[#e91e63]">
            Login required
          </h2>
          <button
            onClick={() => navigate("/login")}
            className="mt-6 px-5 py-3 rounded-2xl bg-[#e91e63] text-white font-semibold shadow-md"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (pageLoading) {
    return (
      <div className="min-h-screen bg-[#efeae2] p-3 md:p-5">
        <div className="max-w-7xl mx-auto h-[calc(100vh-24px)] md:h-[calc(100vh-40px)] rounded-[28px] bg-[#f7f5f3] shadow-2xl flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto rounded-full border-4 border-pink-100 border-t-pink-500 animate-spin" />
            <h2 className="mt-5 text-2xl font-extrabold text-[#e91e63]">
              Loading chats...
            </h2>
            <p className="text-gray-500 mt-2">
              Please wait while we prepare your conversations.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#efeae2] p-3 md:p-5">
      <div className="max-w-7xl mx-auto h-[calc(100vh-24px)] md:h-[calc(100vh-40px)] rounded-[28px] overflow-hidden shadow-2xl border border-[#f3dce5] bg-[#f7f5f3] flex">
        <div className="w-[360px] min-w-[360px] bg-[#fdf7fa] border-r border-[#f1d8e3] flex flex-col">
          <div className="px-5 py-4 border-b border-[#f1d8e3] bg-white/70">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-2xl font-extrabold text-[#e91e63]">
                My Chats
              </h2>

              <div className="flex items-center gap-2">
                {sidebarRefreshing && (
                  <span className="text-[11px] font-semibold px-2 py-1 rounded-full bg-white border text-gray-500">
                    Updating...
                  </span>
                )}

                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-pink-50 border border-pink-200 text-[#e91e63]">
                  {sidebarUsers.length}
                </span>
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <div className="flex-1 rounded-2xl bg-white border border-[#f1d8e3] px-4 py-3 shadow-sm">
                <input
                  type="text"
                  placeholder="Search chats..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="w-full bg-transparent outline-none text-sm text-gray-700 placeholder:text-gray-400"
                />
              </div>

              <button
                onClick={() => loadSidebar(false)}
                className="px-4 rounded-2xl bg-white border border-[#f1d8e3] text-[#e91e63] font-semibold shadow-sm hover:bg-pink-50"
              >
                ↻
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {filteredUsers.length === 0 ? (
              <div className="rounded-3xl bg-white border border-[#f1d8e3] p-6 text-center mt-3">
                <div className="text-4xl mb-3">
                  {sidebarUsers.length === 0 ? "💌" : "🔎"}
                </div>
                <p className="text-gray-700 font-semibold">
                  {sidebarUsers.length === 0 ? "No chats yet" : "No matching chats"}
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  {sidebarUsers.length === 0
                    ? "Accepted matches will appear here."
                    : "Try a different keyword."}
                </p>
              </div>
            ) : (
              filteredUsers.map((user) => {
                const imageSrc = getImageSrc(user.photo);
                const isActive = selectedChatId === user._id;
                const hasUnread = (user.unreadCount || 0) > 0 && !isActive;
                const online = isActuallyOnline(user);

                return (
                  <button
                    key={user._id}
                    onClick={() => openChat(user, true)}
                    className={`w-full text-left rounded-3xl p-3 transition-all border ${
                      isActive
                        ? "bg-[#ffeaf2] border-[#f7b5cc] shadow-sm"
                        : "bg-white border-[#f1d8e3] hover:bg-[#fff4f8]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {imageSrc ? (
                        <img
                          src={imageSrc}
                          alt={user.name}
                          className="w-14 h-14 rounded-full object-cover border border-pink-100"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-full bg-pink-100 text-[#e91e63] font-bold flex items-center justify-center border border-pink-200">
                          {getInitial(user.name)}
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-bold text-gray-800 truncate">
                            {user.name}
                          </p>

                          {user.lastMessageTime && (
                            <span className="text-[11px] text-gray-400 whitespace-nowrap">
                              {formatTime(user.lastMessageTime)}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 mt-1">
                          <span
                            className={`text-[11px] font-semibold ${
                              online ? "text-green-600" : "text-gray-400"
                            }`}
                          >
                            {online ? "online" : "offline"}
                          </span>

                          {hasUnread && (
                            <span className="min-w-5 h-5 px-1.5 rounded-full bg-[#e91e63] text-white text-[10px] font-bold flex items-center justify-center">
                              {user.unreadCount}
                            </span>
                          )}
                        </div>

                        <p
                          className={`mt-2 text-sm truncate ${
                            hasUnread ? "text-[#e91e63] font-semibold" : "text-gray-500"
                          }`}
                        >
                          {hasUnread ? "New message" : user.lastMessage}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        <div className="flex-1 flex flex-col bg-[#efeae2]">
          {!selectedChatUser ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
              <div className="w-24 h-24 rounded-full bg-white border border-[#f1d8e3] flex items-center justify-center text-4xl shadow-sm">
                💬
              </div>
              <h3 className="mt-5 text-2xl font-bold text-gray-700">
                Select a chat
              </h3>
              <p className="mt-2 text-gray-500 max-w-md">
                Choose a match from the left side to start chatting.
              </p>
            </div>
          ) : (
            <>
              <div className="px-5 py-4 bg-[#fdf7fa] border-b border-[#f1d8e3] flex items-center gap-3">
                {selectedChatImage ? (
                  <img
                    src={selectedChatImage}
                    alt={selectedChatUser.name}
                    className="w-12 h-12 rounded-full object-cover border border-pink-100"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-pink-100 text-[#e91e63] font-bold flex items-center justify-center border border-pink-200">
                    {getInitial(selectedChatUser.name)}
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-lg text-gray-800 truncate">
                    {selectedChatUser.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {selectedChatUser.city || "City not added"}
                  </p>
                  <p
                    className={`text-xs font-semibold mt-0.5 ${
                      isActuallyOnline(selectedChatUser)
                        ? "text-green-600"
                        : "text-gray-400"
                    }`}
                  >
                    {getStatusText(selectedChatUser)}
                  </p>
                </div>
              </div>

              <div
                className="flex-1 overflow-y-auto px-4 py-5 md:px-6"
                style={{
                  backgroundImage:
                    "radial-gradient(circle at 1px 1px, rgba(233,30,99,0.04) 1px, transparent 0)",
                  backgroundSize: "22px 22px",
                }}
              >
                {chatLoading ? (
                  <div className="h-full flex flex-col justify-center space-y-4">
                    <ChatBubbleSkeleton align="left" />
                    <ChatBubbleSkeleton align="right" />
                    <ChatBubbleSkeleton align="left" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 rounded-full bg-white border border-[#f1d8e3] flex items-center justify-center text-3xl shadow-sm">
                      ✨
                    </div>
                    <p className="text-gray-700 font-semibold mt-4">
                      No messages yet
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      Send the first message to start the conversation.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {messages.map((msg, index) => {
                      const isMine =
                        msg.sender === loggedUser._id ||
                        msg.sender?._id === loggedUser._id;

                      const currentDay = formatDateDivider(msg.createdAt);
                      const prevDay =
                        index > 0
                          ? formatDateDivider(messages[index - 1]?.createdAt)
                          : null;

                      return (
                        <React.Fragment key={msg._id}>
                          {currentDay !== prevDay && (
                            <div className="flex justify-center my-3">
                              <span className="px-3 py-1 rounded-full bg-white border border-[#f1d8e3] text-[11px] font-semibold text-gray-500 shadow-sm">
                                {currentDay}
                              </span>
                            </div>
                          )}

                          <div
                            className={`flex ${
                              isMine ? "justify-end" : "justify-start"
                            }`}
                          >
                            <div
                              className={`max-w-[78%] px-4 py-2.5 rounded-2xl shadow-sm ${
                                isMine
                                  ? "bg-[#e91e63] text-white rounded-br-md"
                                  : "bg-white text-gray-800 border border-[#f1d8e3] rounded-bl-md"
                              }`}
                            >
                              <p className="break-words text-[15px]">{msg.text}</p>
                              <p
                                className={`text-[10px] mt-1.5 text-right ${
                                  isMine ? "text-pink-100" : "text-gray-400"
                                }`}
                              >
                                {formatTime(msg.createdAt)}
                              </p>
                            </div>
                          </div>
                        </React.Fragment>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              <div className="p-4 bg-[#fdf7fa] border-t border-[#f1d8e3]">
                <div className="flex items-center gap-2 rounded-3xl bg-white border border-[#f1d8e3] px-3 py-2 shadow-sm">
                  <button
                    type="button"
                    className="w-10 h-10 rounded-full bg-pink-50 text-[#e91e63] text-lg font-bold hover:bg-pink-100"
                  >
                    😊
                  </button>

                  <input
                    type="text"
                    placeholder="Type a message"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    className="flex-1 bg-transparent outline-none px-2 py-2 text-gray-700 placeholder:text-gray-400"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleSend();
                      }
                    }}
                    disabled={sending}
                  />

                  <button
                    onClick={handleSend}
                    disabled={sending || !text.trim()}
                    className={`px-5 py-2.5 rounded-2xl font-semibold transition ${
                      sending || !text.trim()
                        ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                        : "bg-[#e91e63] text-white shadow-md hover:opacity-95"
                    }`}
                  >
                    {sending ? "Sending..." : "Send"}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const ChatBubbleSkeleton = ({ align = "left" }) => (
  <div className={`flex ${align === "right" ? "justify-end" : "justify-start"}`}>
    <div
      className={`rounded-2xl px-4 py-3 animate-pulse ${
        align === "right"
          ? "w-44 bg-pink-100"
          : "w-56 bg-white border border-pink-100"
      }`}
    >
      <div className="h-3 bg-gray-200 rounded w-3/4 mb-2" />
      <div className="h-3 bg-gray-200 rounded w-1/2" />
    </div>
  </div>
);

export default Chat;