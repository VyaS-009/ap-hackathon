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
import {
  Bell,
  Calendar,
  CheckCircle2,
  RefreshCw,
  AlertCircle,
  Download,
  ChevronRight,
  Settings,
} from "lucide-react";
import {
  fetchTasksByUser,
  fetchGroups,
  BackendTask,
  BackendGroup,
} from "../api/api";
import TasksPanel from "../components/dashboard/tasks-panel";

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
  );
  const [selectedGroup, setSelectedGroup] = useState<string>("all");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [sortBy, setSortBy] = useState<"deadline" | "priority">("deadline");
  const [myTasks, setMyTasks] = useState<Task[]>([]);
  const [assignedTasks, setAssignedTasks] = useState<Task[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Use Sita Rao's userId
  const userId = "685bd1df6009a0c59842e19e"; // Changed to Sita Rao's ID

  // Map backend task to frontend Task interface
  const mapBackendTaskToFrontend = (task: BackendTask): Task => {
    const isOverdue =
      new Date(task.deadline) < new Date() && task.status !== "completed";
    return {
      id: task._id,
      title: task.taskText,
      description: `Task for ${task.groupId.name}`,
      priority: "medium",
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
          : 0,
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
      color: colors[Math.floor(Math.random() * colors.length)],
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
              <TasksPanel
                type="my-tasks"
                tasks={myTasks}
                selectedGroup={selectedGroup}
                groups={groups}
                activeFilter={activeFilter}
                sortBy={sortBy}
              />
              <TasksPanel
                type="assigned-tasks"
                tasks={assignedTasks}
                selectedGroup={selectedGroup}
                groups={groups}
                activeFilter={activeFilter}
                sortBy={sortBy}
              />
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
