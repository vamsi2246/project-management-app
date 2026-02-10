import React from "react";
import Sidebar from "./Sidebar";
import "../styles/TaskDetails.css";
import { Link } from "react-router-dom";
import { CalendarDays } from "lucide-react";

// Task Detail View
const TaskDetail = () => {
  const tasks = [
    {
      id: 1,
      title: "Wireframe Creation",
      assignee: "Victor Patterson",
      avatar: "https://i.pravatar.cc/40?img=68",
      status: "58%",
      updated: "6 mins",
    },
    {
      id: 2,
      title: "Finalizing UI Layout",
      assignee: "Fiona Augustine",
      avatar: "https://i.pravatar.cc/40?img=32",
      status: "13%",
      updated: "1 min",
    },
    {
      id: 3,
      title: "Component Setup",
      assignee: "Frederick Quinn",
      avatar: "https://i.pravatar.cc/40?img=21",
      status: "83%",
      updated: "7 mins",
    },
    {
      id: 4,
      title: "API Integration",
      assignee: "Andrew Quentin",
      avatar: "https://i.pravatar.cc/40?img=12",
      status: "87%",
      updated: "2 mins",
    },
    {
      id: 5,
      title: "Error Fixing",
      assignee: "Aman Dhoni",
      avatar: "https://i.pravatar.cc/40?img=45",
      status: "19%",
      updated: "10 mins",
    },
  ];

  return (
    <div className="taskdetail-wrapper">
      <Sidebar />

      <main className="taskdetail-main">
        <header className="taskdetail-header">
          <h1>Task Detail</h1>
        </header>

        <h2 className="taskdetail-title">Create Landing Page</h2>

        <div className="taskdetail-table">
          <div className="table-header">
            <p>Task Name</p>
            <p>Assignee</p>
            <p>Status</p>
            <p>Updated</p>
          </div>

          {tasks.map((task) => (
            <div key={task.id} className="table-row">
              <p className="task-name">{task.title}</p>

              <div className="assignee">
                <img src={task.avatar} alt="" />
                <span>{task.assignee}</span>
              </div>

              <span className="status-tag">{task.status}</span>

              <p className="updated">{task.updated}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default TaskDetail;
