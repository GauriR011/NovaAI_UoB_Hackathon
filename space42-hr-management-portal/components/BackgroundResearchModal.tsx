
import React, { useState, useEffect } from 'react';
// Added missing FileText import from lucide-react
import { X, ShieldCheck, SearchCode, Globe, Github, Linkedin, CheckCircle2, AlertCircle, Sparkles, ExternalLink, Cpu, FileText } from 'lucide-react';
import { Candidate } from '../types';

interface BackgroundResearchModalProps {
  candidate: Candidate;
  onClose: () => void;
}

const BackgroundResearchModal: React.FC<BackgroundResearchModalProps> = ({ candidate, onClose }) => {
  const [analyzing, setAnalyzing] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setAnalyzing(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-[160] flex items-center justify-center p-4 bg-[#0a0f1e]/80 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-3xl rounded-[48px] overflow-hidden flex flex-col shadow-2xl scale-in-center border border-white/20">
        
        {/* Header */}
        <div className="p-10 pb-6 border-b border-gray-50 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-emerald-600 p-3 rounded-2xl shadow-xl shadow-emerald-600/20">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-gray-900 tracking-tight">AI Deep Research Profile</h2>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Verification Hash: {Math.random().toString(16).slice(2, 10).toUpperCase()}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-gray-50 rounded-full transition-colors">
            <X className="w-8 h-8 text-gray-400" />
          </button>
        </div>

        <div className="p-10 overflow-y-auto max-h-[70vh] scrollbar-hide">
          {analyzing ? (
            <div className="py-20 flex flex-col items-center justify-center space-y-8 animate-pulse">
               <div className="relative">
                  <div className="w-24 h-24 border-4 border-emerald-50 border-t-emerald-600 rounded-full animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <SearchCode className="w-8 h-8 text-emerald-600" />
                  </div>
               </div>
               <div className="text-center space-y-2">
                 <p className="text-xl font-black text-gray-900 italic tracking-tight">Syncing Neural Identity...</p>
                 <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Crawling technical clusters & professional nodes</p>
               </div>
            </div>
          ) : (
            <div className="space-y-10 animate-in slide-in-from-bottom-4 duration-500">
              {/* Candidate Quick Look */}
              <div className="flex items-center space-x-6 p-8 bg-gray-50 rounded-[32px] border border-gray-100">
                <img src={candidate.avatar} className="w-20 h-20 rounded-[24px] object-cover ring-4 ring-white shadow-md" alt="" />
                <div>
                  <h3 className="text-2xl font-black text-gray-900 tracking-tight">{candidate.name}</h3>
                  <p className="text-sm font-bold text-gray-500">{candidate.role}</p>
                  <div className="flex items-center space-x-4 mt-3">
                    <a href="#" className="p-2 bg-white rounded-lg border border-gray-100 hover:text-blue-600 transition-colors"><Linkedin className="w-4 h-4" /></a>
                    <a href="#" className="p-2 bg-white rounded-lg border border-gray-100 hover:text-gray-900 transition-colors"><Github className="w-4 h-4" /></a>
                    <a href="#" className="p-2 bg-white rounded-lg border border-gray-100 hover:text-blue-400 transition-colors"><Globe className="w-4 h-4" /></a>
                  </div>
                </div>
                <div className="ml-auto text-right">
                   <div className="bg-emerald-50 px-4 py-2 rounded-2xl border border-emerald-100 inline-block mb-1">
                      <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest flex items-center space-x-2">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Background Verified</span>
                      </span>
                   </div>
                   <p className="text-[10px] font-bold text-gray-400 uppercase mt-1">Checked on May 22, 2024</p>
                </div>
              </div>

              {/* Research Insights Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <section className="space-y-4">
                  <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-100 pb-2">Employment History Verification</h4>
                  <div className="space-y-3">
                    {[
                      { company: 'OrbitScale', period: '2020 - Present', status: 'CONFIRMED', detail: 'Senior Technical Lead' },
                      { company: 'Nova Systems', period: '2018 - 2020', status: 'CONFIRMED', detail: 'Frontend Specialist' }
                    ].map((item, i) => (
                      <div key={i} className="p-5 bg-white border border-gray-100 rounded-2xl shadow-sm hover:border-emerald-200 transition-colors">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-black text-gray-900">{item.company}</p>
                          <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md uppercase">{item.status}</span>
                        </div>
                        <p className="text-xs text-gray-500 font-medium">{item.period} • {item.detail}</p>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="space-y-4">
                  <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-100 pb-2">Technical Pulse Analysis</h4>
                  <div className="bg-gray-900 p-6 rounded-[32px] text-white shadow-xl relative overflow-hidden group">
                     <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform">
                        <Github className="w-20 h-20" />
                     </div>
                     <div className="relative z-10 space-y-4">
                        <div className="flex items-center space-x-3">
                           <Sparkles className="w-5 h-5 text-blue-400" />
                           <p className="text-sm font-black italic">Open Source Footprint</p>
                        </div>
                        <p className="text-xs text-gray-400 leading-relaxed">
                          Maintains 3 popular React utility libraries. Consistent 400+ contributions/year. Highly respected in the <span className="text-blue-400 font-bold italic">Cloud Engineering</span> cluster.
                        </p>
                        <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                           <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Skill Validity: 98%</span>
                           <ExternalLink className="w-3.5 h-3.5 text-gray-500" />
                        </div>
                     </div>
                  </div>
                </section>
              </div>

              {/* Risk & Opportunity Radar */}
              <section className="bg-blue-50/50 p-8 rounded-[40px] border border-blue-100/50">
                 <div className="flex items-center space-x-3 mb-6">
                    <AlertCircle className="w-5 h-5 text-blue-600" />
                    <h4 className="text-[11px] font-black text-gray-900 uppercase tracking-[0.2em]">Risk & Cultural Fit Radar</h4>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                       <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Attrition Risk</p>
                       <p className="text-lg font-black text-emerald-600 italic">Very Low</p>
                       <p className="text-[10px] text-gray-400 mt-1">Strong tenure history</p>
                    </div>
                    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                       <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Social Sentiment</p>
                       <p className="text-lg font-black text-blue-600 italic">Neutral+</p>
                       <p className="text-[10px] text-gray-400 mt-1">Thoughtful contributor</p>
                    </div>
                    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                       <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Legal/ID Check</p>
                       <p className="text-lg font-black text-emerald-600 italic">Clear</p>
                       <p className="text-[10px] text-gray-400 mt-1">Verified via Neural Port</p>
                    </div>
                 </div>
              </section>

              <div className="pt-6 border-t border-gray-50 flex items-center space-x-4">
                <button 
                  onClick={onClose}
                  className="flex-1 py-5 bg-gray-100 text-gray-500 rounded-[24px] font-black text-xs uppercase tracking-[0.2em] hover:bg-gray-200 transition-all active:scale-95"
                >
                   Close Report
                </button>
                <button 
                  className="flex-[2] py-5 bg-emerald-600 text-white rounded-[24px] font-black text-xs uppercase tracking-[0.2em] hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-600/30 flex items-center justify-center space-x-3 active:scale-95"
                >
                   <FileText className="w-4 h-4" />
                   <span>Download PDF Dossier</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BackgroundResearchModal;
