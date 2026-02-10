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

const Sidebar = () => {
  // Sidebar renders main navigation links
  return (
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
        <a className="sidebar-link">
          <HelpCircle size={20} /> Help
        </a>
      </div>
    </aside>
  );
};

export default Sidebar;
