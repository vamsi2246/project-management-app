import React, { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import { Settings, Bell, LogOut, Moon } from "lucide-react";
import "../styles/Dashboard.css";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";

const Dashboard = () => {
  const navigate = useNavigate();
  const { darkMode, toggleTheme } = useTheme();
  const [user, setUser] = useState(null);

  const [tasks, setTasks] = useState([]);
  const [boards, setBoards] = useState([]);
  const [countdowns, setCountdowns] = useState({});
  const [activities, setActivities] = useState([]);

  /* ---------------- FETCH USER ---------------- */
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const urlUser = params.get("user");

        if (urlUser) {
          const decoded = JSON.parse(decodeURIComponent(urlUser));
          localStorage.setItem("user", JSON.stringify(decoded));
          localStorage.setItem("googleLogin", "true");
          setUser(decoded);
          fetchDashboard(decoded.id);
          return;
        }

        const googleFlag = localStorage.getItem("googleLogin");
        const savedUser = localStorage.getItem("user");

        if (googleFlag && savedUser) {
          const parsed = JSON.parse(savedUser);
          setUser(parsed);
          fetchDashboard(parsed.id);
          return;
        }

        const token = localStorage.getItem("token");
        if (!token) return navigate("/login");

        const res = await fetch("https://project-management-app-89n4.onrender.com/api/users/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) return navigate("/login");

        const userData = await res.json();
        localStorage.setItem("user", JSON.stringify(userData));
        setUser(userData);
        fetchDashboard(userData.id);

      } catch (err) {
        console.error(err);
        navigate("/login");
      }
    };

    fetchUser();
  }, [navigate]);

  /* ---------------- FETCH DASHBOARD ---------------- */
  const fetchDashboard = async (userId) => {
    const res = await fetch(`https://project-management-app-89n4.onrender.com/api/dashboard/${userId}`);
    const data = await res.json();

    setTasks(data.tasks || []);
    setBoards(data.boards || []);
    setActivities(data.activities || []);
  };

  /* ---------------- LOGOUT ---------------- */
  const handleLogout = async () => {
    localStorage.clear();
    await fetch("https://project-management-app-89n4.onrender.com/api/users/logout", { credentials: "include" });
    navigate("/login");
  };

  /* ---------------- COUNTDOWN TIMER ---------------- */
  useEffect(() => {
    const calculate = () => {
      const now = new Date().getTime();
      const updated = {};

      tasks.forEach((task) => {
        if (!task.dueDate) return;

        const diff = new Date(task.dueDate).getTime() - now;

        if (diff > 0) {
          const d = Math.floor(diff / (1000 * 60 * 60 * 24));
          const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          updated[task.id] = `${d}d ${h}h ${m}m`;
        } else {
          updated[task.id] = "Expired";
        }
      });

      setCountdowns(updated);
    };

    calculate();
    const interval = setInterval(calculate, 60000);
    return () => clearInterval(interval);
  }, [tasks]);

  /* ---------------- REAL STATS ---------------- */
  const totalBoards = boards.length;
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.completed).length;
  const activeTasks = totalTasks - completedTasks;

  return (
    <div className="dashboard-container">
      <Sidebar />

      <main className="main-body">

        {/* TOP BAR */}
        <div className="dashboard-top">
          <div className="top-right">

            <button className="icon icon-btn" onClick={toggleTheme}>
              <Moon size={20} fill={darkMode ? "currentColor" : "none"} />
            </button>

            <button className="icon icon-btn" onClick={() => navigate('/settings')}>
              <Settings size={18} />
            </button>

            <div className="icon"><Bell size={18} /></div>

            {user && (
              <div className="profile">
                {user.profilePic ? (
                  <img src={user.profilePic} alt="Profile" />
                ) : (
                  <div className="profile-initial">
                    {user?.name?.charAt(0)?.toUpperCase() || "U"}
                  </div>
                )}

                <span>{user?.name || user?.email}</span>

                <button className="logout-btn" onClick={handleLogout} aria-label="Logout">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                </button>

              </div>
            )}
          </div>
        </div>

        {/* HEADER */}
        <header className="dashboard-header">
          <h1>Welcome back, {user?.name?.split(" ")[0] || "there"}!</h1>
          <p>
            Here’s what’s happening today —{" "}
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "2-digit",
              year: "numeric",
            })}
          </p>
        </header>

        {/* STATS */}
        <div className="stats-container">
          <div className="stat-card total"><h3>Total Boards</h3><p>{totalBoards}</p></div>
          <div className="stat-card active"><h3>Active Tasks</h3><p>{activeTasks}</p></div>
          <div className="stat-card completed"><h3>Completed Tasks</h3><p>{completedTasks}</p></div>
        </div>

        {/* TASKS */}
        <section className="upcoming-section">
          <h2>Upcoming Deadlines</h2>

          <div className="tasks-grid">
            {tasks.map((task) => (
              <div className="task-card" key={task.id}>
                <h3>{task.title}</h3>

                <p className="type">📂 {task.board?.title || "Unknown Board"}</p>

                <p className="deadline">
                  {task.dueDate
                    ? new Date(task.dueDate).toLocaleString()
                    : "No Deadline"}
                </p>

                <div className="countdown">
                  ⏰ {countdowns[task.id] || "No date"}
                </div>

                <div className="progress-container">
                  <div className="progress-info">
                    <span>Status</span>
                    <span>{task.completed ? "Done" : "Pending"}</span>
                  </div>

                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: task.completed ? "100%" : "0%" }}
                    />
                  </div>
                </div>

              </div>
            ))}
          </div>
        </section>
        {/* BOARDS OVERVIEW */}
        <section className="boards-section">
          <h2>Boards Overview</h2>

          <div className="boards-grid">
            {boards.map((board) => {
              const boardTasks = tasks.filter(t => t.board?.id === board.id);
              const done = boardTasks.filter(t => t.completed).length;
              const total = boardTasks.length;
              const percent = total ? Math.round((done / total) * 100) : 0;

              return (
                <div className="board-card" key={board.id}>
                  <h3>{board.title}</h3>

                  <p className="board-meta">
                    ✅ {done} / {total} tasks
                  </p>

                  <div className="board-progress">
                    <div
                      className="board-progress-fill"
                      style={{ width: `${percent}%` }}
                    />
                  </div>

                  <span className="board-percent">{percent}% Complete</span>
                </div>
              );
            })}
          </div>
        </section>


      </main>

      {/* RIGHT PANEL */}
      <aside className="right-panel">
        <div className="widget-card">
          <h3>Recent Activity</h3>

          {activities.length === 0 && <p className="empty-text">No activity yet</p>}

          <ul>
            {activities.slice(0, 10).map((a) => (
              <li key={a.id}>
                <p>{a.message}</p>
                <span>{new Date(a.createdAt).toLocaleString()}</span>
              </li>
            ))}
          </ul>
        </div>
      </aside>

    </div>
  );
};

export default Dashboard;
