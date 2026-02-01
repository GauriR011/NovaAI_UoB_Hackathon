
import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Briefcase, 
  Calendar, 
  Settings, 
  HelpCircle,
  Rocket,
  Database
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard },
    { name: 'Candidates', icon: Users },
    { name: 'Job Boards', icon: Briefcase },
    { name: 'Interviews', icon: Calendar },
    { name: 'Data', icon: Database },
    { name: 'Settings', icon: Settings },
  ];

  return (
    <div className="w-64 bg-[#0a0f1e] text-white flex flex-col h-full border-r border-gray-800">
      <div className="p-6 flex items-center space-x-3">
        <div className="bg-blue-600 p-2 rounded-lg">
          <Rocket className="w-6 h-6 text-white" />
        </div>
        <span className="text-xl font-bold tracking-tight">Space42</span>
      </div>

      <nav className="flex-1 px-4 mt-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.name;
          return (
            <button
              key={item.name}
              onClick={() => setActiveTab(item.name)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl border transition-all duration-200 ${
                isActive 
                  ? 'bg-blue-600/10 text-blue-400 border-blue-500/20 shadow-[0_0_15px_rgba(37,99,235,0.1)]' 
                  : 'border-transparent text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-blue-400' : 'text-gray-400'}`} />
              <span className="font-medium">{item.name}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-800">
        <button className="w-full flex items-center space-x-3 px-4 py-3 text-gray-400 hover:text-white transition-colors">
          <HelpCircle className="w-5 h-5" />
          <span>Support Center</span>
        </button>
        <div className="mt-4 p-4 rounded-xl bg-blue-600/5 border border-blue-500/10">
          <p className="text-xs text-gray-400 mb-2 uppercase tracking-widest font-bold">HR Mode</p>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-xs font-bold">JD</div>
            <div>
              <p className="text-sm font-semibold truncate">Jane Doe</p>
              <p className="text-[10px] text-gray-500">Talent Acquisition</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
