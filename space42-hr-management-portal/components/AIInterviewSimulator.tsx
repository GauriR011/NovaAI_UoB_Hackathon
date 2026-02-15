
import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Mic, 
  Video, 
  Sparkles, 
  CheckCircle2, 
  Activity, 
  PhoneOff, 
  ShieldCheck, 
  Zap, 
  MessageSquare,
  Cpu,
  BrainCircuit,
  Volume2
} from 'lucide-react';
import { Candidate } from '../types';

interface AIInterviewSimulatorProps {
  candidate: Candidate;
  type: 'PHONE' | 'VIDEO';
  onClose: () => void;
  onSuccess: () => void;
}

const AIInterviewSimulator: React.FC<AIInterviewSimulatorProps> = ({ candidate, type, onClose, onSuccess }) => {
  const [stage, setStage] = useState<'CONNECTING' | 'IN_PROGRESS' | 'ANALYZING' | 'RESULT'>('CONNECTING');
  const [elapsed, setElapsed] = useState(0);
  const [aiAnalysis, setAiAnalysis] = useState<string[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);

  const questions = type === 'PHONE' ? [
    "Could you tell us about your experience with large-scale React applications?",
    "How do you handle state management in complex environments?",
    "Describe a time you had to resolve a high-priority production bug."
  ] : [
    "Show us how you'd architect a real-time data visualization dashboard.",
    "Explain your approach to cross-team collaboration for design systems.",
    "What's your long-term goal in the aerospace software sector?"
  ];

  useEffect(() => {
    let timer: any;
    if (stage === 'CONNECTING') {
      timer = setTimeout(() => setStage('IN_PROGRESS'), 2000);
    } else if (stage === 'IN_PROGRESS') {
      timer = setInterval(() => {
        setElapsed(prev => {
          if (prev >= 15) {
             setStage('ANALYZING');
             return prev;
          }
          return prev + 1;
        });
      }, 1000);
    } else if (stage === 'ANALYZING') {
      timer = setTimeout(() => {
        setAiAnalysis([
          "High confidence intervals detected in core domain answers.",
          "Syntactic logic indicates strong structural understanding.",
          "Psychological emotion safety check: Candidate remains calm under pressure.",
          "Match Score Updated: +4.2% based on technical articulation."
        ]);
        setStage('RESULT');
      }, 3000);
    }
    return () => clearInterval(timer);
  }, [stage]);

  const progress = (elapsed / 15) * 100;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-[#0a0f1e]/80 backdrop-blur-xl animate-in fade-in duration-500">
      <div className="bg-white w-full max-w-4xl rounded-[48px] overflow-hidden flex flex-col shadow-2xl border border-white/20 scale-in-center h-[700px]">
        {/* Header */}
        <div className="p-8 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
          <div className="flex items-center space-x-4">
            <div className={`p-3 rounded-2xl shadow-lg ${type === 'PHONE' ? 'bg-blue-600 text-white' : 'bg-indigo-600 text-white'}`}>
              {type === 'PHONE' ? <PhoneOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="font-black text-gray-900 tracking-tight">
                AI {type === 'PHONE' ? 'Phone Screening' : 'Video Assessment'}
              </h3>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">
                Session ID: SPACE-INT-{Math.floor(Math.random() * 90000 + 10000)}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-full transition-colors">
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        {/* Simulator Content */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {stage === 'CONNECTING' && (
            <div className="flex-1 flex flex-col items-center justify-center space-y-8 animate-pulse">
               <div className="relative">
                  <div className="w-32 h-32 border-4 border-gray-100 border-t-blue-600 rounded-full animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Sparkles className="w-10 h-10 text-blue-600" />
                  </div>
               </div>
               <div className="text-center">
                 <p className="font-black text-gray-900 text-xl italic tracking-tight">Initializing Neural Bridge...</p>
                 <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-2">Connecting candidate to Space42 Agent V3</p>
               </div>
            </div>
          )}

          {stage === 'IN_PROGRESS' && (
            <div className="flex-1 flex flex-col md:flex-row p-8 gap-8">
               <div className="flex-1 flex flex-col justify-between">
                  <div className="space-y-6">
                    <div className="flex items-center space-x-3">
                       <span className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_12px_rgba(16,185,129,0.5)]"></span>
                       <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Live Assessment</span>
                    </div>
                    <div className="bg-[#0a0f1e] text-white p-10 rounded-[40px] shadow-2xl relative overflow-hidden h-64 flex flex-col justify-center">
                       <div className="absolute top-0 right-0 p-8 opacity-5">
                          <Activity className="w-48 h-48 animate-pulse" />
                       </div>
                       <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-4">AI AGENT PROMPT:</p>
                       <p className="text-2xl font-black italic leading-tight text-gray-100 max-w-md">
                         "{questions[Math.floor(elapsed / 5) % questions.length]}"
                       </p>
                       <div className="mt-8 flex items-center space-x-3">
                          <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                             <div className="h-full bg-blue-500 transition-all duration-1000" style={{width: `${(elapsed % 5) * 20}%`}}></div>
                          </div>
                          <Volume2 className="w-4 h-4 text-gray-500" />
                       </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-3xl p-6 border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                       <div className="flex items-center space-x-2">
                          <Mic className="w-4 h-4 text-blue-600" />
                          <span className="text-[10px] font-black text-gray-900 uppercase tracking-widest">Candidate Audio Input</span>
                       </div>
                       <span className="text-[10px] font-bold text-gray-400 uppercase">{elapsed}s / 15s</span>
                    </div>
                    <div className="flex items-end justify-between h-12 gap-1 px-4">
                       {Array.from({length: 24}).map((_, i) => (
                         <div 
                           key={i} 
                           className="w-1 bg-blue-600/30 rounded-full transition-all duration-300"
                           style={{ height: `${Math.random() * 80 + 20}%`, animationDelay: `${i * 0.1}s` }}
                         />
                       ))}
                    </div>
                  </div>
               </div>

               <div className="w-full md:w-80 space-y-6">
                  <div className="bg-white rounded-[40px] border border-gray-100 p-8 shadow-sm h-full flex flex-col">
                    <div className="flex flex-col items-center text-center mb-8">
                       <img src={candidate.avatar} className="w-24 h-24 rounded-[32px] object-cover ring-4 ring-blue-50 ring-offset-4 mb-4" alt="" />
                       <h4 className="font-black text-lg text-gray-900">{candidate.name}</h4>
                       <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{candidate.role}</p>
                    </div>

                    <div className="space-y-4 flex-1">
                       <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Neural Analysis</p>
                          <div className="flex items-center space-x-2">
                             <BrainCircuit className="w-4 h-4 text-blue-600" />
                             <span className="text-xs font-bold text-gray-700 italic">Processing semantic mapping...</span>
                          </div>
                       </div>
                       <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Confidence Level</p>
                          <div className="flex items-center justify-between">
                             <span className="text-lg font-black italic text-gray-900">89%</span>
                             <div className="w-20 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-500 w-4/5"></div>
                             </div>
                          </div>
                       </div>
                    </div>

                    <button className="w-full py-4 bg-red-50 text-red-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all">
                       Emergency Abort
                    </button>
                  </div>
               </div>
            </div>
          )}

          {stage === 'ANALYZING' && (
            <div className="flex-1 flex flex-col items-center justify-center space-y-8 animate-in fade-in zoom-in duration-500">
               <div className="relative">
                 <Cpu className="w-24 h-24 text-blue-600 animate-pulse" />
                 <div className="absolute -top-2 -right-2">
                    <Sparkles className="w-8 h-8 text-amber-500 animate-bounce" />
                 </div>
               </div>
               <div className="text-center max-w-sm">
                 <h4 className="text-2xl font-black italic text-gray-900">Finalizing Evaluation</h4>
                 <p className="text-sm text-gray-500 font-medium mt-3 leading-relaxed">
                   Space42 is cross-referencing candidate answers against global competency standards and psychological safety benchmarks.
                 </p>
               </div>
               <div className="w-64 h-2 bg-gray-100 rounded-full overflow-hidden">
                 <div className="h-full bg-blue-600 animate-[loading_3s_ease-in-out_infinite]"></div>
               </div>
            </div>
          )}

          {stage === 'RESULT' && (
            <div className="flex-1 p-12 overflow-y-auto animate-in slide-in-from-bottom-8 duration-700">
              <div className="flex items-center justify-between mb-12">
                <div className="flex items-center space-x-4">
                  <div className="bg-emerald-100 p-4 rounded-[32px] border border-emerald-200">
                    <ShieldCheck className="w-10 h-10 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-black text-gray-900 tracking-tight italic">Passed {type === 'PHONE' ? 'Round 1' : 'Round 2'}</h3>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Audit Log Verifiable • Timestamp: {new Date().toLocaleTimeString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">AI Recommendation Score</p>
                  <p className="text-5xl font-black text-emerald-600 italic tracking-tighter">94.2%</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                 <div className="space-y-6">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-100 pb-2">Neural Extraction Log</p>
                    <div className="space-y-3">
                       {aiAnalysis.map((item, i) => (
                         <div key={i} className="flex items-start space-x-3 group animate-in slide-in-from-left duration-300" style={{ animationDelay: `${i * 0.15}s` }}>
                           <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 group-hover:scale-110 transition-transform" />
                           <p className="text-sm font-medium text-gray-600">{item}</p>
                         </div>
                       ))}
                    </div>
                 </div>
                 <div className="bg-gray-50 p-8 rounded-[40px] border border-gray-100">
                    <div className="flex items-center space-x-2 mb-4">
                       <MessageSquare className="w-4 h-4 text-blue-600" />
                       <p className="text-[10px] font-black text-gray-900 uppercase tracking-widest">Sentiment Analysis</p>
                    </div>
                    <p className="text-sm text-gray-500 font-medium leading-relaxed italic">
                      "Candidate exhibits high growth mindset markers and low attrition risk. Recommended next step: technical deep dive on legacy migration logic."
                    </p>
                 </div>
              </div>

              <div className="flex items-center space-x-4 pt-8 border-t border-gray-50">
                <button 
                  onClick={onClose}
                  className="flex-1 py-5 bg-gray-100 text-gray-500 rounded-[24px] font-black text-xs uppercase tracking-[0.2em] hover:bg-gray-200 transition-all active:scale-95"
                >
                   Review Details
                </button>
                <button 
                  onClick={() => {
                    onSuccess();
                    onClose();
                  }}
                  className="flex-[2] py-5 bg-blue-600 text-white rounded-[24px] font-black text-xs uppercase tracking-[0.2em] hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/30 flex items-center justify-center space-x-3 active:scale-95"
                >
                   <UserCheck className="w-4 h-4" />
                   <span>Shortlist Candidate</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Helper Icon Components
const UserCheck: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><polyline points="16 11 18 13 22 9"/>
  </svg>
);

export default AIInterviewSimulator;
