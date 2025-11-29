// MessagesPage.jsx
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function MessagesPage({ palette }) {
  const { isDark, cardBg, textColor, secondaryText, borderColor, primaryGradientFrom, primaryGradientTo, successColor, errorColor, warningColor } = palette;

  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "John Doe",
      email: "john@example.com",
      subject: "Question about mock exam scheduling",
      message: "Hello admin, I was wondering when the next mock exam will be available? I'm preparing for the upcoming CSE and would like to practice more.",
      status: "Unread",
      priority: "Normal",
      receivedDate: "2 hours ago",
      avatar: "J",
    },
    {
      id: 2,
      sender: "Jane Smith",
      email: "jane@example.com",
      subject: "Technical issue with AI-generated questions",
      message: "I'm experiencing issues with the AI question generator. It keeps showing an error message. Can you please help?",
      status: "Unread",
      priority: "Urgent",
      receivedDate: "5 hours ago",
      avatar: "J",
    },
    {
      id: 3,
      sender: "Mike Johnson",
      email: "mike@example.com",
      subject: "Feedback on the platform",
      message: "I just wanted to say thank you for this amazing platform! The AI features are really helpful. Keep up the great work!",
      status: "Read",
      priority: "Normal",
      receivedDate: "1 day ago",
      avatar: "M",
    },
    {
      id: 4,
      sender: "Sarah Williams",
      email: "sarah@example.com",
      subject: "Request for additional study materials",
      message: "Could you please add more resources for the Analytical Ability section? I find the current materials a bit limited.",
      status: "Read",
      priority: "Normal",
      receivedDate: "2 days ago",
      avatar: "S",
    },
  ]);

  const [filterStatus, setFilterStatus] = useState("All");
  const [filterPriority, setFilterPriority] = useState("All");
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [replyText, setReplyText] = useState("");

  const filteredMessages = messages.filter((msg) => {
    const matchesStatus = filterStatus === "All" || msg.status === filterStatus;
    const matchesPriority = filterPriority === "All" || msg.priority === filterPriority;
    return matchesStatus && matchesPriority;
  });

  const getStatusColor = (status) => {
    return status === "Unread" ? errorColor : successColor;
  };

  const getPriorityColor = (priority) => {
    return priority === "Urgent" ? errorColor : primaryGradientFrom;
  };

  const handleMarkAsRead = (messageId) => {
    setMessages(messages.map(msg => 
      msg.id === messageId ? { ...msg, status: "Read" } : msg
    ));
  };

  const handleDeleteMessage = (messageId) => {
    if (window.confirm("Are you sure you want to delete this message?")) {
      setMessages(messages.filter(msg => msg.id !== messageId));
      setSelectedMessage(null);
    }
  };

  const handleSendReply = () => {
    if (replyText.trim()) {
      alert(`Reply sent to ${selectedMessage.sender}: ${replyText}`);
      setReplyText("");
      handleMarkAsRead(selectedMessage.id);
      setSelectedMessage(null);
    }
  };

  const unreadCount = messages.filter(msg => msg.status === "Unread").length;

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Total Messages", value: messages.length.toString(), icon: "fa-envelope", color: primaryGradientFrom },
          { label: "Unread", value: unreadCount.toString(), icon: "fa-envelope-open", color: errorColor },
          { label: "Read", value: (messages.length - unreadCount).toString(), icon: "fa-check", color: successColor },
          { label: "Urgent", value: messages.filter(m => m.priority === "Urgent").length.toString(), icon: "fa-exclamation-circle", color: warningColor },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-6 rounded-2xl"
            style={{
              backgroundColor: cardBg,
              border: `1px solid ${borderColor}`,
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${stat.color}20` }}
              >
                <i className={`fas ${stat.icon} text-xl`} style={{ color: stat.color }}></i>
              </div>
            </div>
            <h3 className="text-2xl font-bold mb-1" style={{ color: textColor }}>{stat.value}</h3>
            <p className="text-sm" style={{ color: secondaryText }}>{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div
        className="p-6 rounded-2xl"
        style={{
          backgroundColor: cardBg,
          border: `1px solid ${borderColor}`,
        }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-semibold mb-2 block" style={{ color: textColor }}>Filter by Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border outline-none"
              style={{
                backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.02)",
                borderColor,
                color: textColor,
              }}
            >
              <option value="All">All Messages</option>
              <option value="Unread">Unread</option>
              <option value="Read">Read</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-semibold mb-2 block" style={{ color: textColor }}>Filter by Priority</label>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border outline-none"
              style={{
                backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.02)",
                borderColor,
                color: textColor,
              }}
            >
              <option value="All">All Priorities</option>
              <option value="Urgent">Urgent</option>
              <option value="Normal">Normal</option>
            </select>
          </div>
        </div>
      </div>

      {/* Messages List */}
      <div className="space-y-4">
        {filteredMessages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-2xl cursor-pointer hover:scale-[1.01] transition-all"
            style={{
              backgroundColor: cardBg,
              border: `1px solid ${borderColor}`,
              opacity: msg.status === "Unread" ? 1 : 0.7,
            }}
            onClick={() => {
              setSelectedMessage(msg);
              if (msg.status === "Unread") {
                handleMarkAsRead(msg.id);
              }
            }}
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                {msg.avatar}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-bold" style={{ color: textColor }}>{msg.sender}</h4>
                      {msg.status === "Unread" && (
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: errorColor }}
                        ></span>
                      )}
                    </div>
                    <p className="text-sm" style={{ color: secondaryText }}>{msg.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className="px-3 py-1 rounded-full text-xs font-semibold"
                      style={{
                        backgroundColor: `${getStatusColor(msg.status)}20`,
                        color: getStatusColor(msg.status),
                      }}
                    >
                      {msg.status}
                    </span>
                    {msg.priority === "Urgent" && (
                      <span
                        className="px-3 py-1 rounded-full text-xs font-semibold"
                        style={{
                          backgroundColor: `${errorColor}20`,
                          color: errorColor,
                        }}
                      >
                        Urgent
                      </span>
                    )}
                  </div>
                </div>

                <h5 className="font-semibold mb-2" style={{ color: textColor }}>{msg.subject}</h5>
                <p className="text-sm line-clamp-2 mb-2" style={{ color: secondaryText }}>{msg.message}</p>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs" style={{ color: secondaryText }}>
                    <i className="fas fa-clock mr-1"></i>
                    {msg.receivedDate}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedMessage(msg);
                    }}
                    className="text-xs font-semibold"
                    style={{ color: primaryGradientFrom }}
                  >
                    View Details →
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Message Details Modal */}
      <AnimatePresence>
        {selectedMessage && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedMessage(null)}
          >
            <motion.div
              className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl p-6"
              style={{ backgroundColor: cardBg }}
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold" style={{ color: textColor }}>Message Details</h3>
                <button
                  onClick={() => setSelectedMessage(null)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)" }}
                >
                  <i className="fas fa-times" style={{ color: textColor }}></i>
                </button>
              </div>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl">
                    {selectedMessage.avatar}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xl font-bold mb-1" style={{ color: textColor }}>{selectedMessage.sender}</h4>
                    <p style={{ color: secondaryText }}>{selectedMessage.email}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span
                        className="px-3 py-1 rounded-full text-xs font-semibold"
                        style={{
                          backgroundColor: `${getStatusColor(selectedMessage.status)}20`,
                          color: getStatusColor(selectedMessage.status),
                        }}
                      >
                        {selectedMessage.status}
                      </span>
                      {selectedMessage.priority === "Urgent" && (
                        <span
                          className="px-3 py-1 rounded-full text-xs font-semibold"
                          style={{
                            backgroundColor: `${errorColor}20`,
                            color: errorColor,
                          }}
                        >
                          Urgent
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-semibold mb-2 block" style={{ color: textColor }}>Subject</label>
                  <div
                    className="p-4 rounded-xl"
                    style={{ backgroundColor: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)" }}
                  >
                    <p className="font-semibold" style={{ color: textColor }}>{selectedMessage.subject}</p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-semibold mb-2 block" style={{ color: textColor }}>Message</label>
                  <div
                    className="p-4 rounded-xl"
                    style={{ backgroundColor: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)" }}
                  >
                    <p style={{ color: textColor }}>{selectedMessage.message}</p>
                  </div>
                </div>

                <div
                  className="p-4 rounded-xl"
                  style={{ backgroundColor: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)" }}
                >
                  <p className="text-sm" style={{ color: secondaryText }}>
                    <i className="fas fa-clock mr-2"></i>
                    Received {selectedMessage.receivedDate}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-semibold mb-2 block" style={{ color: textColor }}>Reply to {selectedMessage.sender}</label>
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    rows="4"
                    className="w-full px-4 py-3 rounded-xl border outline-none resize-none"
                    style={{
                      backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.02)",
                      borderColor,
                      color: textColor,
                    }}
                    placeholder="Type your reply here..."
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleSendReply}
                    disabled={!replyText.trim()}
                    className="flex-1 py-3 rounded-xl font-semibold disabled:opacity-50"
                    style={{
                      background: `linear-gradient(135deg, ${primaryGradientFrom}, ${primaryGradientTo})`,
                      color: "#fff",
                    }}
                  >
                    <i className="fas fa-paper-plane mr-2"></i>
                    Send Reply
                  </button>
                  <button
                    onClick={() => handleDeleteMessage(selectedMessage.id)}
                    className="px-6 py-3 rounded-xl font-semibold"
                    style={{
                      backgroundColor: `${errorColor}20`,
                      color: errorColor,
                    }}
                  >
                    <i className="fas fa-trash mr-2"></i>
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}