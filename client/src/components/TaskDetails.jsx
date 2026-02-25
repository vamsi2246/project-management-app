import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import "../styles/TaskDetails.css";
import { Loader2 } from "lucide-react";

// Task Detail View
const TaskDetail = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem("user"));
        if (!storedUser) return;

        const boardsRes = await fetch(`/api/boards?userId=${storedUser.id}`);
        const boards = await boardsRes.json();

        if (!Array.isArray(boards)) {
          setTasks([]);
          setLoading(false);
          return;
        }

        const tasksPromises = boards.map(async (board) => {
          const res = await fetch(`/api/boards/${board.id}`);
          const boardData = await res.json();

          if (!boardData.lists) return [];

          const boardTasks = [];
          boardData.lists.forEach(list => {
            if (list.cards) {
              list.cards.forEach(card => {

                let assigneeName = "Unassigned";
                let assigneeAvatar = null;
                if (card.activity && card.activity.length > 0) {
                  const creatorActivity = card.activity.find(a => a.action === "CREATE_TASK");
                  const lastActivity = card.activity[0];

                  const act = creatorActivity || lastActivity;
                  if (act && act.user) {
                    assigneeName = act.user.name;
                    assigneeAvatar = act.user.profilePic;
                  }
                }
                let updatedTime = "Recently";
                if (card.activity && card.activity.length > 0) {
                  const latest = card.activity.reduce((latest, current) => {
                    return new Date(latest.createdAt) > new Date(current.createdAt) ? latest : current;
                  });

                  const diff = Date.now() - new Date(latest.createdAt).getTime();
                  const mins = Math.floor(diff / 60000);
                  if (mins < 60) updatedTime = `${mins} mins ago`;
                  else if (mins < 1440) updatedTime = `${Math.floor(mins / 60)} hours ago`;
                  else updatedTime = `${Math.floor(mins / 1440)} days ago`;
                }

                boardTasks.push({
                  id: card.id,
                  title: card.title,
                  assignee: assigneeName,
                  avatar: assigneeAvatar,
                  status: list.title, // Use List Name as status
                  updated: updatedTime,
                  projectName: board.title
                });
              });
            }
          });
          return boardTasks;
        });

        const allTasksArrays = await Promise.all(tasksPromises);
        const allTasks = allTasksArrays.flat();
        setTasks(allTasks);
      } catch (error) {
        console.error("Error fetching tasks:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  return (
    <div className="taskdetail-wrapper">
      <Sidebar />

      <main className="taskdetail-main">
        <header className="taskdetail-header">
          <h1>Task Detail</h1>
        </header>

        <h2 className="taskdetail-title">My Tasks & Assignments</h2>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="animate-spin text-blue-500" size={48} />
          </div>
        ) : (
          <div className="taskdetail-table">
            <div className="table-header">
              <p>Task Name</p>
              <p>Project</p>
              <p>Assignee</p>
              <p>Status</p>
              <p>Updated</p>
            </div>

            {tasks.length > 0 ? (
              tasks.map((task) => (
                <div key={task.id} className="table-row">
                  <p className="task-name">{task.title}</p>

                  <p className="task-project" style={{ fontSize: '0.9rem', color: '#888' }}>{task.projectName}</p>

                  <div className="assignee">
                    {task.avatar ? (
                      <img src={task.avatar} alt={task.assignee} />
                    ) : (
                      <div className="avatar-circle" style={{ width: '30px', height: '30px', borderRadius: '50%', background: '#ccc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', marginRight: '8px' }}>
                        {task.assignee.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span>{task.assignee}</span>
                  </div>

                  <span className="status-tag">{task.status}</span>

                  <p className="updated">{task.updated}</p>
                </div>
              ))
            ) : (
              <div className="no-tasks" style={{ padding: '20px', textAlign: 'center', color: '#888' }}>
                <p>No tasks found across your projects.</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default TaskDetail;
