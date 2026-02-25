import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import Sidebar from "./Sidebar";
import "../styles/Chat.css";
import { Send, Search, Edit, Phone, Video, MoreVertical, Paperclip, Smile, Mic, Loader2 } from "lucide-react";

// Initialize socket outside component to prevent multiple connections
// Initialize socket using relative path (proxied)
const socket = io();

const Chat = () => {
    const [activeChat, setActiveChat] = useState({ type: 'global', id: 'global', name: 'Global Team Chat' });
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [newMessage, setNewMessage] = useState("");
    const [users, setUsers] = useState([]);
    const [projects, setProjects] = useState([]);
    const [user, setUser] = useState(null); // Current user
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);

    // Search & Menu State
    const [searchQuery, setSearchQuery] = useState("");
    const [sidebarMenuOpen, setSidebarMenuOpen] = useState(false);
    const [chatMenuOpen, setChatMenuOpen] = useState(false);

    // Close menus on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!event.target.closest('.chat-sidebar-actions') && !event.target.closest('.chat-header-actions')) {
                setSidebarMenuOpen(false);
                setChatMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Filter Lists
    const filteredProjects = projects.filter(p => p.title?.toLowerCase().includes(searchQuery.toLowerCase()));
    const filteredUsers = users.filter(u => u.name?.toLowerCase().includes(searchQuery.toLowerCase()));

    // ... (keep useEffects for users/projects fetch)

    useEffect(() => {
        // Initialize user from localStorage
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {
                console.error("Failed to parse user from localStorage", e);
            }
        }

        const token = localStorage.getItem("token");
        const headers = token ? { "Authorization": `Bearer ${token}` } : {};

        // Fetch users
        fetch("/api/users", { headers })
            .then((res) => {
                if (!res.ok) throw new Error("Failed to fetch users");
                return res.json();
            })
            .then((data) => {
                if (Array.isArray(data)) {
                    setUsers(data);
                } else {
                    console.error("Expected users to be an array, got:", data);
                    setUsers([]);
                }
            })
            .catch((err) => console.error("Error loading users:", err));

        // Fetch projects
        fetch("/api/boards", { headers })
            .then((res) => {
                if (!res.ok) throw new Error("Failed to fetch boards");
                return res.json();
            })
            .then((data) => {
                if (Array.isArray(data)) {
                    setProjects(data);
                } else {
                    console.error("Expected projects to be an array, got:", data);
                    setProjects([]);
                }
            })
            .catch((err) => console.error("Error loading projects:", err));
    }, []);

    useEffect(() => {
        if (!user) return;

        // Clear messages and set loading when switching chats
        setMessages([]);
        setLoading(true);

        const token = localStorage.getItem("token");
        const headers = token ? { "Authorization": `Bearer ${token}` } : {};

        // Load messages for active chat
        let url = "/api/messages";
        if (activeChat.type === 'project') {
            url += `?projectId=${activeChat.id}`;
        } else if (activeChat.type === 'user') {
            url += `?recipientId=${activeChat.id}&userId=${user.id}`;
        } else {
            url += `?projectId=global`;
        }

        fetch(url, { headers })
            .then((res) => res.json())
            .then((data) => {
                if (Array.isArray(data)) {
                    setMessages(data);
                } else {
                    console.error("Expected messages to be an array, got:", data);
                    setMessages([]);
                }
            })
            .catch((err) => console.error("Error loading messages:", err))
            .finally(() => setLoading(false));

        // Join room
        if (activeChat.type === 'project') {
            socket.emit("join-project", activeChat.id);
        } else if (activeChat.type === 'user') {
            socket.emit("join-user", user.id);
        } else {
            socket.emit("join-project", "global");
        }

        const handleReceiveMessage = (message) => {
            setMessages((prev) => {
                // Deduplicate by ID
                if (prev.some(m => m.id === message.id)) return prev;

                const isDuplicateOptimistic = prev.some(m =>
                    m.userId === message.userId &&
                    m.content === message.content &&
                    (new Date(message.createdAt) - new Date(m.createdAt) < 2000)
                );

                let newMessages = prev;
                if (isDuplicateOptimistic) {
                    newMessages = prev.filter(m => !(
                        m.userId === message.userId &&
                        m.content === message.content &&
                        m.id > 1000000000000 // Simple check for Date.now() based ID
                    ));
                }

                if (activeChat.type === 'project' && message.projectId === activeChat.id) {
                    return [...newMessages, message];
                } else if (activeChat.type === 'user' && (message.userId === activeChat.id || message.recipientId === activeChat.id)) {
                    const isRelevantDM = (message.userId === user.id && message.recipientId === activeChat.id) ||
                        (message.userId === activeChat.id && message.recipientId === user.id);
                    if (isRelevantDM) return [...newMessages, message];
                    return prev;
                } else if (activeChat.type === 'global' && !message.projectId && !message.recipientId) {
                    return [...newMessages, message];
                }
                return prev;
            });
        };

        socket.on("receive-message", handleReceiveMessage);

        return () => {
            socket.off("receive-message", handleReceiveMessage);
        };
    }, [activeChat, user]);

    useEffect(() => {
        // Use 'auto' behavior for instant scrolling, which is often more reliable than 'smooth' when rapid updates occur
        messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
    }, [messages]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if ((!newMessage.trim()) || !user) return;

        const messageData = {
            userId: user.id,
            messageText: newMessage,
        };

        if (activeChat.type === 'project') {
            messageData.projectId = activeChat.id;
        } else if (activeChat.type === 'user') {
            messageData.recipientId = activeChat.id;
        } else {
            messageData.projectId = "global";
        }

        // Optimistic Update
        const optimisticMessage = {
            ...messageData,
            id: Date.now(), // Temp ID
            content: newMessage,
            createdAt: new Date().toISOString(),
            user: { ...user }
        };
        setMessages((prev) => [...prev, optimisticMessage]);

        socket.emit("send-message", messageData);
        setNewMessage("");
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file || !user) return;

        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const messageData = {
                userId: user.id,
                messageText: "", // Optional text with file
                attachmentUrl: reader.result,
                fileName: file.name,
                fileType: file.type
            };

            if (activeChat.type === 'project') {
                messageData.projectId = activeChat.id;
            } else if (activeChat.type === 'user') {
                messageData.recipientId = activeChat.id;
            } else {
                messageData.projectId = "global";
            }

            socket.emit("send-message", messageData);
        };
    };

    return (
        <div>
            <Sidebar />
            <main className="chat-layout">

                {/* LEFT SIDEBAR - MESSAGES LIST */}
                <div className="chat-sidebar">
                    <div className="chat-sidebar-header">
                        <h2>Messages</h2>
                        <div className="chat-sidebar-actions" style={{ position: 'relative' }}>
                            <button className="icon-btn"><Edit size={18} /></button>
                            <button className="icon-btn" onClick={() => setSidebarMenuOpen(!sidebarMenuOpen)}>
                                <MoreVertical size={18} />
                            </button>

                            {sidebarMenuOpen && (
                                <div className="chat-dropdown-menu">
                                    <div className="chat-dropdown-item">New group</div>
                                    <div className="chat-dropdown-item">Starred messages</div>
                                    <div className="chat-dropdown-item">Settings</div>
                                    <div className="chat-dropdown-item" onClick={() => {
                                        localStorage.removeItem("token");
                                        localStorage.removeItem("user");
                                        window.location.href = "/login";
                                    }}>Log out</div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="chat-search">
                        <Search size={16} className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search or start new chat"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="chat-sidebar-scroll-area">
                        <div className="chat-list-section">
                            <h3>Projects</h3>
                            <div className="chat-list">
                                {/* Global Chat always visible or filtered? Usually strictly matches query, but let's keep Global if query empty or matches 'Global' */}
                                {("Global Team Chat".toLowerCase().includes(searchQuery.toLowerCase())) && (
                                    <div
                                        className={`chat-item ${activeChat.type === 'global' ? 'active' : ''}`}
                                        onClick={() => setActiveChat({ type: 'global', id: 'global', name: 'Global Team Chat' })}
                                    >
                                        <div className="chat-item-avatar">
                                            <div className="avatar-circle">G</div>
                                        </div>
                                        <div className="chat-item-info">
                                            <span className="chat-item-name">Global Chat</span>
                                        </div>
                                    </div>
                                )}

                                {filteredProjects.map(p => (
                                    <div
                                        key={`project-${p.id}`}
                                        className={`chat-item ${activeChat.type === 'project' && activeChat.id === p.id ? 'active' : ''}`}
                                        onClick={() => setActiveChat({ type: 'project', id: p.id, name: p.title })}
                                    >
                                        <div className="chat-item-avatar">
                                            <div className="avatar-circle">{p.title?.charAt(0).toUpperCase()}</div>
                                        </div>
                                        <div className="chat-item-info">
                                            <span className="chat-item-name">{p.title}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="chat-list-section">
                            <h3>Direct Messages</h3>
                            <div className="chat-list">
                                {filteredUsers.filter(u => u.id !== user?.id).map(u => (
                                    <div
                                        key={`user-${u.id}`}
                                        className={`chat-item ${activeChat.type === 'user' && activeChat.id === u.id ? 'active' : ''}`}
                                        onClick={() => setActiveChat({ type: 'user', id: u.id, name: u.name })}
                                    >
                                        <div className="chat-item-avatar">
                                            {u.profilePic ? <img src={u.profilePic} alt={u.name} /> : u.name?.charAt(0).toUpperCase()}
                                            <span className="status-dot online"></span>
                                        </div>
                                        <div className="chat-item-info">
                                            <div className="chat-item-top">
                                                <span className="chat-item-name">{u.name}</span>
                                            </div>
                                            <div className="chat-item-bottom">
                                                <span className="chat-item-preview">Click to chat</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT SIDE - CHAT WINDOW */}
                <div className="chat-main">
                    <header className="chat-main-header">
                        <div className="chat-header-user">
                            <div className="chat-header-avatar">
                                <div className="avatar-circle">{activeChat.name?.charAt(0).toUpperCase()}</div>
                            </div>
                            <div className="chat-header-info">
                                <h3>{activeChat.name}</h3>
                                <span className="status-text">Online</span>
                            </div>
                        </div>
                        <div className="chat-header-actions" style={{ position: 'relative' }}>
                            <button className="icon-btn"><Search size={20} /></button>
                            <button className="icon-btn" onClick={() => setChatMenuOpen(!chatMenuOpen)}>
                                <MoreVertical size={20} />
                            </button>

                            {chatMenuOpen && (
                                <div className="chat-dropdown-menu right">
                                    <div className="chat-dropdown-item">Contact info</div>
                                    <div className="chat-dropdown-item">Select messages</div>
                                    <div className="chat-dropdown-item">Close chat</div>
                                    <div className="chat-dropdown-item">Mute notifications</div>
                                    <div className="chat-dropdown-item">Clear messages</div>
                                    <div className="chat-dropdown-item danger">Delete chat</div>
                                </div>
                            )}
                        </div>
                    </header>

                    <div className="chat-content">
                        <div className="date-separator">
                            <span>Today</span>
                        </div>

                        {loading ? (
                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: '#999' }}>
                                <Loader2 className="animate-spin" size={32} />
                            </div>
                        ) : (
                            <>
                                {Array.isArray(messages) && messages.map((msg, index) => {
                                    if (!msg) return null;
                                    const isMe = user && msg.userId === user.id;
                                    return (
                                        <div key={index} className={`chat-bubble-row ${isMe ? "me" : "other"}`}>
                                            {!isMe && (
                                                <div className="chat-bubble-avatar">
                                                    {msg.user?.profilePic ? <img src={msg.user.profilePic} alt={msg.user.name} /> : (msg.user?.name?.charAt(0).toUpperCase() || "?")}
                                                </div>
                                            )}
                                            <div className="chat-bubble-content">
                                                {!isMe && <span className="sender-name">{msg.user?.name}</span>}
                                                <div className="chat-bubble">
                                                    {msg.attachmentUrl && (
                                                        <div className="chat-attachment">
                                                            {typeof msg.fileType === 'string' && msg.fileType.startsWith("image/") ? (
                                                                <img
                                                                    src={msg.attachmentUrl}
                                                                    alt="attachment"
                                                                    className="chat-image-preview"
                                                                    style={{ maxWidth: "200px", borderRadius: "8px", marginBottom: "5px" }}
                                                                    onLoad={() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })}
                                                                />
                                                            ) : (
                                                                <a href={msg.attachmentUrl} download={msg.fileName || "attachment"} className="chat-file-link" style={{ color: "white", textDecoration: "underline" }}>
                                                                    📎 {msg.fileName || "Attachment"}
                                                                </a>
                                                            )}
                                                        </div>
                                                    )}
                                                    {msg.content}
                                                </div>
                                                <span className="chat-time">
                                                    {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                                <div ref={messagesEndRef} />
                            </>
                        )}
                    </div>

                    <div className="chat-input-wrapper">
                        <input
                            type="file"
                            ref={fileInputRef}
                            style={{ display: "none" }}
                            onChange={handleFileUpload}
                        />
                        <button className="icon-btn" onClick={() => fileInputRef.current.click()}>
                            <Paperclip size={20} />
                        </button>
                        <form className="chat-input-form" onSubmit={handleSendMessage}>
                            <input
                                type="text"
                                placeholder="Type a message..."
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                            />
                            <button type="button" className="icon-btn"><Smile size={20} /></button>
                        </form>
                        <button className="send-btn" onClick={handleSendMessage} aria-label="Send message">
                            <svg
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                style={{ transform: "translateX(-1px)" }}
                            >
                                <line x1="22" y1="2" x2="11" y2="13"></line>
                                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                            </svg>
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Chat;
