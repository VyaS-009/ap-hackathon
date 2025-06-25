import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import {
  Calendar,
  CheckCircle2,
  Clock,
  RefreshCw,
  AlertCircle,
  Filter,
  Plus,
  Users,
} from "lucide-react";

// Task interface (copied from Dashboard.tsx for consistency)
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

interface TasksPanelProps {
  type: "my-tasks" | "assigned-tasks";
  tasks: Task[];
  selectedGroup: string;
  groups: { id: string; name: string }[];
  activeFilter: "today" | "week" | "all";
  sortBy: "deadline" | "priority";
}

export default function TasksPanel({
  type,
  tasks,
  selectedGroup,
  groups,
  activeFilter,
  sortBy,
}: TasksPanelProps) {
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

  const filteredTasks = tasks.filter((task) => {
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
    <Card className={type === "my-tasks" ? "lg:col-span-2" : ""}>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>
              {type === "my-tasks" ? "My Tasks" : "Tasks I Assigned"}
            </CardTitle>
            <CardDescription>
              {type === "my-tasks"
                ? "Tasks assigned to you"
                : "Monitor progress of assigned tasks"}
            </CardDescription>
          </div>
          {type === "my-tasks" && (
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
          )}
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[500px]">
          <div className="space-y-4">
            {filteredTasks.length === 0 && (
              <p className="text-center text-gray-500">
                {type === "my-tasks" ? "No tasks found" : "No tasks assigned"}
              </p>
            )}
            {filteredTasks.map((task) => (
              <div
                key={task.id}
                className={`p-4 ${
                  type === "my-tasks"
                    ? `rounded-lg border-l-4 ${getTaskStatusColor(
                        task.status
                      )} hover:shadow-md transition-shadow cursor-pointer`
                    : "bg-gray-50 rounded-lg"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className={type === "my-tasks" ? "flex-1" : ""}>
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
                  {type === "my-tasks" ? (
                    <Badge
                      variant="outline"
                      className={getTaskStatusColor(task.status)}
                    >
                      {task.status}
                    </Badge>
                  ) : (
                    <div>
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
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
