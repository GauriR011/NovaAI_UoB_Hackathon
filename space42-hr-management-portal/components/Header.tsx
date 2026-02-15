
import React from 'react';
import { Search, Bell, MessageSquare, Orbit, PanelRightClose, Sparkles } from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  toggleCopilot: () => void;
  isCopilotOpen: boolean;
}

const Header: React.FC<HeaderProps> = ({ activeTab, toggleCopilot, isCopilotOpen }) => {
  return (
    <header className="h-20 bg-white border-b border-gray-100 px-8 flex items-center justify-between sticky top-0 z-10">
      <div className="flex items-center space-x-4">
        <h1 className="text-2xl font-bold text-gray-900">{activeTab}</h1>
        <div className="h-6 w-[1px] bg-gray-200 hidden md:block"></div>
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input 
            type="text" 
            placeholder="Search candidates, roles..." 
            className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 w-64 transition-all"
          />
        </div>
      </div>

      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-2 mr-4 px-3 py-1.5 bg-blue-50 rounded-full">
          <Sparkles className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
          <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">AI Active</span>
        </div>
        
        <button className="relative text-gray-500 hover:text-blue-600 transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
        <button className="text-gray-500 hover:text-blue-600 transition-colors">
          <MessageSquare className="w-5 h-5" />
        </button>
        
        {/* Subtle toggle in header as well */}
        <button 
          onClick={toggleCopilot}
          className={`p-2 rounded-xl transition-all duration-300 ${
            isCopilotOpen 
              ? 'bg-blue-600 text-white rotate-0' 
              : 'text-gray-400 hover:text-blue-600 bg-gray-50'
          }`}
        >
          {isCopilotOpen ? <PanelRightClose className="w-5 h-5" /> : <Orbit className="w-5 h-5" />}
        </button>
      </div>
    </header>
  );
};

export default Header;
