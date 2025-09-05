import React, { useEffect, useState } from "react";
import axios from "axios";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
import {
    Plus,
    List,
    Clock,
    CheckCircle,
    AlertTriangle,
    MessageSquare,
    Paperclip,
    X,
} from "lucide-react";
import Sidebar from "@/Components/Sidebar";
import Modal from "@/Components/Modal";

export default function Boards() {
    const [tasks, setTasks] = useState({
        todo: [],
        in_progress: [],
        review: [],
        done: [],
    });
    const [newTask, setNewTask] = useState({
        todo: "",
        in_progress: "",
        review: "",
        done: "",
    });
    const [selectedTask, setSelectedTask] = useState(null);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");
    const [attachments, setAttachments] = useState([]);
    const [selectedFile, setSelectedFile] = useState(null);
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState("");

    useEffect(() => {
        fetchTasks();
        fetchUsers();
    }, []);

    const fetchTasks = async () => {
        const res = await axios.get("/api/projects/1/tasks");
        const grouped = { todo: [], in_progress: [], review: [], done: [] };
        if (res.data) {
            res.data.forEach((t) => {
                if (grouped[t.status]) {
                    grouped[t.status].push(t);
                }
            });
        }
        setTasks(grouped);
    };

    const fetchUsers = async () => {
        const res = await axios.get("/api/users");
        setUsers(res.data);
    };

    const addTask = async (status) => {
        if (!newTask[status].trim()) return;
        const res = await axios.post("/api/projects/1/tasks", {
            title: newTask[status],
            status,
            description: "",
            due_date: new Date().toISOString().slice(0, 10),
        });
        setTasks({ ...tasks, [status]: [...tasks[status], res.data] });
        setNewTask({ ...newTask, [status]: "" });
    };

    const handleDragEnd = async (result) => {
        if (!result.destination) return;
        const { source, destination } = result;
        if (
            source.droppableId === destination.droppableId &&
            source.index === destination.index
        )
            return;

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

        await axios.put(`/api/tasks/${moved.id}`, { status: moved.status });
    };

    const openTaskModal = async (task) => {
        // fetch full task details to get relations like comments, attachments, etc.
        const res = await axios.get(`/api/tasks/${task.id}`);
        setSelectedTask(res.data);
        setComments(res.data.comments || []);
        setAttachments(res.data.attachments || []);
    };

    const updateTaskInState = (updatedTask) => {
        // Helper to update a task in the main board state without a full refetch
        const newTasks = { ...tasks };
        Object.keys(newTasks).forEach((status) => {
            newTasks[status] = newTasks[status].map((task) =>
                task.id === updatedTask.id ? updatedTask : task
            );
        });
        setTasks(newTasks);
        fetchTasks(); // Also do a soft refetch to update counts
    };

    const addComment = async () => {
        if (!newComment.trim() || !selectedTask) return;
        // replace user_id: 1 with the actual authenticated user's ID
        const res = await axios.post(`/api/tasks/${selectedTask.id}/comments`, {
            user_id: 1,
            content: newComment,
        });
        setComments([...comments, res.data]);
        setNewComment("");
        updateTaskInState({
            ...selectedTask,
            comments_count: (selectedTask.comments_count || 0) + 1,
        });
    };

    const deleteComment = async (commentId) => {
        await axios.delete(`/api/comments/${commentId}`);
        setComments(comments.filter((c) => c.id !== commentId));
        updateTaskInState({
            ...selectedTask,
            comments_count: selectedTask.comments_count - 1,
        });
    };

    const uploadAttachment = async () => {
        if (!selectedTask || !selectedFile) return;
        const formData = new FormData();
        formData.append("file", selectedFile);
        const res = await axios.post(
            `/api/tasks/${selectedTask.id}/attachments`,
            formData
        );
        setAttachments([...attachments, res.data]);
        setSelectedFile(null);
        updateTaskInState({
            ...selectedTask,
            attachments_count: (selectedTask.attachments_count || 0) + 1,
        });
    };

    const deleteAttachment = async (attachmentId) => {
        await axios.delete(`/api/attachments/${attachmentId}`);
        setAttachments(attachments.filter((a) => a.id !== attachmentId));
        updateTaskInState({
            ...selectedTask,
            attachments_count: selectedTask.attachments_count - 1,
        });
    };

    const assignUser = async () => {
        if (!selectedUser || !selectedTask) return;
        const res = await axios.post(`/api/tasks/${selectedTask.id}/assign`, {
            user_id: selectedUser,
        });
        setSelectedTask(res.data.task);
        updateTaskInState(res.data.task);
    };

    const unassignUser = async () => {
        const res = await axios.post(`/api/tasks/${selectedTask.id}/unassign`);
        setSelectedTask(res.data.task);
        updateTaskInState(res.data.task);
    };

    const updateDueDate = async (date) => {
        const res = await axios.put(`/api/tasks/${selectedTask.id}`, {
            due_date: date,
        });
        setSelectedTask(res.data);
        updateTaskInState(res.data);
    };

    const updateDescription = async () => {
        const res = await axios.put(`/api/tasks/${selectedTask.id}`, {
            description: selectedTask.description,
        });
        setSelectedTask(res.data);
        updateTaskInState(res.data);
    };

    const stats = {
        total: Object.values(tasks).flat().length,
        inProgress: tasks.in_progress.length,
        completed: tasks.done.length,
        overdue: Object.values(tasks)
            .flat()
            .filter(
                (t) => new Date(t.due_date) < new Date() && t.status !== "done"
            ).length,
    };

    const columns = {
        todo: "To Do",
        in_progress: "In Progress",
        review: "Review",
        done: "Done",
    };

    const renderTaskCard = (task, status) => (
        <div
            className="bg-white p-3 rounded-md shadow-sm mb-3 border border-gray-200 cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => openTaskModal(task)}
        >
            <p className="font-semibold text-gray-800 text-sm mb-2">
                {task.title}
            </p>
            <div className="flex justify-between items-center text-xs text-gray-500 mt-3">
                <div className="flex items-center space-x-2">
                    <span>💬 {task.comments_count || 0}</span>
                    <span>📎 {task.attachments_count || 0}</span>
                </div>
                <span
                    className={`font-medium ${
                        new Date(task.due_date) < new Date() &&
                        task.status !== "done"
                            ? "text-red-500"
                            : ""
                    }`}
                >
                    {task.due_date
                        ? new Date(task.due_date).toLocaleDateString()
                        : ""}
                </span>
            </div>
        </div>
    );

    return (
        <AuthenticatedLayout>
            <Head title="Boards" />
            <div className="flex" style={{ height: "calc(100vh - 65px)" }}>
                <Sidebar />
                <main className="flex-1 overflow-y-auto">
                    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-800">
                                    Project Alpha Board
                                </h1>
                                <p className="text-gray-500">
                                    Manage tasks and track progress
                                </p>
                            </div>
                            <div className="flex items-center space-x-2 mt-4 sm:mt-0">
                                <button className="px-4 py-2 border rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                                    Filter
                                </button>
                                <button className="px-4 py-2 border rounded-md text-sm font-medium text-white bg-gray-800 hover:bg-gray-700 flex items-center">
                                    <Plus size={16} className="mr-1" /> Add Task
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                            <div className="bg-white p-4 rounded-lg border border-gray-200 flex items-center justify-between">
                                <div>
                                    <p className="text-gray-500 text-sm">
                                        Total Tasks
                                    </p>
                                    <p className="text-2xl font-bold">
                                        {stats.total}
                                    </p>
                                </div>
                                <List className="text-gray-400" />
                            </div>
                            <div className="bg-white p-4 rounded-lg border border-gray-200 flex items-center justify-between">
                                <div>
                                    <p className="text-gray-500 text-sm">
                                        In Progress
                                    </p>
                                    <p className="text-2xl font-bold">
                                        {stats.inProgress}
                                    </p>
                                </div>
                                <Clock className="text-gray-400" />
                            </div>
                            <div className="bg-white p-4 rounded-lg border border-gray-200 flex items-center justify-between">
                                <div>
                                    <p className="text-gray-500 text-sm">
                                        Completed
                                    </p>
                                    <p className="text-2xl font-bold">
                                        {stats.completed}
                                    </p>
                                </div>
                                <CheckCircle className="text-gray-400" />
                            </div>
                            <div className="bg-white p-4 rounded-lg border border-gray-200 flex items-center justify-between">
                                <div>
                                    <p className="text-gray-500 text-sm">
                                        Overdue
                                    </p>
                                    <p className="text-2xl font-bold">
                                        {stats.overdue}
                                    </p>
                                </div>
                                <AlertTriangle className="text-gray-400" />
                            </div>
                        </div>

                        <DragDropContext onDragEnd={handleDragEnd}>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {Object.entries(columns).map(([key, title]) => (
                                    <Droppable droppableId={key} key={key}>
                                        {(provided) => (
                                            <div
                                                ref={provided.innerRef}
                                                {...provided.droppableProps}
                                                className="bg-gray-50 p-4 rounded-lg border border-gray-200"
                                            >
                                                <div className="flex justify-between items-center mb-4">
                                                    <h2 className="font-bold text-gray-700">
                                                        {title}
                                                    </h2>
                                                    <span className="text-sm text-gray-500 bg-gray-200 rounded-full px-2 py-1">
                                                        {tasks[key].length}
                                                    </span>
                                                </div>
                                                <div className="min-h-[200px]">
                                                    {tasks[key].map(
                                                        (task, index) => (
                                                            <Draggable
                                                                key={task.id.toString()}
                                                                draggableId={task.id.toString()}
                                                                index={index}
                                                            >
                                                                {(provided) => (
                                                                    <div
                                                                        ref={
                                                                            provided.innerRef
                                                                        }
                                                                        {...provided.draggableProps}
                                                                        {...provided.dragHandleProps}
                                                                    >
                                                                        {renderTaskCard(
                                                                            task,
                                                                            key
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </Draggable>
                                                        )
                                                    )}
                                                    {provided.placeholder}
                                                </div>
                                                <div className="mt-3">
                                                    <input
                                                        value={newTask[key]}
                                                        onChange={(e) =>
                                                            setNewTask({
                                                                ...newTask,
                                                                [key]: e.target
                                                                    .value,
                                                            })
                                                        }
                                                        placeholder="Add a card..."
                                                        className="border-gray-300 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 rounded-md shadow-sm w-full text-sm"
                                                    />
                                                    <button
                                                        onClick={() =>
                                                            addTask(key)
                                                        }
                                                        className="mt-2 w-full text-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-800 hover:bg-gray-700"
                                                    >
                                                        Add Card
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </Droppable>
                                ))}
                            </div>
                        </DragDropContext>
                    </div>

                    <Modal
                        show={selectedTask !== null}
                        onClose={() => setSelectedTask(null)}
                        maxWidth="2xl"
                    >
                        {selectedTask && (
                            <div className="p-6">
                                <div className="flex justify-between items-start">
                                    <h2 className="text-xl font-bold text-gray-900 mb-4">
                                        {selectedTask.title}
                                    </h2>
                                    <button
                                        onClick={() => setSelectedTask(null)}
                                        className="text-gray-400 hover:text-gray-600"
                                    >
                                        <X size={24} />
                                    </button>
                                </div>
                                <div className="grid grid-cols-2 gap-6 mb-4">
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500 mb-2">
                                            Assignee
                                        </h3>
                                        <div className="flex items-center gap-2">
                                            <select
                                                value={
                                                    selectedTask.assignee_id ||
                                                    selectedUser
                                                }
                                                onChange={(e) =>
                                                    setSelectedUser(
                                                        e.target.value
                                                    )
                                                }
                                                className="border-gray-300 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 rounded-md shadow-sm w-full text-sm"
                                            >
                                                <option value="">
                                                    Unassigned
                                                </option>
                                                {users.map((u) => (
                                                    <option
                                                        key={u.id}
                                                        value={u.id}
                                                    >
                                                        {u.name}
                                                    </option>
                                                ))}
                                            </select>
                                            <button
                                                onClick={assignUser}
                                                className="px-3 py-1.5 border rounded-md text-sm font-medium text-white bg-gray-800 hover:bg-gray-700"
                                            >
                                                Assign
                                            </button>
                                            {selectedTask.assignee_id && (
                                                <button
                                                    onClick={unassignUser}
                                                    className="px-3 py-1.5 border rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                                                >
                                                    Clear
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500 mb-2">
                                            Due Date
                                        </h3>
                                        <input
                                            type="date"
                                            value={
                                                selectedTask.due_date
                                                    ? selectedTask.due_date.substring(
                                                          0,
                                                          10
                                                      )
                                                    : ""
                                            }
                                            onChange={(e) =>
                                                updateDueDate(e.target.value)
                                            }
                                            className="border-gray-300 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 rounded-md shadow-sm w-full text-sm"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500 mb-2">
                                        Description
                                    </h3>
                                    <textarea
                                        value={selectedTask.description || ""}
                                        onChange={(e) =>
                                            setSelectedTask({
                                                ...selectedTask,
                                                description: e.target.value,
                                            })
                                        }
                                        onBlur={updateDescription}
                                        className="border-gray-300 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 rounded-md shadow-sm w-full text-sm"
                                        rows="4"
                                        placeholder="Add a more detailed description..."
                                    ></textarea>
                                </div>
                                <div className="mt-6">
                                    <h3 className="text-sm font-medium text-gray-500 mb-2 flex items-center">
                                        <Paperclip size={14} className="mr-2" />
                                        Attachments
                                    </h3>
                                    <div className="space-y-2">
                                        {attachments.map((a) => (
                                            <div
                                                key={a.id}
                                                className="flex justify-between items-center bg-gray-50 p-2 rounded-md"
                                            >
                                                <a
                                                    href={`/storage/${a.file_path}`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="text-sm text-indigo-600 hover:underline"
                                                >
                                                    {a.file_name}
                                                </a>
                                                <button
                                                    onClick={() =>
                                                        deleteAttachment(a.id)
                                                    }
                                                    className="text-gray-400 hover:text-red-500 text-xs font-bold"
                                                >
                                                    DELETE
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-2 flex gap-2">
                                        <input
                                            type="file"
                                            onChange={(e) =>
                                                setSelectedFile(
                                                    e.target.files[0]
                                                )
                                            }
                                            className="text-sm"
                                        />
                                        <button
                                            onClick={uploadAttachment}
                                            disabled={!selectedFile}
                                            className="px-3 py-1.5 border rounded-md text-sm font-medium text-white bg-gray-800 hover:bg-gray-700 disabled:bg-gray-400"
                                        >
                                            Upload
                                        </button>
                                    </div>
                                </div>
                                <div className="mt-6">
                                    <h3 className="text-sm font-medium text-gray-500 mb-2 flex items-center">
                                        <MessageSquare
                                            size={14}
                                            className="mr-2"
                                        />
                                        Activity
                                    </h3>
                                    <div className="space-y-3">
                                        {comments.map((c) => (
                                            <div
                                                key={c.id}
                                                className="flex items-start gap-3"
                                            >
                                                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-500 text-sm">
                                                    {c.user?.name.charAt(0)}
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-sm">
                                                        <span className="font-bold">
                                                            {c.user?.name}
                                                        </span>
                                                        <span className="text-gray-500 text-xs ml-2">
                                                            {new Date(
                                                                c.created_at
                                                            ).toLocaleString()}
                                                        </span>
                                                    </p>
                                                    <div className="bg-gray-100 p-2 rounded-md text-sm">
                                                        {c.content}
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() =>
                                                        deleteComment(c.id)
                                                    }
                                                    className="text-gray-400 hover:text-red-500 text-xs font-bold mt-1"
                                                >
                                                    DELETE
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-4 flex gap-2">
                                        <input
                                            value={newComment}
                                            onChange={(e) =>
                                                setNewComment(e.target.value)
                                            }
                                            placeholder="Write a comment..."
                                            className="border-gray-300 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 rounded-md shadow-sm w-full text-sm"
                                        />
                                        <button
                                            onClick={addComment}
                                            className="px-4 py-2 border rounded-md text-sm font-medium text-white bg-gray-800 hover:bg-gray-700"
                                        >
                                            Send
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </Modal>
                </main>
            </div>
        </AuthenticatedLayout>
    );
}
