import React, { useEffect, useState } from "react";
import axios from "axios";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
import { Plus, List, Clock, CheckCircle, AlertTriangle } from "lucide-react";
import Sidebar from "@/Components/Sidebar";

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
            due_date: new Date().toISOString().slice(0, 10), // Example due date
        });
        setTasks({ ...tasks, [status]: [...tasks[status], res.data] });
        setNewTask({ ...newTask, [status]: "" });
    };

    const deleteTask = async (task, status) => {
        await axios.delete(`/api/tasks/${task.id}`);
        setTasks({
            ...tasks,
            [status]: tasks[status].filter((t) => t.id !== task.id),
        });
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
            onClick={() => setSelectedTask(task)}
        >
            <div className="flex justify-between items-start mb-2">
                <p className="font-semibold text-gray-800 text-sm">
                    {task.title}
                </p>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        deleteTask(task, status);
                    }}
                    className="text-gray-400 hover:text-red-500 text-xs"
                >
                    &#x2715;
                </button>
            </div>
            <div className="flex justify-between items-center text-xs text-gray-500 mt-3">
                <div className="flex items-center space-x-2">
                    <span>💬 {task.comments_count || 0}</span>
                    <span>📎 {task.attachments_count || 0}</span>
                </div>
                <span className="text-xs">
                    Due:{" "}
                    {task.due_date
                        ? new Date(task.due_date).toLocaleDateString()
                        : "N/A"}
                </span>
            </div>
        </div>
    );

    return (
        <AuthenticatedLayout>
            <Head title="Boards" />
            <div className="flex" style={{ height: "calc(100vh - 65px)" }}>
                {" "}
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
                </main>
            </div>
        </AuthenticatedLayout>
    );
}
