import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import {
  Bell,
  Calendar,
  CheckCircle2,
  Clock,
  Filter,
  Plus,
  RefreshCw,
  Settings,
  Users,
  AlertCircle,
  Download,
  ChevronRight,
} from "lucide-react";
import {
  fetchTasksByUser,
  fetchGroups,
  BackendTask,
  BackendGroup,
} from "../api/api";

// Task interface for frontend, mapped from backend data
interface Task {
  id: string;
  title: string;
  description: string;
  priority: "low" | "medium" | "high";
  status: "pending" | "in-progress" | "completed" | "overdue";
  dueDate: string;
  assignedBy?: string;
  group: string;
  progress?: number;
}

// Group interface for frontend, mapped from backend data
interface Group {
  id: string;
  name: string;
  color: string;
  taskCount: number;
  activeMembers: number;
}

export default function Dashboard() {
  const [activeFilter, setActiveFilter] = useState<"today" | "week" | "all">(
    "all"
  ); // Changed default to "all"
  const [selectedGroup, setSelectedGroup] = useState<string>("all");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [sortBy, setSortBy] = useState<"deadline" | "priority">("deadline");
  const [myTasks, setMyTasks] = useState<Task[]>([]);
  const [assignedTasks, setAssignedTasks] = useState<Task[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Use the confirmed userId
  const userId = "685bd1df6009a0c59842e19f"; // Valid userId with 2 tasks

  // Map backend task to frontend Task interface
  const mapBackendTaskToFrontend = (task: BackendTask): Task => {
    const isOverdue =
      new Date(task.deadline) < new Date() && task.status !== "completed";
    return {
      id: task._id,
      title: task.taskText,
      description: `Task for ${task.groupId.name}`, // Derive description from group
      priority: "medium", // Default, as priority not in backend
      status: isOverdue
        ? "overdue"
        : task.status === "open"
        ? "pending"
        : task.status,
      dueDate: new Date(task.deadline).toISOString().split("T")[0],
      assignedBy: task.assignedBy?.name,
      group: task.groupId.name,
      progress:
        task.status === "completed"
          ? 100
          : task.status === "in progress"
          ? 50
          : 0, // Derive progress
    };
  };

  // Map backend group to frontend Group interface
  const mapBackendGroupToFrontend = (
    group: BackendGroup,
    tasks: BackendTask[]
  ): Group => {
    const colors = [
      "bg-blue-500",
      "bg-green-500",
      "bg-purple-500",
      "bg-orange-500",
    ];
    return {
      id: group._id,
      name: group.name,
      color: colors[Math.floor(Math.random() * colors.length)], // Random color for UI
      taskCount: tasks.filter((task) => task.groupId._id === group._id).length,
      activeMembers: group.members.length,
    };
  };

  // Fetch data from backend
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch tasks
        const tasks = await fetchTasksByUser(userId);
        const myTasks = tasks
          .filter((task) => task.assignedTo._id === userId)
          .map(mapBackendTaskToFrontend);
        const assignedTasks = tasks
          .filter((task) => task.assignedBy._id === userId)
          .map(mapBackendTaskToFrontend);
        setMyTasks(myTasks);
        setAssignedTasks(assignedTasks);

        // Fetch groups
        const backendGroups = await fetchGroups();
        const frontendGroups = backendGroups.map((group) =>
          mapBackendGroupToFrontend(group, tasks)
        );
        setGroups(frontendGroups);
      } catch (err) {
        setError("Failed to load data from server");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [userId]);

  // Handle refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const tasks = await fetchTasksByUser(userId);
      const myTasks = tasks
        .filter((task) => task.assignedTo._id === userId)
        .map(mapBackendTaskToFrontend);
      const assignedTasks = tasks
        .filter((task) => task.assignedBy._id === userId)
        .map(mapBackendTaskToFrontend);
      setMyTasks(myTasks);
      setAssignedTasks(assignedTasks);

      const backendGroups = await fetchGroups();
      const frontendGroups = backendGroups.map((group) =>
        mapBackendGroupToFrontend(group, tasks)
      );
      setGroups(frontendGroups);
    } catch (err) {
      setError("Failed to refresh data");
    } finally {
      setIsRefreshing(false);
    }
  };

  const getTaskStatusColor = (status: Task["status"]) => {
    switch (status) {
      case "overdue":
        return "bg-red-100 text-red-800 border-red-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "in-progress":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getPriorityColor = (priority: Task["priority"]) => {
    switch (priority) {
      case "high":
        return "bg-red-500";
      case "medium":
        return "bg-yellow-500";
      case "low":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusIcon = (status: Task["status"]) => {
    switch (status) {
      case "overdue":
        return <AlertCircle className="w-4 h-4" />;
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "in-progress":
        return <RefreshCw className="w-4 h-4" />;
      case "completed":
        return <CheckCircle2 className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const filteredTasks = myTasks.filter((task) => {
    const today = new Date().toISOString().split("T")[0];
    const taskDate = task.dueDate;

    if (
      selectedGroup !== "all" &&
      task.group !== groups.find((g) => g.id === selectedGroup)?.name
    ) {
      return false;
    }

    switch (activeFilter) {
      case "today":
        return taskDate === today;
      case "week":
        const weekFromNow = new Date();
        weekFromNow.setDate(weekFromNow.getDate() + 7);
        return new Date(taskDate) <= weekFromNow;
      case "all":
      default:
        return true;
    }
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">
              Welcome back! Here's your task overview
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm">
              <Bell className="w-4 h-4 mr-2" />
              Notifications
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing || loading}
            >
              <RefreshCw
                className={`w-4 h-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <Card className="bg-red-50 border-red-200">
            <CardContent className="pt-6 text-red-800">{error}</CardContent>
          </Card>
        )}

        {/* Loading State */}
        {loading && (
          <Card>
            <CardContent className="pt-6 text-center">
              Loading data...
            </CardContent>
          </Card>
        )}

        {!loading && (
          <>
            {/* Summary Panel */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Summary</CardTitle>
                    <CardDescription>
                      Your task overview across all groups
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Tabs
                      value={activeFilter}
                      onValueChange={(value: any) => setActiveFilter(value)}
                    >
                      <TabsList>
                        <TabsTrigger value="today">Today</TabsTrigger>
                        <TabsTrigger value="week">This Week</TabsTrigger>
                        <TabsTrigger value="all">All</TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Group Tabs */}
                <ScrollArea className="w-full whitespace-nowrap rounded-md border mb-4">
                  <div className="flex w-max space-x-4 p-4">
                    <Button
                      variant={selectedGroup === "all" ? "default" : "outline"}
                      onClick={() => setSelectedGroup("all")}
                      className="flex-shrink-0"
                    >
                      All Groups
                    </Button>
                    {groups.map((group) => (
                      <Button
                        key={group.id}
                        variant={
                          selectedGroup === group.id ? "default" : "outline"
                        }
                        onClick={() => setSelectedGroup(group.id)}
                        className="flex-shrink-0"
                      >
                        <div
                          className={`w-3 h-3 rounded-full ${group.color} mr-2`}
                        />
                        {group.name}
                        <Badge variant="secondary" className="ml-2">
                          {group.taskCount}
                        </Badge>
                      </Button>
                    ))}
                  </div>
                </ScrollArea>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-white p-4 rounded-lg border">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">
                          Total Tasks
                        </p>
                        <p className="text-2xl font-bold text-gray-900">
                          {myTasks.length + assignedTasks.length}
                        </p>
                      </div>
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Calendar className="w-5 h-5 text-blue-600" />
                      </div>
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-lg border">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">
                          Completed
                        </p>
                        <p className="text-2xl font-bold text-green-600">
                          {myTasks.filter((t) => t.status === "completed")
                            .length +
                            assignedTasks.filter(
                              (t) => t.status === "completed"
                            ).length}
                        </p>
                      </div>
                      <div className="p-2 bg-green-100 rounded-lg">
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                      </div>
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-lg border">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">
                          Overdue
                        </p>
                        <p className="text-2xl font-bold text-red-600">
                          {myTasks.filter((t) => t.status === "overdue")
                            .length +
                            assignedTasks.filter((t) => t.status === "overdue")
                              .length}
                        </p>
                      </div>
                      <div className="p-2 bg-red-100 rounded-lg">
                        <AlertCircle className="w-5 h-5 text-red-600" />
                      </div>
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-lg border">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">
                          In Progress
                        </p>
                        <p className="text-2xl font-bold text-blue-600">
                          {myTasks.filter((t) => t.status === "in-progress")
                            .length +
                            assignedTasks.filter(
                              (t) => t.status === "in-progress"
                            ).length}
                        </p>
                      </div>
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <RefreshCw className="w-5 h-5 text-blue-600" />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* My Tasks Panel */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle>My Tasks</CardTitle>
                        <CardDescription>Tasks assigned to you</CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <Filter className="w-4 h-4 mr-2" />
                          Sort by {sortBy}
                        </Button>
                        <Button size="sm">
                          <Plus className="w-4 h-4 mr-2" />
                          New Task
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[500px]">
                      <div className="space-y-4">
                        {filteredTasks.length === 0 && (
                          <p className="text-center text-gray-500">
                            No tasks found
                          </p>
                        )}
                        {filteredTasks.map((task) => (
                          <div
                            key={task.id}
                            className={`p-4 rounded-lg border-l-4 ${getTaskStatusColor(
                              task.status
                            )} hover:shadow-md transition-shadow cursor-pointer`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  {getStatusIcon(task.status)}
                                  <h3 className="font-medium text-gray-900">
                                    {task.title}
                                  </h3>
                                  <div
                                    className={`w-2 h-2 rounded-full ${getPriorityColor(
                                      task.priority
                                    )}`}
                                  />
                                </div>
                                <p className="text-sm text-gray-600 mb-2">
                                  {task.description}
                                </p>
                                <div className="flex items-center gap-4 text-xs text-gray-500">
                                  <span className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    {task.dueDate}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Users className="w-3 h-3" />
                                    {task.group}
                                  </span>
                                </div>
                              </div>
                              <Badge
                                variant="outline"
                                className={getTaskStatusColor(task.status)}
                              >
                                {task.status}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>

              {/* Tasks I Assigned Panel */}
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle>Tasks I Assigned</CardTitle>
                    <CardDescription>
                      Monitor progress of assigned tasks
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[500px]">
                      <div className="space-y-4">
                        {assignedTasks.length === 0 && (
                          <p className="text-center text-gray-500">
                            No tasks assigned
                          </p>
                        )}
                        {assignedTasks.map((task) => (
                          <div
                            key={task.id}
                            className="p-4 bg-gray-50 rounded-lg"
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <h3 className="font-medium text-gray-900 text-sm">
                                  {task.title}
                                </h3>
                                <p className="text-xs text-gray-600">
                                  {task.group}
                                </p>
                              </div>
                              <div
                                className={`w-2 h-2 rounded-full ${getPriorityColor(
                                  task.priority
                                )}`}
                              />
                            </div>
                            <div className="space-y-2">
                              <div className="flex justify-between text-xs text-gray-500">
                                <span>Progress</span>
                                <span>{task.progress}%</span>
                              </div>
                              <Progress value={task.progress} className="h-2" />
                            </div>
                            <div className="flex items-center justify-between mt-3">
                              <span className="text-xs text-gray-500">
                                Due: {task.dueDate}
                              </span>
                              <Button variant="outline" size="sm">
                                Follow up
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Bottom Actions */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-wrap gap-4 justify-center">
                  <Button variant="outline" className="flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    Edit My Rules
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    Export Summary
                  </Button>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Bell className="w-4 h-4" />
                    Notification Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
