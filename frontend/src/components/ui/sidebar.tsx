import {
  Home,
  FileText,
  Users,
  Settings,
  Bell,
  Shield,
  UserCheck,
  CheckSquare,
  LogOut,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <div className={`bg-slate-900 flex flex-col items-center py-6 text-white transition-all duration-300 ${isExpanded ? 'w-64' : 'w-16'}`}>
      <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center mb-6">
        <FileText className="w-6 h-6 text-white" />
      </div>
      <div className="flex flex-col space-y-4 w-full">
        <div
          className={`w-10 h-10 ${
            currentPath === "/dashboard" ? "bg-blue-600" : "hover:bg-slate-800"
          } rounded-lg flex items-center justify-center cursor-pointer`}
          onClick={() => navigate("/dashboard")}
        >
          <Home className={`w-5 h-5 ${isExpanded ? 'text-white' : 'text-white'}`} />
          {isExpanded && <span className="ml-2 text-sm font-medium">Dashboard</span>}
        </div>
        <div
          className={`flex items-center cursor-pointer hover:bg-slate-800 transition-colors ${isExpanded ? 'justify-start pl-4 w-full h-10' : 'w-10 h-10 justify-center'}`}
          onClick={() => navigate('/my-task')}
        >
          <CheckSquare className={`w-5 h-5 ${isExpanded ? 'text-white' : 'text-slate-400'}`} />
          {isExpanded && <span className="ml-2 text-sm font-medium">My Task</span>}
        </div>
        <div
          className={`w-10 h-10 ${
            currentPath === "/summarizer" ? "bg-blue-600" : "hover:bg-slate-800"
          } rounded-lg flex items-center justify-center cursor-pointer`}
          onClick={() => navigate("/summarizer")}
        >
          <FileText className="w-5 h-5 text-white" />
        </div>
        <div
          className={`w-10 h-10 ${
            currentPath === "/task-allocated"
              ? "bg-blue-600"
              : "hover:bg-slate-800"
          } rounded-lg flex items-center justify-center cursor-pointer`}
          onClick={() => navigate("/task-allocated")}
        >
          <UserCheck className="w-5 h-5 text-white" />
        </div>
        <div
          className={`w-10 h-10 ${
            currentPath === "/my-tasks" ? "bg-blue-600" : "hover:bg-slate-800"
          } rounded-lg flex items-center justify-center cursor-pointer`}
          onClick={() => navigate("/my-tasks")}
        >
          <CheckSquare className="w-5 h-5 text-white" />
        </div>
        <div
          className={`w-10 h-10 ${
            currentPath === "/team-directory"
              ? "bg-blue-600"
              : "hover:bg-slate-800"
          } rounded-lg flex items-center justify-center cursor-pointer`}
          onClick={() => navigate("/team-directory")}
        >
          <Users className="w-5 h-5 text-white" />
        </div>
      </div>
      <div className="flex-1"></div>
      <div className="flex flex-col space-y-4">
        <div
          className="w-10 h-10 hover:bg-slate-800 rounded-lg flex items-center justify-center cursor-pointer relative"
          onClick={() => navigate("/login")}
        >
          <LogOut className="w-5 h-5 text-slate-400" />
        </div>
        <div
          className={`w-10 h-10 flex items-center justify-center cursor-pointer hover:bg-slate-800 rounded-lg transition-colors ${isExpanded ? 'ml-4' : ''}`}
          onClick={toggleSidebar}
        >
          {isExpanded ? <ChevronLeft className="w-5 h-5 text-slate-400" /> : <ChevronRight className="w-5 h-5 text-slate-400" />}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
