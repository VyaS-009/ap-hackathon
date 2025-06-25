import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api"; // Adjust port if your backend runs on a different port

export interface BackendTask {
  _id: string;
  taskText: string;
  status: "open" | "in progress" | "completed";
  deadline: string;
  assignedBy: { _id: string; name: string };
  assignedTo: { _id: string; name: string };
  groupId: { _id: string; name: string };
  messageId: string;
  completionSignal: string;
}

export interface BackendGroup {
  _id: string;
  name: string;
  description: string;
  members: { _id: string; name: string }[];
  context: string;
}

// Fetch tasks for a user
export const fetchTasksByUser = async (
  userId: string
): Promise<BackendTask[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/tasks/user/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch tasks:", error);
    throw error;
  }
};

// Fetch all groups
export const fetchGroups = async (): Promise<BackendGroup[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/groups`);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch groups:", error);
    throw error;
  }
};
