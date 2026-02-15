
import React, { useState } from 'react';
import { 
  Settings, 
  Shield, 
  Sparkles, 
  Users, 
  Palette, 
  Bell, 
  Lock, 
  Cpu, 
  Eye, 
  Heart,
  Globe,
  Check,
  ChevronRight,
  Save,
  Rocket
} from 'lucide-react';

const SettingsPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState<'AI' | 'TEAM' | 'BRANDING' | 'GENERAL'>('AI');
  const [isSaved, setIsSaved] = useState(false);

  const sections = [
    { id: 'GENERAL', label: 'General', icon: Settings },
    { id: 'AI', label: 'AI Intelligence', icon: Cpu },
    { id: 'TEAM', label: 'Team Access', icon: Users },
    { id: 'BRANDING', label: 'Workspace', icon: Palette },
  ] as const;

  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">System Settings</h2>
          <p className="text-gray-500 font-medium mt-1">Configure your workspace intelligence and team parameters.</p>
        </div>
        <button 
          onClick={handleSave}
          className={`flex items-center space-x-2 px-8 py-4 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] transition-all shadow-xl active:scale-95 ${isSaved ? 'bg-emerald-600 text-white' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-600/30'}`}
        >
          {isSaved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          <span>{isSaved ? 'Changes Applied' : 'Save Configuration'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
        {/* Navigation Sidebar - Fixed Jump by using consistent border */}
        <div className="space-y-4">
          {sections.map((section) => {
            const Icon = section.icon;
            const isActive = activeSection === section.id;
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all group border-2 ${
                  isActive
                    ? 'bg-white text-blue-600 shadow-xl border-blue-500 font-black'
                    : 'text-gray-400 hover:bg-white/50 hover:text-gray-600 border-transparent hover:border-gray-100'
                }`}
              >
                <div className="flex items-center space-x-4">
                  <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'}`} />
                  <span className="text-sm tracking-tight">{section.label}</span>
                </div>
                <ChevronRight className={`w-4 h-4 transition-transform ${isActive ? 'rotate-0 text-blue-600' : '-rotate-90 text-gray-300 opacity-0 group-hover:opacity-100'}`} />
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3 space-y-8">
          {activeSection === 'AI' && (
            <div className="space-y-10 animate-in fade-in duration-500">
              <section className="bg-gray-50/50 p-10 rounded-[48px] border border-gray-100 shadow-sm">
                <div className="flex items-center space-x-4 mb-10">
                  <div className="p-3.5 bg-white rounded-2xl shadow-sm border border-gray-100">
                    <Sparkles className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-gray-900 tracking-tight">AI Agent Behavior</h3>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mt-0.5">Core Intelligence Tuning</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <ToggleSetting 
                    title="Empathy Rejection Filter" 
                    description="AI will rewrite all rejection letters using psychological emotion safety frameworks to ensure candidate wellbeing."
                    icon={Heart}
                    defaultChecked={true}
                  />
                  <ToggleSetting 
                    title="Decision Transparency Log" 
                    description="Enable a 'Why I made this choice' section for every AI recommendation, detailing data points used."
                    icon={Eye}
                    defaultChecked={true}
                  />
                  <ToggleSetting 
                    title="Automated Onboarding Entry" 
                    description="Immediately direct successful candidates to early on-boarding sequences upon offer acceptance."
                    icon={Rocket}
                    defaultChecked={false}
                  />
                </div>
              </section>

              {/* Bias Shield Footer - Matching Screenshot Style */}
              <section className="bg-[#0a0f1e] p-12 rounded-[48px] text-white shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:scale-110 transition-transform duration-1000">
                  <Shield className="w-48 h-48" />
                </div>
                <div className="relative z-10 max-w-2xl">
                  <h3 className="text-2xl font-black italic tracking-tight mb-4">Bias Shield V4.2</h3>
                  <p className="text-sm text-gray-400 leading-relaxed mb-10">
                    Our neural network is currently running a real-time parity check across all active job boards to ensure zero demographic skew in candidate shortlisting.
                  </p>
                  <div className="flex flex-wrap items-center gap-6">
                    <div className="bg-emerald-500/10 text-emerald-400 text-[11px] font-black uppercase tracking-[0.2em] px-5 py-2.5 rounded-xl border border-emerald-500/30 flex items-center space-x-2">
                      <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.5)]"></div>
                      <span>Standard Verified</span>
                    </div>
                    <button className="text-blue-400 text-[11px] font-black uppercase tracking-[0.2em] hover:text-blue-300 transition-colors flex items-center space-x-2">
                      <span>View Audit History</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </section>
            </div>
          )}

          {activeSection === 'TEAM' && (
            <div className="bg-white p-10 rounded-[48px] border border-gray-100 shadow-sm animate-in fade-in duration-500">
              <div className="flex items-center justify-between mb-10">
                <div>
                  <h3 className="text-xl font-black text-gray-900 tracking-tight">Team Management</h3>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mt-0.5">Access Controls & Seats</p>
                </div>
                <button className="flex items-center space-x-2 px-6 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-600 hover:bg-gray-100 transition-all">
                  <Globe className="w-4 h-4" />
                  <span>Invite Member</span>
                </button>
              </div>

              <div className="divide-y divide-gray-50">
                <TeamMember name="Jane Doe" role="Super Admin" email="jane.doe@space42.tech" />
                <TeamMember name="Marcus Orbit" role="Technical Recruiter" email="marcus.o@space42.tech" />
                <TeamMember name="Sarah AI" role="Autonomous Agent" email="ai-agent-01@space42.tech" isAI />
              </div>
            </div>
          )}

          {activeSection === 'BRANDING' && (
            <div className="bg-white p-10 rounded-[48px] border border-gray-100 shadow-sm animate-in fade-in duration-500">
               <h3 className="text-xl font-black text-gray-900 tracking-tight mb-10">Workspace Appearance</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-4">
                     <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Primary Identity Color</p>
                     <div className="flex items-center space-x-4">
                        <div className="w-14 h-14 bg-blue-600 rounded-2xl shadow-xl ring-4 ring-blue-50"></div>
                        <div className="flex-1 p-4 bg-gray-50 border border-gray-100 rounded-2xl font-mono text-xs text-gray-600 font-bold">
                          #2563EB
                        </div>
                     </div>
                  </div>
                  <div className="space-y-4">
                     <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Workspace Logo</p>
                     <div className="flex items-center space-x-4">
                        <div className="w-14 h-14 bg-gray-900 rounded-2xl flex items-center justify-center shadow-lg">
                          <Rocket className="w-7 h-7 text-white" />
                        </div>
                        <button className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] border-b-2 border-blue-100 hover:border-blue-600 transition-all pb-1">
                          Upload SVG
                        </button>
                     </div>
                  </div>
               </div>
            </div>
          )}

          {activeSection === 'GENERAL' && (
             <div className="bg-white p-10 rounded-[48px] border border-gray-100 shadow-sm animate-in fade-in duration-500 space-y-10">
                <div>
                   <h3 className="text-xl font-black text-gray-900 tracking-tight mb-8">Security & Preferences</h3>
                   <div className="space-y-4">
                      <div className="flex items-center justify-between p-8 bg-gray-50/50 rounded-[32px] border border-gray-100">
                         <div className="flex items-center space-x-5">
                            <div className="p-3 bg-white rounded-2xl shadow-sm">
                              <Lock className="w-5 h-5 text-gray-400" />
                            </div>
                            <div>
                               <p className="text-base font-black text-gray-900">Two-Factor Authentication</p>
                               <p className="text-xs text-gray-500 font-medium">Add an extra layer of security to your space-port entry.</p>
                            </div>
                         </div>
                         <div className="w-14 h-7 bg-emerald-500 rounded-full flex items-center justify-end px-1.5 cursor-pointer shadow-inner">
                            <div className="w-4.5 h-4.5 bg-white rounded-full shadow-md"></div>
                         </div>
                      </div>
                      <div className="flex items-center justify-between p-8 bg-gray-50/50 rounded-[32px] border border-gray-100">
                         <div className="flex items-center space-x-5">
                            <div className="p-3 bg-white rounded-2xl shadow-sm">
                              <Bell className="w-5 h-5 text-gray-400" />
                            </div>
                            <div>
                               <p className="text-base font-black text-gray-900">System Notifications</p>
                               <p className="text-xs text-gray-500 font-medium">Get alerts for high-match candidates and interview results.</p>
                            </div>
                         </div>
                         <div className="w-14 h-7 bg-emerald-500 rounded-full flex items-center justify-end px-1.5 cursor-pointer shadow-inner">
                            <div className="w-4.5 h-4.5 bg-white rounded-full shadow-md"></div>
                         </div>
                      </div>
                   </div>
                </div>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- Helper Components ---

const ToggleSetting: React.FC<{ 
  title: string, 
  description: string, 
  icon: any, 
  defaultChecked?: boolean 
}> = ({ title, description, icon: Icon, defaultChecked = false }) => {
  const [checked, setChecked] = useState(defaultChecked);
  return (
    <div className="flex items-center justify-between p-8 bg-white rounded-[32px] border border-gray-100 hover:border-blue-100 hover:shadow-lg transition-all group">
      <div className="flex items-center space-x-6">
        <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 shadow-sm group-hover:scale-110 group-hover:bg-blue-50 transition-all">
          <Icon className="w-6 h-6 text-gray-400 group-hover:text-blue-600" />
        </div>
        <div className="max-w-md">
          <p className="text-base font-black text-gray-900">{title}</p>
          <p className="text-xs text-gray-500 mt-1 font-medium leading-relaxed">{description}</p>
        </div>
      </div>
      <button 
        onClick={() => setChecked(!checked)}
        className={`w-16 h-8 rounded-full flex items-center px-1.5 transition-all shadow-inner ${checked ? 'bg-blue-600 justify-end' : 'bg-gray-200 justify-start'}`}
      >
        <div className="w-5 h-5 bg-white rounded-full shadow-md transition-transform"></div>
      </button>
    </div>
  );
};

const TeamMember: React.FC<{ name: string, role: string, email: string, isAI?: boolean }> = ({ name, role, email, isAI }) => (
  <div className="py-8 flex items-center justify-between group">
    <div className="flex items-center space-x-5">
      <div className={`w-14 h-14 rounded-[22px] flex items-center justify-center font-black text-base ring-4 ring-gray-50 shadow-sm ${isAI ? 'bg-blue-600 text-white shadow-blue-600/20' : 'bg-gray-100 text-gray-900'}`}>
        {isAI ? <Sparkles className="w-6 h-6" /> : name.charAt(0)}
      </div>
      <div>
        <p className="text-base font-black text-gray-900">{name}</p>
        <p className="text-[10px] font-black text-gray-400 mt-1 uppercase tracking-[0.2em]">{role}</p>
      </div>
    </div>
    <div className="text-right flex items-center space-x-8">
      <p className="hidden md:block text-xs font-bold text-gray-400 font-mono tracking-tight">{email}</p>
      <button className="p-2.5 bg-gray-50 text-gray-300 hover:text-gray-900 rounded-xl transition-all opacity-0 group-hover:opacity-100 border border-transparent hover:border-gray-200">
        <Settings className="w-4.5 h-4.5" />
      </button>
    </div>
  </div>
);

export default SettingsPage;
