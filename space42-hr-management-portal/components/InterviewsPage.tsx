
import React, { useState, useMemo } from 'react';
import { 
  CheckCircle2, 
  Sparkles, 
  Play, 
  Zap, 
  Activity, 
  UserCheck, 
  ShieldCheck, 
  ExternalLink,
  ChevronRight,
  Search,
  Filter,
  FileText,
  SearchCode,
  Globe
} from 'lucide-react';
import { Candidate, CandidateStatus } from '../types';
import InterviewAnalysisModal from './InterviewAnalysisModal';
import AIInterviewSimulator from './AIInterviewSimulator';
import BackgroundResearchModal from './BackgroundResearchModal';

interface InterviewsPageProps {
  candidates: Candidate[];
}

const InterviewsPage: React.FC<InterviewsPageProps> = ({ candidates }) => {
  const [activeTab, setActiveTab] = useState<'PIPELINE' | 'CALENDAR'>('PIPELINE');
  const [selectedCandidateForAnalysis, setSelectedCandidateForAnalysis] = useState<Candidate | null>(null);
  const [researchCandidate, setResearchCandidate] = useState<Candidate | null>(null);
  const [activeSimulator, setActiveSimulator] = useState<{ candidate: Candidate, type: 'PHONE' | 'VIDEO' } | null>(null);

  const aiScreeningQueue = useMemo(() => 
    candidates.filter(c => c.status === CandidateStatus.APPLIED || c.status === CandidateStatus.INTERVIEWING), 
  [candidates]);

  const humanShortlist = useMemo(() => 
    candidates.filter(c => c.status === CandidateStatus.SHORTLISTED),
  [candidates]);

  return (
    <div className="max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-700 pb-20">
      
      {/* Top Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex-1 p-8 bg-white rounded-[12px] border border-blue-400 shadow-sm relative overflow-hidden">
          <div className="relative z-10">
            {/* Removed 'italic' as requested by the user */}
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">Interview Intelligence</h2>
            <p className="text-gray-500 font-medium mt-1">HR Control Center: Processing AI screenings and scheduling human deep-dives.</p>
          </div>
        </div>

        <div className="flex bg-gray-100/50 p-1 rounded-xl border border-gray-100 self-start md:self-center">
          <button 
            onClick={() => setActiveTab('PIPELINE')}
            className={`px-8 py-2.5 rounded-lg text-[11px] font-black uppercase tracking-[0.15em] transition-all ${activeTab === 'PIPELINE' ? 'bg-[#0a0f1e] text-white shadow-lg' : 'text-gray-400 hover:text-gray-600'}`}
          >
            Pipeline
          </button>
          <button 
            onClick={() => setActiveTab('CALENDAR')}
            className={`px-8 py-2.5 rounded-lg text-[11px] font-black uppercase tracking-[0.15em] transition-all ${activeTab === 'CALENDAR' ? 'bg-[#0a0f1e] text-white shadow-lg' : 'text-gray-400 hover:text-gray-600'}`}
          >
            Human Calendar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Automated Screening Results */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600/10 p-2 rounded-xl">
                <Activity className="w-4 h-4 text-blue-600" />
              </div>
              <h3 className="text-[10px] font-black text-gray-900 uppercase tracking-[0.2em]">Automated Screening Results</h3>
            </div>
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{aiScreeningQueue.length} Active Sessions</span>
          </div>

          <div className="space-y-6">
            {aiScreeningQueue.map((c, i) => (
              <div key={c.id} className="bg-gray-50/40 p-8 rounded-[40px] border border-gray-100 shadow-sm hover:shadow-md transition-all group relative">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                  <div className="flex items-center space-x-6">
                    <img src={c.avatar} className="w-20 h-20 rounded-[32px] object-cover ring-4 ring-white shadow-sm" alt="" />
                    <div>
                      <h4 className="text-2xl font-black text-gray-900 tracking-tight">{c.name}</h4>
                      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">{c.role}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex flex-col items-center px-5 py-2 bg-white rounded-2xl border border-gray-100 min-w-[120px]">
                      <p className="text-[8px] font-black text-gray-400 uppercase mb-1.5 tracking-wider">Round 1 (Phone)</p>
                      <div className="flex items-center space-x-1.5 text-emerald-600 font-black text-[9px] uppercase border border-emerald-100 bg-emerald-50/30 px-2 py-0.5 rounded-lg">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Passed</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-center px-5 py-2 bg-blue-50/20 rounded-2xl border border-blue-100/30 min-w-[120px]">
                      <p className="text-[8px] font-black text-blue-400 uppercase mb-1.5 tracking-wider">Round 2 (Video)</p>
                      <div className={`flex items-center space-x-1.5 ${i % 2 === 0 ? 'text-blue-600 border-blue-100 bg-blue-100/30' : 'text-amber-600 border-amber-100 bg-amber-50/30'} font-black text-[9px] uppercase px-2 py-0.5 rounded-lg border`}>
                         {i % 2 === 0 ? (
                           <>
                             <CheckCircle2 className="w-3 h-3" />
                             <span>Passed</span>
                           </>
                         ) : (
                           <>
                             <Zap className="w-3 h-3 animate-pulse" />
                             <span>Analyzing</span>
                           </>
                         )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">AI Match Confidence</p>
                    {/* Strictly non-italic number as requested */}
                    <p className="text-5xl font-black text-gray-900 tracking-tighter">{c.matchScore}%</p>
                  </div>
                </div>

                <div className="mt-8 pt-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
                  <div className="flex-1 max-w-xl">
                    <div className="flex items-center space-x-2 mb-3">
                      <Sparkles className="w-4 h-4 text-blue-500" />
                      <span className="text-[10px] font-black text-gray-900 uppercase tracking-widest">AI Intelligence Summary</span>
                    </div>
                    {/* Italic remains for the summary quote to differentiate it */}
                    <p className="text-[13px] text-gray-500 font-medium leading-relaxed italic">
                      "Demonstrates superior domain knowledge in {c.role.split(' ')[0]} architectures. Emotion safety check cleared. Recommendation: Proceed to Human Interview."
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button 
                      onClick={() => setSelectedCandidateForAnalysis(c)}
                      className="p-4 bg-white text-gray-400 hover:text-blue-600 rounded-2xl border border-gray-100 transition-all shadow-sm"
                    >
                      <Play className="w-5 h-5 fill-current" />
                    </button>
                    <button 
                      className="px-10 py-4 bg-blue-600 text-white rounded-[20px] text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-blue-600/20 hover:bg-blue-700 active:scale-95 transition-all"
                    >
                      Move to Human Round
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Ready for Human Review */}
        <div className="lg:col-span-4 space-y-6">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center space-x-3">
              <div className="bg-emerald-600/10 p-2 rounded-xl">
                <UserCheck className="w-4 h-4 text-emerald-600" />
              </div>
              <h3 className="text-[10px] font-black text-gray-900 uppercase tracking-[0.2em]">Ready for Human Review</h3>
            </div>
          </div>

          <div className="bg-gray-50/40 rounded-[48px] border border-gray-100 p-8 shadow-sm space-y-8 relative overflow-hidden">
            <div className="absolute top-10 right-10 opacity-5 pointer-events-none">
              <ShieldCheck className="w-20 h-20 text-emerald-600" />
            </div>
            
            <p className="text-[11px] text-gray-400 font-medium leading-relaxed max-w-[280px]">
              Candidates in this list have cleared all automated screening rounds with high confidence scores.
            </p>
            
            <div className="space-y-6">
              {humanShortlist.map(c => (
                <div key={c.id} className="p-6 bg-white border border-gray-100 rounded-[32px] group hover:shadow-xl transition-all">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-4">
                      <img src={c.avatar} className="w-14 h-14 rounded-2xl object-cover ring-2 ring-gray-50 shadow-sm" alt="" />
                      <div>
                        <p className="text-sm font-black text-gray-900">{c.name}</p>
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{c.role}</p>
                      </div>
                    </div>
                    <span className="text-[8px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg uppercase tracking-widest border border-emerald-100">Verified</span>
                  </div>
                  
                  <div className="space-y-3">
                    <button 
                      onClick={() => setResearchCandidate(c)}
                      className="w-full py-3 bg-white border border-emerald-100 rounded-xl text-[9px] font-black uppercase tracking-[0.15em] text-emerald-600 hover:bg-emerald-50 transition-all flex items-center justify-center space-x-2"
                    >
                      <SearchCode className="w-3.5 h-3.5" />
                      <span>Deep AI Background Check</span>
                    </button>
                    <button className="w-full py-3.5 bg-blue-600 text-white rounded-xl text-[9px] font-black uppercase tracking-[0.15em] hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/10">
                      Schedule Human Round
                    </button>
                  </div>
                </div>
              ))}
              {humanShortlist.length === 0 && (
                <div className="py-20 flex flex-col items-center justify-center text-center opacity-20">
                   <ShieldCheck className="w-16 h-16 mb-4" />
                   <p className="text-xs font-black uppercase tracking-widest">No candidates verified</p>
                </div>
              )}
            </div>

            <div className="pt-6 border-t border-gray-200/50">
              <div className="bg-blue-50/50 rounded-3xl p-6 border border-blue-100/30">
                <div className="flex items-center space-x-2 mb-2.5 text-blue-600">
                  <Zap className="w-4 h-4" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Efficiency Stat</span>
                </div>
                <p className="text-[11px] text-blue-800 font-bold leading-relaxed">
                  AI screenings reduced HR manual workload by <span className="text-blue-600 font-black italic">84.2%</span> this week.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {selectedCandidateForAnalysis && (
        <InterviewAnalysisModal 
          candidate={selectedCandidateForAnalysis} 
          onClose={() => setSelectedCandidateForAnalysis(null)} 
        />
      )}
      
      {researchCandidate && (
        <BackgroundResearchModal
          candidate={researchCandidate}
          onClose={() => setResearchCandidate(null)}
        />
      )}

      {activeSimulator && (
        <AIInterviewSimulator 
          candidate={activeSimulator.candidate} 
          type={activeSimulator.type} 
          onClose={() => setActiveSimulator(null)}
          onSuccess={() => setActiveSimulator(null)}
        />
      )}
    </div>
  );
};

export default InterviewsPage;
