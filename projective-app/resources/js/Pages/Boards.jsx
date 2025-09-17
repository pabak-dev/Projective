import React, { useEffect, useState } from "react";
import axios from "axios";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, usePage } from "@inertiajs/react";
import {
    Plus,
    List,
    Clock,
    CheckCircle,
    AlertTriangle,
    MessageSquare,
    Paperclip,
    X,
    Info,
    GitBranch,
    UserPlus,
    Edit,
    Trash2,
    User,
} from "lucide-react";
import Sidebar from "@/Components/Sidebar";
import Modal from "@/Components/Modal";
import PrimaryButton from "@/Components/PrimaryButton";
import SecondaryButton from "@/Components/SecondaryButton";
import DangerButton from "@/Components/DangerButton";
import TextInput from "@/Components/TextInput";
import InputLabel from "@/Components/InputLabel";
import ChatAssistant from "@/Components/ChatAssistant";

export default function Boards() {
    // Page State
    const [projects, setProjects] = useState([]);
    const [selectedProject, setSelectedProject] = useState(null);
    const [tasks, setTasks] = useState({
        todo: [],
        in_progress: [],
        review: [],
        done: [],
    });
    const [users, setUsers] = useState([]); // For assignee dropdown
    const [allUsers, setAllUsers] = useState([]); // For member management

    // Modal State
    const [selectedTask, setSelectedTask] = useState(null);
    const [isTaskModalOpen, setTaskModalOpen] = useState(false);
    const [isNewProjectModalOpen, setNewProjectModalOpen] = useState(false);
    const [isProjectDetailsModalOpen, setProjectDetailsModalOpen] =
        useState(false);
    const [isManageMembersModalOpen, setManageMembersModalOpen] =
        useState(false);
    const [isEditProjectModalOpen, setEditProjectModalOpen] = useState(false);
    const [isConfirmDeleteModalOpen, setConfirmDeleteModalOpen] =
        useState(false);
    const [comments, setComments] = useState([]);
    const [attachments, setAttachments] = useState([]);
    const [newComment, setNewComment] = useState("");
    const [selectedFile, setSelectedFile] = useState(null);
    const [selectedUser, setSelectedUser] = useState(""); // For assigning user to task
    const [userToAdd, setUserToAdd] = useState(""); // For adding member to project

    // Form & Input State
    const [newTask, setNewTask] = useState({
        todo: "",
        in_progress: "",
        review: "",
        done: "",
    });

    const [newProjectData, setNewProjectData] = useState({
        name: "",
        description: "",
        version_control_link: "",
    });

    const { auth } = usePage().props;
    const isOwner = selectedProject && auth.user.id === selectedProject.user_id;
    const isAssignee = selectedTask && auth.user.id === selectedTask.assignee_id;

    // --- DATA FETCHING ---
    useEffect(() => {
        fetchProjects();
        fetchUsers(); // Fetches all users for both assignees and member management
    }, []);

    useEffect(() => {
        if (selectedProject) {
            fetchTasks(selectedProject.id);
        } else {
            setTasks({ todo: [], in_progress: [], review: [], done: [] });
        }
    }, [selectedProject]);

    const fetchProjects = async () => {
        try {
            const res = await axios.get("/api/projects");
            setProjects(res.data);
            if (
                res.data.length > 0 &&
                !projects.some((p) => p.id === selectedProject?.id)
            ) {
                setSelectedProject(res.data[0]);
            } else if (res.data.length === 0) {
                setSelectedProject(null);
            }
        } catch (error) {
            console.error("Failed to fetch projects:", error);
        }
    };

    const fetchTasks = async (projectId) => {
        if (!projectId) return;
        try {
            const res = await axios.get(`/api/projects/${projectId}/tasks?with=assignedUser`);
            const grouped = { todo: [], in_progress: [], review: [], done: [] };
            if (res.data) {
                res.data.forEach((t) => {
                    if (grouped[t.status]) grouped[t.status].push(t);
                });
            }
            setTasks(grouped);
        } catch (error) {
            console.error(
                `Failed to fetch tasks for project ${projectId}:`,
                error
            );
        }
    };

    const fetchUsers = async () => {
        try {
            const res = await axios.get("/api/users");
            setUsers(res.data);
            setAllUsers(res.data);
        } catch (error) {
            console.error("Failed to fetch users:", error);
        }
    };

    // --- CORE KANBAN LOGIC ---
    const addTask = async (status) => {
        if (!newTask[status].trim() || !selectedProject) return;
        const res = await axios.post(
            `/api/projects/${selectedProject.id}/tasks`,
            {
                title: newTask[status],
                status,
            }
        );
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

    // --- PROJECT MANAGEMENT ---
    const handleCreateProject = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post("/api/projects", newProjectData);
            const newProjects = [...projects, res.data];
            setProjects(newProjects);
            setSelectedProject(res.data);
            setNewProjectModalOpen(false);
            setNewProjectData({
                name: "",
                description: "",
                version_control_link: "",
            });
        } catch (error) {
            console.error("Failed to create project:", error);
        }
    };

    const handleUpdateProject = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.put(
                `/api/projects/${selectedProject.id}`,
                newProjectData
            );
            const updatedProjects = projects.map((p) =>
                p.id === res.data.id ? res.data : p
            );
            setProjects(updatedProjects);
            setSelectedProject(res.data);
            setEditProjectModalOpen(false);
        } catch (error) {
            console.error("Failed to update project:", error);
        }
    };

    const handleDeleteProject = async () => {
        try {
            await axios.delete(`/api/projects/${selectedProject.id}`);
            const updatedProjects = projects.filter(
                (p) => p.id !== selectedProject.id
            );
            setProjects(updatedProjects);
            setSelectedProject(
                updatedProjects.length > 0 ? updatedProjects[0] : null
            );
            setConfirmDeleteModalOpen(false);
        } catch (error) {
            console.error("Failed to delete project:", error);
        }
    };

    const handleAddMember = async (e) => {
        e.preventDefault();
        if (!userToAdd) return;
        try {
            const res = await axios.post(
                `/api/projects/${selectedProject.id}/members`,
                { user_id: userToAdd }
            );
            const updatedProject = { ...selectedProject, members: res.data };
            const updatedProjects = projects.map((p) =>
                p.id === updatedProject.id ? updatedProject : p
            );
            setProjects(updatedProjects);
            setSelectedProject(updatedProject);
            setUserToAdd("");
        } catch (error) {
            console.error("Failed to add member:", error);
        }
    };

    const handleRemoveMember = async (userId) => {
        try {
            const res = await axios.delete(
                `/api/projects/${selectedProject.id}/members/${userId}`
            );
            const updatedProject = { ...selectedProject, members: res.data };
            const updatedProjects = projects.map((p) =>
                p.id === updatedProject.id ? updatedProject : p
            );
            setProjects(updatedProjects);
            setSelectedProject(updatedProject);
        } catch (error) {
            console.error("Failed to remove member:", error);
        }
    };

    // --- TASK MANAGEMENT (MODAL) ---
    const openTaskModal = async (task) => {
        const res = await axios.get(`/api/tasks/${task.id}`);
        setSelectedTask(res.data);
        setComments(res.data.comments || []);
        setAttachments(res.data.attachments || []);
        setTaskModalOpen(true);
    };

    const handleTaskDelete = async (taskId) => {
        try {
            await axios.delete(`/api/tasks/${taskId}`);
            setTaskModalOpen(false);
            fetchTasks(selectedProject.id); // Re-fetch all tasks to update the board
        } catch (error) {
            console.error("Failed to delete task:", error);
        }
    };
    
    const updateTaskInState = (updatedTask) => {
        const newTasks = { ...tasks };
        Object.keys(newTasks).forEach((status) => {
            newTasks[status] = newTasks[status].map((task) =>
                task.id === updatedTask.id ? updatedTask : task
            );
        });
        setTasks(newTasks);
        // Re-fetch all tasks to ensure counts are updated correctly
        fetchTasks(selectedProject.id);
    };

    const addComment = async () => {
        if (!newComment.trim()) return;
        const res = await axios.post(`/api/tasks/${selectedTask.id}/comments`, {
            user_id: auth.user.id,
            content: newComment,
        });
        setComments([...comments, res.data]);
        setNewComment("");
        updateTaskInState({
            ...selectedTask,
            comments_count: (selectedTask.comments_count || 0) + 1,
        });
    };

    const deleteComment = async (id) => {
        await axios.delete(`/api/comments/${id}`);
        setComments(comments.filter((c) => c.id !== id));
        updateTaskInState({
            ...selectedTask,
            comments_count: selectedTask.comments_count - 1,
        });
    };

    const uploadAttachment = async (e) => {
        e.preventDefault();
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

    const deleteAttachment = async (id) => {
        await axios.delete(`/api/attachments/${id}`);
        setAttachments(attachments.filter((a) => a.id !== id));
        updateTaskInState({
            ...selectedTask,
            attachments_count: selectedTask.attachments_count - 1,
        });
    };

    const updateDueDate = async (date) => {
        const res = await axios.put(`/api/tasks/${selectedTask.id}`, {
            due_date: date,
        });
        setSelectedTask(res.data);
        updateTaskInState(res.data);
    };

    const updateDescription = async (e) => {
        const res = await axios.put(`/api/tasks/${selectedTask.id}`, {
            description: e.target.value,
        });
        setSelectedTask(res.data);
        updateTaskInState(res.data);
    };

    const assignTask = async (userId) => {
        try {
            let response;
            if (userId) {
                response = await axios.post(`/api/tasks/${selectedTask.id}/assign`, {
                    user_id: userId
                });
            } else {
                response = await axios.post(`/api/tasks/${selectedTask.id}/unassign`);
            }

            const updatedTask = response.data.task || response.data;
            setSelectedTask(updatedTask);
            updateTaskInState(updatedTask);
        } catch (error) {
            console.error("Failed to assign user:", error);
        }
    };

    // Check if current user can manage comments and attachments
    const canManageCommentsAndAttachments = () => {
        if (!selectedTask) return false;
        return isOwner || isAssignee;
    };

    const stats = {
        total: Object.values(tasks).flat().length,
        inProgress: tasks.in_progress.length,
        completed: tasks.done.length,
        overdue: Object.values(tasks)
            .flat()
            .filter(
                (t) =>
                    t.due_date &&
                    new Date(t.due_date) < new Date() &&
                    t.status !== "done"
            ).length,
    };

    const columns = {
        todo: "To Do",
        in_progress: "In Progress",
        review: "Review",
        done: "Done",
    };

    const renderTaskCard = (task) => (
        <div
            className="bg-white p-3 rounded-md shadow-sm mb-3 border border-gray-200 cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => openTaskModal(task)}
        >
            <p className="font-semibold text-gray-800 text-sm mb-2">
                {task.title}
            </p>
            {task.assignedUser && (
                <div className="flex items-center text-xs text-gray-500 mb-2">
                    <User size={12} className="mr-1" />
                    {task.assignedUser.name}
                </div>
            )}
            <div className="flex justify-between items-center text-xs text-gray-500">
                <div className="flex items-center space-x-2">
                    <span>💬 {task.comments_count || 0}</span>
                    <span>📎 {task.attachments_count || 0}</span>
                </div>
                <span
                    className={`font-medium ${
                        task.due_date &&
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
                <Sidebar
                    projects={projects}
                    selectedProject={selectedProject}
                    setSelectedProject={setSelectedProject}
                    openNewProjectModal={() => setNewProjectModalOpen(true)}
                />
                <main className="flex-1 overflow-y-auto bg-gray-50">
                    {selectedProject ? (
                        <div className="container mx-auto p-4 sm:p-6 lg:p-8">
                            {/* Header */}
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-800">
                                        {selectedProject.name}
                                    </h1>
                                    <p className="text-gray-500">
                                        Manage tasks and track progress
                                    </p>
                                </div>
                                <div className="flex items-center space-x-2 mt-4 sm:mt-0">
                                    <button
                                        onClick={() =>
                                            setProjectDetailsModalOpen(true)
                                        }
                                        className="p-2 border rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-100"
                                        title="Project details"
                                    >
                                        <Info size={16} />
                                    </button>
                                    {isOwner && (
                                        <>
                                            <button
                                                onClick={() =>
                                                    setManageMembersModalOpen(
                                                        true
                                                    )
                                                }
                                                className="p-2 border rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-100"
                                                title="Manage Members"
                                            >
                                                <UserPlus size={16} />
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setNewProjectData(
                                                        selectedProject
                                                    );
                                                    setEditProjectModalOpen(
                                                        true
                                                    );
                                                }}
                                                className="p-2 border rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-100"
                                                title="Edit Project"
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button
                                                onClick={() =>
                                                    setConfirmDeleteModalOpen(
                                                        true
                                                    )
                                                }
                                                className="p-2 border rounded-md text-sm font-medium text-white bg-gray-800 hover:bg-gray-700"
                                                title="Delete Project"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Stats */}
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

                            {/* Kanban Board */}
                            <DragDropContext onDragEnd={handleDragEnd}>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    {Object.entries(columns).map(
                                        ([key, title]) => (
                                            <Droppable
                                                droppableId={key}
                                                key={key}
                                            >
                                                {(provided) => (
                                                    <div
                                                        ref={provided.innerRef}
                                                        {...provided.droppableProps}
                                                        className="bg-gray-100 p-4 rounded-lg border border-gray-200 flex flex-col"
                                                    >
                                                        <div className="flex justify-between items-center mb-4">
                                                            <h2 className="font-bold text-gray-700">
                                                                {title}
                                                            </h2>
                                                            <span className="text-sm text-gray-500 bg-gray-200 rounded-full px-2 py-1">
                                                                {
                                                                    tasks[key]
                                                                        .length
                                                                }
                                                            </span>
                                                        </div>
                                                        <div className="min-h-[200px] flex-grow">
                                                            {tasks[key].map(
                                                                (
                                                                    task,
                                                                    index
                                                                ) => (
                                                                    <Draggable
                                                                        key={task.id.toString()}
                                                                        draggableId={task.id.toString()}
                                                                        index={
                                                                            index
                                                                        }
                                                                    >
                                                                        {(
                                                                            provided
                                                                        ) => (
                                                                            <div
                                                                                ref={
                                                                                    provided.innerRef
                                                                                }
                                                                                {...provided.draggableProps}
                                                                                {...provided.dragHandleProps}
                                                                            >
                                                                                {renderTaskCard(
                                                                                    task
                                                                                )}
                                                                            </div>
                                                                        )}
                                                                    </Draggable>
                                                                )
                                                            )}
                                                            {
                                                                provided.placeholder
                                                            }
                                                        </div>
                                                        <div className="mt-3">
                                                            <input
                                                                value={
                                                                    newTask[key]
                                                                }
                                                                onChange={(e) =>
                                                                    setNewTask({
                                                                        ...newTask,
                                                                        [key]: e
                                                                            .target
                                                                            .value,
                                                                    })
                                                                }
                                                                onKeyDown={(
                                                                    e
                                                                ) =>
                                                                    e.key ===
                                                                        "Enter" &&
                                                                    addTask(key)
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
                                        )
                                    )}
                                    {selectedProject && <ChatAssistant projectId={selectedProject.id} />}
                                </div>
                            </DragDropContext>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-full">
                            <div className="text-center">
                                <p className="text-xl font-semibold text-gray-500">
                                    No projects found.
                                </p>
                                <p className="text-gray-400 mt-2">
                                    Create a new project to get started.
                                </p>
                            </div>
                        </div>
                    )}
                </main>
            </div>

            {/* --- ALL MODALS --- */}

            {/* Create New Project Modal */}
            <Modal
                show={isNewProjectModalOpen}
                onClose={() => setNewProjectModalOpen(false)}
            >
                <form onSubmit={handleCreateProject} className="p-6">
                    <h2 className="text-lg font-medium text-gray-900">
                        Create New Project
                    </h2>
                    <div className="mt-6 space-y-4">
                        <div>
                            <InputLabel
                                htmlFor="create-name"
                                value="Project Name"
                            />
                            <TextInput
                                id="create-name"
                                className="mt-1 block w-full"
                                value={newProjectData.name}
                                onChange={(e) =>
                                    setNewProjectData({
                                        ...newProjectData,
                                        name: e.target.value,
                                    })
                                }
                                required
                            />
                        </div>
                        <div>
                            <InputLabel
                                htmlFor="create-description"
                                value="Description"
                            />
                            <textarea
                                id="create-description"
                                rows="3"
                                className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                value={newProjectData.description}
                                onChange={(e) =>
                                    setNewProjectData({
                                        ...newProjectData,
                                        description: e.target.value,
                                    })
                                }
                            ></textarea>
                        </div>
                        <div>
                            <InputLabel
                                htmlFor="create-vcs_link"
                                value="Version Control Link (e.g., GitHub)"
                            />
                            <TextInput
                                id="create-vcs_link"
                                type="url"
                                className="mt-1 block w-full"
                                value={newProjectData.version_control_link}
                                onChange={(e) =>
                                    setNewProjectData({
                                        ...newProjectData,
                                        version_control_link: e.target.value,
                                    })
                                }
                            />
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end">
                        <PrimaryButton>Create Project</PrimaryButton>
                    </div>
                </form>
            </Modal>

            {/* Edit Project Modal */}
            <Modal
                show={isEditProjectModalOpen}
                onClose={() => setEditProjectModalOpen(false)}
            >
                <form onSubmit={handleUpdateProject} className="p-6">
                    <h2 className="text-lg font-medium text-gray-900">
                        Edit Project
                    </h2>
                    <div className="mt-6 space-y-4">
                        <div>
                            <InputLabel
                                htmlFor="edit-name"
                                value="Project Name"
                            />
                            <TextInput
                                id="edit-name"
                                className="mt-1 block w-full"
                                value={newProjectData.name}
                                onChange={(e) =>
                                    setNewProjectData({
                                        ...newProjectData,
                                        name: e.target.value,
                                    })
                                }
                                required
                            />
                        </div>
                        <div>
                            <InputLabel
                                htmlFor="edit-description"
                                value="Description"
                            />
                            <textarea
                                id="edit-description"
                                rows="3"
                                className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                value={newProjectData.description}
                                onChange={(e) =>
                                    setNewProjectData({
                                        ...newProjectData,
                                        description: e.target.value,
                                    })
                                }
                            ></textarea>
                        </div>
                        <div>
                            <InputLabel
                                htmlFor="edit-vcs_link"
                                value="Version Control Link (e.g., GitHub)"
                            />
                            <TextInput
                                id="edit-vcs_link"
                                type="url"
                                className="mt-1 block w-full"
                                value={newProjectData.version_control_link}
                                onChange={(e) =>
                                    setNewProjectData({
                                        ...newProjectData,
                                        version_control_link: e.target.value,
                                    })
                                }
                            />
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end">
                        <PrimaryButton>Save Changes</PrimaryButton>
                    </div>
                </form>
            </Modal>

            {/* Confirm Delete Modal */}
            <Modal
                show={isConfirmDeleteModalOpen}
                onClose={() => setConfirmDeleteModalOpen(false)}
                maxWidth="sm"
            >
                <div className="p-6">
                    <h2 className="text-lg font-medium text-gray-900">
                        Are you sure?
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        This action cannot be undone. This will permanently
                        delete the "{selectedProject?.name}" project and all of
                        its associated data.
                    </p>
                    <div className="mt-6 flex justify-end space-x-2">
                        <SecondaryButton
                            onClick={() => setConfirmDeleteModalOpen(false)}
                        >
                            Cancel
                        </SecondaryButton>
                        <DangerButton onClick={handleDeleteProject}>
                            Delete
                        </DangerButton>
                    </div>
                </div>
            </Modal>

            {/* Project Details Modal */}
            <Modal
                show={isProjectDetailsModalOpen}
                onClose={() => setProjectDetailsModalOpen(false)}
            >
                {selectedProject && (
                    <div className="p-6">
                        <h2 className="text-lg font-medium text-gray-900">
                            {selectedProject.name}
                        </h2>
                        <p className="mt-2 text-sm text-gray-600">
                            {selectedProject.description}
                        </p>
                        {selectedProject.version_control_link && (
                            <div className="mt-4">
                                <a
                                    href={selectedProject.version_control_link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center"
                                >
                                    <GitBranch size={16} className="mr-2" />{" "}
                                    Version Control
                                </a>
                            </div>
                        )}
                        <div className="mt-6 flex justify-end">
                            <SecondaryButton
                                onClick={() =>
                                    setProjectDetailsModalOpen(false)
                                }
                            >
                                Close
                            </SecondaryButton>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Manage Members Modal */}
            <Modal
                show={isManageMembersModalOpen}
                onClose={() => setManageMembersModalOpen(false)}
            >
                <div className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">
                        Manage Team Members
                    </h2>
                    <form
                        onSubmit={handleAddMember}
                        className="flex items-center gap-2 mb-6"
                    >
                        <select
                            value={userToAdd}
                            onChange={(e) => setUserToAdd(e.target.value)}
                            className="border-gray-300 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 rounded-md shadow-sm w-full text-sm"
                        >
                            <option value="">Select a user to add</option>
                            {allUsers
                                .filter(
                                    (user) =>
                                        !selectedProject?.members.some(
                                            (member) => member.id === user.id
                                        )
                                )
                                .map((user) => (
                                    <option key={user.id} value={user.id}>
                                        {user.name}
                                    </option>
                                ))}
                        </select>
                        <PrimaryButton type="submit" disabled={!userToAdd}>
                            Add
                        </PrimaryButton>
                    </form>
                    <div className="space-y-2">
                        {selectedProject?.members.map((member) => (
                            <div
                                key={member.id}
                                className="flex justify-between items-center bg-gray-50 p-2 rounded-md"
                            >
                                <span className="text-sm font-medium">
                                    {member.name}{" "}
                                    {member.id === selectedProject.user_id &&
                                        "(Owner)"}
                                </span>
                                {member.id !== selectedProject.user_id && (
                                    <button
                                        onClick={() =>
                                            handleRemoveMember(member.id)
                                        }
                                        className="text-red-500 hover:text-red-700 text-xs font-bold"
                                    >
                                        REMOVE
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </Modal>

            {/* Task Details Modal */}
            <Modal show={isTaskModalOpen} onClose={() => setTaskModalOpen(false)}>
                {selectedTask && (
                    <div className="p-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-800">
                                    {selectedTask.title}
                                </h2>
                                <p className="text-sm text-gray-600">
                                    Status: {selectedTask.status}
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                {/* Only allow project owner or admin to delete task */}
                                {isOwner && (
                                    <button
                                        onClick={() => handleTaskDelete(selectedTask.id)}
                                        className="p-2 text-red-500 hover:text-red-700 transition-colors"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                )}
                                <button
                                    onClick={() => setTaskModalOpen(false)}
                                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        <div className="mt-4 space-y-4">
                            {/* Assignee Section - Editable by project owner */}
                            <div className="flex items-center space-x-2">
                                <span className="font-semibold">Assignee:</span>
                                {isOwner ? (
                                    <select
                                        value={selectedTask.assignee_id || ""}
                                        onChange={(e) => assignTask(e.target.value)}
                                        className="border-gray-300 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 rounded-md shadow-sm text-sm"
                                    >
                                        <option value="">Unassigned</option>
                                        {users.map(user => (
                                            <option key={user.id} value={user.id}>{user.name}</option>
                                        ))}
                                    </select>
                                ) : (
                                    <span className="text-gray-600">
                                        {selectedTask.assignedUser ? selectedTask.assignedUser.name : "Unassigned"}
                                    </span>
                                )}
                            </div>

                            {/* Due Date Section - Only editable by project owner */}
                            <div className="flex items-center space-x-2">
                                <span className="font-semibold">Due Date:</span>
                                <input
                                    type="date"
                                    value={selectedTask.due_date || ""}
                                    onChange={(e) => {
                                        const newDate = e.target.value;
                                        setSelectedTask({ ...selectedTask, due_date: newDate });
                                    }}
                                    onBlur={() => updateDueDate(selectedTask.due_date)}
                                    readOnly={!isOwner}
                                    className={`block w-full text-sm rounded-md shadow-sm ${
                                        !isOwner
                                            ? "bg-gray-100 text-gray-500 border-gray-200 cursor-not-allowed"
                                            : "border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                                    }`}
                                />
                            </div>

                            {/* Description Section - Only editable by project owner */}
                            <div>
                                <span className="font-semibold">Description:</span>
                                <textarea
                                    value={selectedTask.description || ""}
                                    onChange={(e) => setSelectedTask({ ...selectedTask, description: e.target.value })}
                                    onBlur={updateDescription}
                                    readOnly={!isOwner}
                                    rows="3"
                                    className={`mt-1 block w-full text-sm rounded-md shadow-sm ${
                                        !isOwner
                                            ? "bg-gray-100 text-gray-500 border-gray-200 cursor-not-allowed"
                                            : "border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                                    }`}
                                />
                            </div>
                        </div>

                        {/* Attachments Section */}
                        <div className="mt-6 border-t pt-4">
                            <h3 className="text-lg font-bold flex items-center gap-2">
                                <Paperclip size={18} /> Attachments
                                {canManageCommentsAndAttachments() && (
                                    <span className="text-xs text-gray-500 ml-2">
                                        (Only you and the project owner can add/remove)
                                    </span>
                                )}
                            </h3>
                            <ul className="text-sm space-y-2 mt-2">
                                {attachments.map((attachment) => (
                                    <li
                                        key={attachment.id}
                                        className="flex justify-between items-center py-2 px-3 bg-gray-100 rounded-md"
                                    >
                                        <a
                                            href={attachment.file_path}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 hover:underline"
                                        >
                                            {attachment.file_name}
                                        </a>
                                        {canManageCommentsAndAttachments() && (
                                            <DangerButton
                                                onClick={() => deleteAttachment(attachment.id)}
                                                className="py-1 px-2 text-xs"
                                            >
                                                Remove
                                            </DangerButton>
                                        )}
                                    </li>
                                ))}
                            </ul>
                            {canManageCommentsAndAttachments() && (
                                <form onSubmit={uploadAttachment} className="mt-4 flex gap-2">
                                    <input
                                        type="file"
                                        onChange={(e) => setSelectedFile(e.target.files[0])}
                                        className="block w-full text-sm text-gray-500
                                file:mr-4 file:py-2 file:px-4
                                file:rounded-md file:border-0
                                file:text-sm file:font-semibold
                                file:bg-indigo-50 file:text-indigo-700
                                hover:file:bg-indigo-100"
                                    />
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700"
                                        disabled={!selectedFile}
                                    >
                                        Upload
                                    </button>
                                </form>
                            )}
                        </div>

                        {/* Comments Section */}
                        <div className="mt-6 border-t pt-4">
                            <h3 className="text-lg font-bold mb-2">Comments
                                {canManageCommentsAndAttachments() && (
                                    <span className="text-xs text-gray-500 ml-2">
                                        (Only you and the project owner can add/remove)
                                    </span>
                                )}
                            </h3>
                            <div className="bg-gray-100 p-3 rounded-md max-h-40 overflow-y-auto">
                                {comments.map((c) => (
                                    <div
                                        key={c.id}
                                        className="mb-3 p-2 bg-white rounded-md shadow-sm"
                                    >
                                        <p className="text-sm text-gray-700">
                                            {c.content}
                                        </p>
                                        <div className="flex justify-between items-center mt-1">
                                            <p className="text-xs text-gray-400">
                                                by {c.user?.name} at{" "}
                                                {new Date(c.created_at).toLocaleString()}
                                            </p>
                                            {(c.user_id === auth.user.id || isOwner) && (
                                                <button
                                                    onClick={() => deleteComment(c.id)}
                                                    className="text-gray-400 hover:text-red-500 text-xs font-bold"
                                                >
                                                    DELETE
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {canManageCommentsAndAttachments() && (
                                <div className="mt-4 flex gap-2">
                                    <input
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
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
                            )}
                        </div>
                    </div>
                )}
            </Modal>
        </AuthenticatedLayout>
    );
}