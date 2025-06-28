import { Home, Users, BarChart3, Settings, Bell, Shield, Radio, Car } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Sidebar: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="w-16 bg-slate-900 flex flex-col items-center py-6 space-y-6">
      <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
        <Shield className="w-5 h-5 text-white" />
      </div>
      <div className="flex flex-col space-y-4">
        <div
          className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center cursor-pointer"
          onClick={() => navigate('/dashboard')}
        >
          <Home className="w-5 h-5 text-white" />
        </div>
        <div className="w-10 h-10 hover:bg-slate-800 rounded-lg flex items-center justify-center cursor-pointer"
          onClick={() => navigate('/task-allocation')}
        >
          <Users className="w-5 h-5 text-slate-400" />
        </div>
        <div className="w-10 h-10 hover:bg-slate-800 rounded-lg flex items-center justify-center cursor-pointer">
          <BarChart3 className="w-5 h-5 text-slate-400" />
        </div>
        <div className="w-10 h-10 hover:bg-slate-800 rounded-lg flex items-center justify-center cursor-pointer">
          <Radio className="w-5 h-5 text-slate-400" />
        </div>
        <div className="w-10 h-10 hover:bg-slate-800 rounded-lg flex items-center justify-center cursor-pointer">
          <Car className="w-5 h-5 text-slate-400" />
        </div>
      </div>
      <div className="flex-1"></div>
      <div className="flex flex-col space-y-4">
        <div className="w-10 h-10 hover:bg-slate-800 rounded-lg flex items-center justify-center cursor-pointer">
          <Settings className="w-5 h-5 text-slate-400" />
        </div>
        <div className="$w-10 h-10 hover:bg-slate-800 rounded-lg flex items-center justify-center cursor-pointer relative">
          <Bell className="w-5 h-5 text-slate-400" />
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
            <span className="text-xs text-white">3</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;