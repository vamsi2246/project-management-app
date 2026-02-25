import { NavLink } from "react-router-dom";
import "../styles/Sidebar.css";
import {
  Home,
  FolderKanban,
  CheckSquare,
  CalendarDays,
  BarChart3,
  FileStack,
  HelpCircle,
  MessageSquare,
  Settings
} from "lucide-react";
import React, { useState } from "react";
import HelpModal from "./HelpModal";

const Sidebar = () => {
  // Sidebar renders main navigation links
  const [showHelp, setShowHelp] = useState(false);

  return (
    <>
      {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}
      <aside className="sidebar">
        <h2 className="sidebar-logo">Project Manager</h2>

        <nav className="sidebar-nav">
          <NavLink to="/dashboard" className="sidebar-link">
            <Home size={20} /> Dashboard
          </NavLink>

          <NavLink to="/projects" className="sidebar-link">
            <FolderKanban size={20} /> Projects
          </NavLink>

          <NavLink to="/task-detail" className="sidebar-link">
            <CheckSquare size={20} /> Task Detail
          </NavLink>

          <NavLink to="/calendar" className="sidebar-link">
            <CalendarDays size={20} /> Calendar
          </NavLink>
          <NavLink to="/reports" className="sidebar-link">
            <BarChart3 size={20} /> Reports
          </NavLink>
          <NavLink to="/chat" className="sidebar-link">
            <MessageSquare size={20} /> Messages
          </NavLink>


          <NavLink to="/settings" className="sidebar-link">
            <Settings size={20} /> Settings
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <button className="sidebar-link" onClick={() => setShowHelp(true)} style={{ background: 'none', border: 'none', width: '100%', cursor: 'pointer' }}>
            <HelpCircle size={20} /> Help
          </button>
        </div>
      </aside>
    </>
  );
};

// Export Sidebar Component
export default Sidebar;
