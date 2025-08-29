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
  const [filter, setFilter] = useState("all");

  useEffect(() => { fetchTasks(); }, []);

  // -------------------------------
  // Fetch all tasks
  // -------------------------------
  const fetchTasks = async () => {
    const res = await axios.get("http://localhost:8000/api/projects/1/tasks");
    const grouped = { todo: [], in_progress: [], review: [], done: [] };
    res.data.forEach((t) => grouped[t.status].push(t));
    setTasks(grouped);
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
  // Drag & Drop Task Move
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
      user_id: 1, // 👉 replace with logged in user id
      content: newComment,
    });
    setComments([...comments, res.data]);
    setNewComment("");
  };

  const deleteComment = async (id) => {
    await axios.delete(`http://localhost:8000/api/comments/${id}`);
    setComments(comments.filter((c) => c.id !== id));
  };

  // -------------------------------
  // Attachments
  // -------------------------------
  const fetchAttachments = async (taskId) => {
    const res = await axios.get(`http://localhost:8000/api/tasks/${taskId}/attachments`);
    setAttachments(res.data);
  };

  const uploadAttachment = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    const res = await axios.post(
      `http://localhost:8000/api/tasks/${selectedTask.id}/attachments`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    setAttachments([...attachments, res.data]);
  };

  const deleteAttachment = async (id) => {
    await axios.delete(`http://localhost:8000/api/attachments/${id}`);
    setAttachments(attachments.filter((a) => a.id !== id));
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
        <button onClick={(e) => { e.stopPropagation(); deleteTask(task, status); }} className="text-red-500 text-xs">
          Delete
        </button>
      </div>
      {task.description && <p className="text-sm text-gray-600">{task.description}</p>}
      {task.due_date && (
        <p className={`text-xs mt-1 ${new Date(task.due_date) < new Date() ? "text-red-500 font-bold" : "text-gray-500"}`}>
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
          {tasks[key].filter(task => filter === "all" || (filter === "overdue" && new Date(task.due_date) < new Date()))
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
          <button onClick={() => addTask(key)} className="bg-blue-500 text-white px-2 py-1 rounded mt-1 w-full text-sm hover:bg-blue-600">
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
    overdue: Object.values(tasks).flat().filter(t => new Date(t.due_date) < new Date()).length
  };

  return (
    <div className="flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r p-4 hidden md:block">
        <h3 className="font-bold mb-4">Workspace</h3>
        <ul className="space-y-2">
          <li className="font-medium text-blue-600">Project Alpha</li>
          <li>Marketing Campaign</li>
        </ul>
        <h3 className="font-bold mt-6 mb-2">Quick Actions</h3>
        <ul className="space-y-2 text-sm">
          <li><button className="text-blue-600">+ Create Task</button></li>
          <li><button className="text-blue-600">View Analytics</button></li>
        </ul>
        <h3 className="font-bold mt-6 mb-2">Team</h3>
        <ul className="space-y-1 text-sm">
          <li>👩 Sarah Chen</li>
          <li>👨 Mike Johnson</li>
        </ul>
      </aside>

      {/* Main */}
      <div className="flex-1 p-6">
        {/* Top bar */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Project Alpha Board</h1>
            <p className="text-gray-600">Manage tasks and track progress</p>
          </div>
          <div className="space-x-2">
            <button onClick={() => setFilter("all")} className="px-3 py-1 border rounded">All</button>
            <button onClick={() => setFilter("overdue")} className="px-3 py-1 border rounded">Overdue</button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded shadow">Total Tasks {stats.total}</div>
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
              <p className="mb-2">{selectedTask.description}</p>
              <p className="mb-4">Due: {selectedTask.due_date}</p>

              {/* Comments */}
              <h3 className="font-semibold mb-2">Comments</h3>
              <ul className="space-y-2 mb-3">
                {comments.map(c => (
                  <li key={c.id} className="bg-gray-100 p-2 rounded flex justify-between items-center">
                    <span><b>{c.user?.name}</b>: {c.content}</span>
                    <button onClick={() => deleteComment(c.id)} className="text-red-500 text-xs">Delete</button>
                  </li>
                ))}
              </ul>
              <div className="flex gap-2 mb-4">
                <input value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Write a comment..." className="border p-2 rounded flex-1" />
                <button onClick={addComment} className="bg-blue-500 text-white px-3 py-1 rounded">Send</button>
              </div>

              {/* Attachments */}
              <h3 className="font-semibold mb-2">Attachments</h3>
              <ul className="space-y-2 mb-3">
                {attachments.map(a => (
                  <li key={a.id} className="flex justify-between items-center bg-gray-100 p-2 rounded">
                    <a href={`http://localhost:8000/storage/${a.file_path}`} target="_blank" rel="noreferrer" className="text-blue-600 underline">{a.file_name}</a>
                    <button onClick={() => deleteAttachment(a.id)} className="text-red-500 text-xs">Delete</button>
                  </li>
                ))}
              </ul>
              <input type="file" onChange={uploadAttachment} className="mb-4" />

              <button onClick={() => setSelectedTask(null)} className="mt-4 bg-gray-500 text-white px-3 py-1 rounded">Close</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
