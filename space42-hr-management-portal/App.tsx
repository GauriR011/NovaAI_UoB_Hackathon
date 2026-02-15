
import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import HRDashboard from './components/HRDashboard';
import CandidatesPage from './components/CandidatesPage';
import JobBoardsPage from './components/JobBoardsPage';
import InterviewsPage from './components/InterviewsPage';
import DataManagementPage from './components/DataManagementPage';
import SettingsPage from './components/SettingsPage';
import AICopilot from './components/AICopilot';
import CandidateDetailModal from './components/CandidateDetailModal';
import CVUploadModal from './components/CVUploadModal';
import { Candidate, CandidateStatus } from './types';
import { Orbit, ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';

const INITIAL_CANDIDATES: Candidate[] = [
  {
    id: '1',
    name: 'Sarah Jenkins',
    role: 'Senior Frontend Engineer',
    email: 'sarah.j@example.com',
    matchScore: 98,
    status: CandidateStatus.SHORTLISTED,
    appliedDate: '2024-05-10',
    summary: 'Expert in React and Distributed Systems. Previously led teams at OrbitScale.',
    aiInsights: ['Strong technical match', 'Leadership experience', 'High cultural alignment'],
    avatar: 'https://picsum.photos/seed/sarah/100/100'
  },
  {
    id: '2',
    name: 'Michael Chen',
    role: 'Product Designer',
    email: 'm.chen@example.com',
    matchScore: 85,
    status: CandidateStatus.INTERVIEWING,
    appliedDate: '2024-05-12',
    summary: 'Focused on accessibility and space-tech UI. Portfolio shows high aesthetic standard.',
    aiInsights: ['Creative problem solver', 'Needs slight technical upskilling', 'Passionate about SpaceX'],
    avatar: 'https://picsum.photos/seed/michael/100/100'
  },
  {
    id: '3',
    name: 'Alex Rivera',
    role: 'Backend Architect',
    email: 'alex.r@example.com',
    matchScore: 92,
    status: CandidateStatus.APPLIED,
    appliedDate: '2024-05-14',
    summary: 'Cloud-native expert. Experience with high-throughput telemetry data processing.',
    aiInsights: ['Scalability expert', 'Experience with Rust', 'Excellent communication'],
    avatar: 'https://picsum.photos/seed/alex/100/100'
  },
  {
    id: '4',
    name: 'Lena Park',
    role: 'Product Designer',
    email: 'lena.p@example.com',
    matchScore: 78,
    status: CandidateStatus.REJECTED,
    appliedDate: '2024-05-15',
    summary: 'Strong visual skills but limited experience with aerospace industry safety protocols.',
    aiInsights: ['Great visual portfolio', 'Limited domain knowledge', 'High growth potential'],
    avatar: 'https://picsum.photos/seed/lena/100/100'
  }
];

const App: React.FC = () => {
  const [candidates, setCandidates] = useState<Candidate[]>(INITIAL_CANDIDATES);
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string, visible: boolean }>({ message: '', visible: false });

  const toggleCopilot = () => setIsCopilotOpen(!isCopilotOpen);

  const showToast = (message: string) => {
    setToast({ message, visible: true });
    setTimeout(() => setToast({ message: '', visible: false }), 3000);
  };

  const handleUpdateStatus = (id: string, status: CandidateStatus) => {
    setCandidates(prev => prev.map(c => c.id === id ? { ...c, status } : c));
    showToast(`Candidate status updated to ${status.replace('_', ' ')}`);
    setSelectedCandidate(null);
  };

  const handleAddExtractedCandidate = (extracted: any) => {
    const newCandidate: Candidate = {
      ...extracted,
      id: Math.random().toString(36).substr(2, 9),
      appliedDate: new Date().toISOString(),
      status: CandidateStatus.APPLIED,
      avatar: `https://picsum.photos/seed/${extracted.name.split(' ')[0]}/100/100`
    };
    setCandidates(prev => [newCandidate, ...prev]);
    showToast(`${newCandidate.name} added to pipeline`);
  };

  return (
    <div className="flex h-screen bg-[#f8fafc] text-gray-900 overflow-hidden relative font-['Inter']">
      {/* Sidebar - Space42 Branding */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Content Container (Main + AI) */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Main Content Area */}
        <main className="flex-1 flex flex-col min-w-0 bg-white relative transition-all duration-500 ease-in-out">
          <Header 
            activeTab={activeTab} 
            toggleCopilot={toggleCopilot} 
            isCopilotOpen={isCopilotOpen}
          />
          
          <div className="flex-1 overflow-y-auto p-8 bg-[#f8fafc]/50">
            {activeTab === 'Dashboard' && (
              <HRDashboard 
                candidates={candidates} 
                onSelectCandidate={(c) => setSelectedCandidate(c)}
              />
            )}
            {activeTab === 'Candidates' && (
              <CandidatesPage 
                candidates={candidates} 
                onSelectCandidate={(c) => setSelectedCandidate(c)}
                onOpenUpload={() => setIsUploadModalOpen(true)}
              />
            )}
            {activeTab === 'Job Boards' && (
              <JobBoardsPage />
            )}
            {activeTab === 'Interviews' && (
              <InterviewsPage candidates={candidates} />
            )}
            {activeTab === 'Data' && (
              <DataManagementPage />
            )}
            {activeTab === 'Settings' && (
              <SettingsPage />
            )}
            {/* Fallback for unhandled tabs */}
            {!['Dashboard', 'Candidates', 'Job Boards', 'Interviews', 'Data', 'Settings'].includes(activeTab) && (
               <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4">
                  <div className="p-8 bg-gray-50 rounded-full border border-gray-100">
                    <Orbit className="w-16 h-16 opacity-5 animate-pulse" />
                  </div>
                  <div className="text-center">
                    <p className="font-black text-gray-900 text-xl tracking-tight">{activeTab} Page</p>
                    <p className="text-sm">This section is currently under construction in the space-time continuum.</p>
                  </div>
               </div>
            )}
          </div>

          {/* Edge-attached Toggle Tab */}
          {!isCopilotOpen && (
            <button
              onClick={toggleCopilot}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-40 group flex items-center"
            >
              <div className="bg-[#0a0f1e] text-white py-6 px-1.5 rounded-l-2xl border-l border-t border-b border-blue-500/30 shadow-[-4px_0_15px_rgba(0,0,0,0.2)] hover:bg-[#151c2e] transition-all duration-300 flex flex-col items-center space-y-4">
                <Orbit className="w-5 h-5 text-blue-400 animate-[spin_6s_linear_infinite]" />
                <div className="[writing-mode:vertical-lr] text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 group-hover:text-blue-400 transition-colors">
                  AI Co-pilot
                </div>
                <ChevronLeft className="w-4 h-4 text-gray-600 group-hover:text-white transition-colors" />
              </div>
            </button>
          )}
        </main>

        {/* AI Co-pilot Panel */}
        <div 
          className={`h-full bg-[#0a0f1e] shadow-2xl overflow-hidden transition-all duration-500 ease-in-out flex-shrink-0 border-l border-gray-800 ${
            isCopilotOpen ? 'w-[400px]' : 'w-0'
          }`}
        >
          <div className="w-[400px] h-full relative">
            <AICopilot onClose={toggleCopilot} />
            <button
              onClick={toggleCopilot}
              className="absolute -left-4 top-1/2 -translate-y-1/2 z-50 bg-[#0a0f1e] text-blue-400 p-1.5 rounded-l-lg border-l border-t border-b border-blue-500/20 hover:text-white transition-colors shadow-lg"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Candidate Modal */}
      {selectedCandidate && (
        <CandidateDetailModal 
          candidate={selectedCandidate} 
          onClose={() => setSelectedCandidate(null)}
          onUpdateStatus={handleUpdateStatus}
        />
      )}

      {/* CV Upload Modal */}
      {isUploadModalOpen && (
        <CVUploadModal 
          onClose={() => setIsUploadModalOpen(false)}
          onSuccess={handleAddExtractedCandidate}
        />
      )}

      {/* Toast Notification */}
      <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[200] transition-all duration-500 ${toast.visible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0 pointer-events-none'}`}>
        <div className="bg-[#0a0f1e] text-white px-8 py-4 rounded-[24px] shadow-2xl border border-white/10 flex items-center space-x-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          <span className="text-sm font-black uppercase tracking-[0.1em]">{toast.message}</span>
        </div>
      </div>
    </div>
  );
};

export default App;
