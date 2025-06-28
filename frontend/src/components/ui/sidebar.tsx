import { Home, CheckSquare, UserCheck, FileText, Users, Settings, Bell, ChevronRight, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleSidebar = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className={`bg-slate-900 flex flex-col items-center py-6 text-white transition-all duration-300 ${isExpanded ? 'w-64' : 'w-16'}`}>
      <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center mb-6">
        <FileText className="w-6 h-6 text-white" />
      </div>
      <div className="flex flex-col space-y-4 w-full">
        <div
          className={`flex items-center cursor-pointer hover:bg-blue-700 transition-colors ${isExpanded ? 'justify-start pl-4 w-full h-10' : 'w-10 h-10 justify-center'}`}
          onClick={() => navigate('/dashboard')}
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
          className={`flex items-center cursor-pointer hover:bg-slate-800 transition-colors ${isExpanded ? 'justify-start pl-4 w-full h-10' : 'w-10 h-10 justify-center'}`}
          onClick={() => navigate('/task-allocation')}
        >
          <UserCheck className={`w-5 h-5 ${isExpanded ? 'text-white' : 'text-slate-400'}`} />
          {isExpanded && <span className="ml-2 text-sm font-medium">Task Allocation</span>}
        </div>
        <div
          className={`flex items-center cursor-pointer hover:bg-slate-800 transition-colors ${isExpanded ? 'justify-start pl-4 w-full h-10' : 'w-10 h-10 justify-center'}`}
          onClick={() => navigate('/summarizer')}
        >
          <FileText className={`w-5 h-5 ${isExpanded ? 'text-white' : 'text-slate-400'}`} />
          {isExpanded && <span className="ml-2 text-sm font-medium">Summarizer</span>}
        </div>
        <div
          className={`flex items-center cursor-pointer hover:bg-slate-800 transition-colors ${isExpanded ? 'justify-start pl-4 w-full h-10' : 'w-10 h-10 justify-center'}`}
          onClick={() => navigate('/team-directory')}
        >
          <Users className={`w-5 h-5 ${isExpanded ? 'text-white' : 'text-slate-400'}`} />
          {isExpanded && <span className="ml-2 text-sm font-medium">Team Directory</span>}
        </div>
      </div>
      <div className="flex-1"></div>
      <div className="flex flex-col space-y-4 w-full">
        <div
          className={`flex items-center cursor-pointer hover:bg-slate-800 transition-colors ${isExpanded ? 'justify-start pl-4 w-full h-10' : 'w-10 h-10 justify-center'}`}
          onClick={() => navigate('/settings')}
        >
          <Settings className={`w-5 h-5 ${isExpanded ? 'text-white' : 'text-slate-400'}`} />
          {isExpanded && <span className="ml-2 text-sm font-medium">Settings</span>}
        </div>
        <div
          className={`flex items-center cursor-pointer hover:bg-slate-800 transition-colors ${isExpanded ? 'justify-start pl-4 w-full h-10 relative' : 'w-10 h-10 justify-center relative'}`}
        >
          <Bell className={`w-5 h-5 ${isExpanded ? 'text-white' : 'text-slate-400'}`} />
          {isExpanded && <span className="ml-2 text-sm font-medium">Notifications</span>}
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
            <span className="text-xs text-white">3</span>
          </div>
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