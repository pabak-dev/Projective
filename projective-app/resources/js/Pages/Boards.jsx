import React, { useEffect, useState } from "react";
import axios from "axios";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

export default function Boards() {
  const [tasks, setTasks] = useState({ todo: [], in_progress: [], review: [], done: [] });
  const [newTask, setNewTask] = useState({ todo: "", in_progress: "", review: "", done: "" });
  const [selectedTask, setSelectedTask] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [filter, setFilter] = useState("all");
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");

  useEffect(() => {
    fetchTasks();
    fetchUsers();
  }, []);

  // -------------------------------
  // Fetch tasks
  // -------------------------------
  const fetchTasks = async () => {
    const res = await axios.get("http://localhost:8000/api/projects/1/tasks");
    const grouped = { todo: [], in_progress: [], review: [], done: [] };
    res.data.forEach((t) => grouped[t.status].push(t));
    setTasks(grouped);
  };

  // -------------------------------
  // Fetch users
  // -------------------------------
  const fetchUsers = async () => {
    const res = await axios.get("http://localhost:8000/api/users");
    setUsers(res.data);
  };

  // -------------------------------
  // Add Task
  // -------------------------------
  const addTask = async (status) => {
    if (!newTask[status].trim()) return;
    const res = await axios.post("http://localhost:8000/api/projects/1/tasks", {
      title: newTask[status],
      status,
      description: "",
      due_date: "2025-09-10",
    });
    setTasks({ ...tasks, [status]: [...tasks[status], res.data] });
    setNewTask({ ...newTask, [status]: "" });
  };

  // -------------------------------
  // Delete Task
  // -------------------------------
  const deleteTask = async (task, status) => {
    await axios.delete(`http://localhost:8000/api/tasks/${task.id}`);
    setTasks({ ...tasks, [status]: tasks[status].filter((t) => t.id !== task.id) });
  };

  // -------------------------------
  // Drag & Drop
  // -------------------------------
  const handleDragEnd = async (result) => {
    if (!result.destination) return;
    const { source, destination } = result;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const sourceTasks = [...tasks[source.droppableId]];
    const [moved] = sourceTasks.splice(source.index, 1);
    moved.status = destination.droppableId;

    const destTasks = [...tasks[destination.droppableId]];
    destTasks.splice(destination.index, 0, moved);

    setTasks({
      ...tasks,
      [source.droppableId]: sourceTasks,
      [destination.droppableId]: destTasks,
    });

    await axios.put(`http://localhost:8000/api/tasks/${moved.id}`, { status: moved.status });
  };

  // -------------------------------
  // Comments
  // -------------------------------
  const fetchComments = async (taskId) => {
    const res = await axios.get(`http://localhost:8000/api/tasks/${taskId}/comments`);
    setComments(res.data);
  };

  const addComment = async () => {
    if (!newComment.trim()) return;
    const res = await axios.post(`http://localhost:8000/api/tasks/${selectedTask.id}/comments`, {
      user_id: 1,
      content: newComment,
    });
    setComments([...comments, res.data]);
    setNewComment("");
    fetchTasks();
  };

  const deleteComment = async (id) => {
    await axios.delete(`http://localhost:8000/api/comments/${id}`);
    setComments(comments.filter((c) => c.id !== id));
    fetchTasks();
  };

  // -------------------------------
  // Attachments
  // -------------------------------
  const fetchAttachments = async (taskId) => {
    const res = await axios.get(`http://localhost:8000/api/tasks/${taskId}/attachments`);
    setAttachments(res.data);
  };

  const uploadAttachment = async () => {
    if (!selectedTask || !selectedFile) return;
    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const res = await axios.post(
        `http://localhost:8000/api/tasks/${selectedTask.id}/attachments`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      setAttachments([...attachments, res.data]);
      setSelectedFile(null);
      fetchTasks();
    } catch (error) {
      console.error(error);
    }
  };

  const deleteAttachment = async (id) => {
    await axios.delete(`http://localhost:8000/api/attachments/${id}`);
    setAttachments(attachments.filter((a) => a.id !== id));
    fetchTasks();
  };

  // -------------------------------
  // Assign / Unassign user
  // -------------------------------
  const assignUser = async () => {
    if (!selectedUser) return;
    const res = await axios.post(`http://localhost:8000/api/tasks/${selectedTask.id}/assign`, {
      user_id: selectedUser,
    });
    setSelectedTask(res.data.task);
    fetchTasks();
  };

  const unassignUser = async () => {
    await axios.post(`http://localhost:8000/api/tasks/${selectedTask.id}/unassign`);
    setSelectedTask({ ...selectedTask, assignee: null });
    fetchTasks();
  };

  // -------------------------------
  // Update Due Date
  // -------------------------------
  const updateDueDate = async (date) => {
    const res = await axios.put(`http://localhost:8000/api/tasks/${selectedTask.id}`, {
      due_date: date,
    });
    setSelectedTask(res.data);
    fetchTasks();
  };

  // -------------------------------
  // Render Task Card
  // -------------------------------
  const renderTaskCard = (task, status) => (
    <div
      className="bg-white p-3 rounded shadow mb-2 cursor-pointer hover:bg-gray-50"
      onClick={() => {
        setSelectedTask(task);
        fetchComments(task.id);
        fetchAttachments(task.id);
      }}
    >
      <div className="flex justify-between items-start">
        <p className="font-medium">{task.title}</p>
        <button
          onClick={(e) => { e.stopPropagation(); deleteTask(task, status); }}
          className="text-red-500 text-xs"
        >
          Delete
        </button>
      </div>
      {task.due_date && (
        <p
          className={`text-xs mt-1 ${
            new Date(task.due_date) < new Date() && task.status !== "done"
              ? "text-red-500 font-bold"
              : "text-gray-500"
          }`}
        >
          Due: {new Date(task.due_date).toLocaleDateString()}
        </p>
      )}
      <div className="flex justify-between text-xs text-gray-500 mt-2">
        <span>👤 {task.assignee?.name || "Unassigned"}</span>
        <div className="flex gap-3">
          <span>💬 {task.comments_count || 0}</span>
          <span>📎 {task.attachments_count || 0}</span>
        </div>
      </div>
    </div>
  );

  // -------------------------------
  // Render Column
  // -------------------------------
  const renderColumn = (title, key) => (
    <Droppable droppableId={key}>
      {(provided) => (
        <div ref={provided.innerRef} {...provided.droppableProps} className="bg-gray-100 p-4 rounded min-h-[300px]">
          <h2 className="font-semibold mb-2">{title}</h2>
          {tasks[key]
            .filter(
              (task) =>
                filter === "all" || (filter === "overdue" && new Date(task.due_date) < new Date())
            )
            .map((task, index) => (
              <Draggable key={task.id} draggableId={task.id.toString()} index={index}>
                {(provided) => (
                  <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                    {renderTaskCard(task, key)}
                  </div>
                )}
              </Draggable>
            ))}
          {provided.placeholder}
          <input
            value={newTask[key]}
            onChange={(e) => setNewTask({ ...newTask, [key]: e.target.value })}
            placeholder="New task..."
            className="border p-1 w-full mt-2 rounded text-sm"
          />
          <button
            onClick={() => addTask(key)}
            className="bg-blue-500 text-white px-2 py-1 rounded mt-1 w-full text-sm hover:bg-blue-600"
          >
            + Add Task
          </button>
        </div>
      )}
    </Droppable>
  );

  // -------------------------------
  // Stats
  // -------------------------------
  const stats = {
    total: Object.values(tasks).flat().length,
    inProgress: tasks.in_progress.length,
    completed: tasks.done.length,
    overdue: Object.values(tasks).flat().filter((t) => new Date(t.due_date) < new Date() && t.status !== "done").length,
  };

  return (
    <div className="flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r p-4 hidden md:block">
        <h3 className="font-bold mb-4">Workspace</h3>
        <ul className="space-y-2">
          <li className="font-medium text-blue-600">Project Alpha</li>
        </ul>
      </aside>

      {/* Main */}
      <div className="flex-1 p-6">
        {/* Top bar */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Project Alpha Board</h1>
          <div className="space-x-2">
            <button onClick={() => setFilter("all")} className="px-3 py-1 border rounded">All</button>
            <button onClick={() => setFilter("overdue")} className="px-3 py-1 border rounded">Overdue</button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded shadow">Total {stats.total}</div>
          <div className="bg-white p-4 rounded shadow">In Progress {stats.inProgress}</div>
          <div className="bg-white p-4 rounded shadow">Completed {stats.completed}</div>
          <div className="bg-white p-4 rounded shadow">Overdue {stats.overdue}</div>
        </div>

        {/* Task Board */}
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {renderColumn("To Do", "todo")}
            {renderColumn("In Progress", "in_progress")}
            {renderColumn("Review", "review")}
            {renderColumn("Done", "done")}
          </div>
        </DragDropContext>

        {/* Task Modal */}
        {selectedTask && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
            <div className="bg-white p-6 rounded w-1/2 max-h-[80vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-2">{selectedTask.title}</h2>
              <p className="mb-4">Due: {selectedTask.due_date}</p>

              {/* Assignee */}
              <h3 className="font-semibold mb-2">Assignee</h3>
              <div className="flex gap-2 mb-4">
                <select
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                  className="border p-2 rounded flex-1"
                >
                  <option value="">-- Select User --</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                  ))}
                </select>
                <button onClick={assignUser} className="bg-green-500 text-white px-3 py-1 rounded">Assign</button>
                <button onClick={unassignUser} className="bg-red-500 text-white px-3 py-1 rounded">Unassign</button>
              </div>

              {/* Due Date */}
              <h3 className="font-semibold mb-2">Due Date</h3>
              <input
                type="date"
                value={selectedTask.due_date ? selectedTask.due_date.substring(0, 10) : ""}
                onChange={(e) => updateDueDate(e.target.value)}
                className="border p-2 rounded mb-4"
              />

              {/* Comments */}
              <h3 className="font-semibold mb-2">Comments</h3>
              <ul className="space-y-2 mb-3">
                {comments.map((c) => (
                  <li key={c.id} className="bg-gray-100 p-2 rounded flex justify-between items-center">
                    <span><b>{c.user?.name}</b>: {c.content}</span>
                    <button onClick={() => deleteComment(c.id)} className="text-red-500 text-xs">Delete</button>
                  </li>
                ))}
              </ul>
              <div className="flex gap-2 mb-4">
                <input
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Write a comment..."
                  className="border p-2 rounded flex-1"
                />
                <button onClick={addComment} className="bg-blue-500 text-white px-3 py-1 rounded">Send</button>
              </div>

              {/* Attachments */}
              <h3 className="font-semibold mb-2">Attachments</h3>
              <ul className="space-y-2 mb-3">
                {attachments.map((a) => (
                  <li key={a.id} className="flex justify-between items-center bg-gray-100 p-2 rounded">
                    <a href={`http://localhost:8000/storage/${a.file_path}`} target="_blank" rel="noreferrer" className="text-blue-600 underline">
                      {a.file_name}
                    </a>
                    <button onClick={() => deleteAttachment(a.id)} className="text-red-500 text-xs">Delete</button>
                  </li>
                ))}
              </ul>

              {/* File Upload */}
              <div className="flex gap-2 mb-4">
                <input type="file" onChange={(e) => setSelectedFile(e.target.files[0])} className="flex-1 border p-2 rounded" />
                <button
                  onClick={uploadAttachment}
                  disabled={!selectedFile}
                  className={`px-3 py-1 rounded text-white ${selectedFile ? "bg-blue-500 hover:bg-blue-600" : "bg-gray-400 cursor-not-allowed"}`}
                >
                  Upload
                </button>
              </div>

              <button onClick={() => setSelectedTask(null)} className="mt-4 bg-gray-500 text-white px-3 py-1 rounded">Close</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
