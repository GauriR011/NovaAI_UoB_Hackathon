
import React from 'react';
import { X, Sparkles, AlertCircle, ShieldCheck, CheckCircle2, TrendingUp, Info, Play, MessageSquare } from 'lucide-react';
import { Candidate } from '../types';

interface InterviewAnalysisModalProps {
  candidate: Candidate;
  onClose: () => void;
}

const InterviewAnalysisModal: React.FC<InterviewAnalysisModalProps> = ({ candidate, onClose }) => {
  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-[48px] overflow-hidden flex flex-col shadow-2xl border border-gray-100 scale-in-center">
        {/* Header */}
        <div className="p-10 pb-6 border-b border-gray-50 flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="relative">
              <img src={candidate.avatar} className="w-20 h-20 rounded-[32px] object-cover ring-4 ring-gray-50" alt="" />
              <div className="absolute -bottom-2 -right-2 bg-blue-600 p-2 rounded-2xl border-4 border-white shadow-lg">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
            </div>
            <div>
              <h2 className="text-3xl font-black text-gray-900 tracking-tight">{candidate.name}</h2>
              <div className="flex items-center space-x-3 mt-1">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{candidate.role}</p>
                <span className="w-1.5 h-1.5 bg-gray-300 rounded-full"></span>
                <p className="text-xs font-black text-blue-600 uppercase tracking-widest">AI Video Audit Complete</p>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-4 hover:bg-gray-50 rounded-full transition-colors">
            <X className="w-8 h-8 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-10 space-y-10 scrollbar-hide">
          {/* Top Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <section>
                <div className="flex items-center space-x-2 mb-6">
                  <Play className="w-5 h-5 text-blue-600 fill-blue-600" />
                  <h3 className="text-[10px] font-black text-gray-900 uppercase tracking-[0.2em]">Core Findings & Reasoning</h3>
                </div>
                <div className="bg-gray-50 p-8 rounded-[40px] border border-gray-100 relative">
                  <p className="text-gray-700 leading-relaxed font-medium italic mb-6">
                    "The candidate demonstrated exceptional articulation of technical constraints in orbital telemetry. AI detected high confidence intervals during discussion of React architecture but noted slight hesitation during legacy system migration queries."
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-2xl border border-gray-100 flex items-center space-x-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      <span className="text-xs font-bold text-gray-700">Strong Problem Solving Logic</span>
                    </div>
                    <div className="bg-white p-4 rounded-2xl border border-gray-100 flex items-center space-x-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      <span className="text-xs font-bold text-gray-700">Excellent Communication Sentiment</span>
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <div className="flex items-center space-x-2 mb-6">
                  <TrendingUp className="w-5 h-5 text-indigo-600" />
                  <h3 className="text-[10px] font-black text-gray-900 uppercase tracking-[0.2em]">Detailed Competency Rubric</h3>
                </div>
                <div className="space-y-4">
                  {[
                    { label: 'Technical Depth', score: 95 },
                    { label: 'Cultural Alignment', score: 88 },
                    { label: 'Emotional Intelligence', score: 92 },
                    { label: 'Domain Expertise', score: 84 }
                  ].map(stat => (
                    <div key={stat.label} className="bg-white border border-gray-100 p-5 rounded-2xl flex items-center justify-between group hover:border-blue-200 transition-colors">
                      <span className="text-sm font-bold text-gray-600">{stat.label}</span>
                      <div className="flex items-center space-x-4">
                        <div className="w-32 h-2 bg-gray-50 rounded-full overflow-hidden">
                           <div className="h-full bg-blue-600 group-hover:bg-blue-500 transition-all" style={{width: `${stat.score}%`}}></div>
                        </div>
                        <span className="text-sm font-black text-gray-900">{stat.score}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <div className="space-y-8">
              <div className="bg-[#0a0f1e] p-8 rounded-[40px] text-white shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                  <ShieldCheck className="w-20 h-20" />
                </div>
                <h3 className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-6">Bias Audit Report</h3>
                <div className="space-y-4">
                   <div className="flex items-center space-x-3">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <p className="text-xs font-medium text-gray-400">Gender bias check: 0.0% variance</p>
                   </div>
                   <div className="flex items-center space-x-3">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <p className="text-xs font-medium text-gray-400">Ageism check: 0.0% variance</p>
                   </div>
                </div>
                <div className="mt-8 pt-6 border-t border-white/10">
                   <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Final Recommendation</p>
                   <p className="text-2xl font-black italic text-emerald-400 uppercase tracking-tight">Strong Hire</p>
                </div>
              </div>

              <div className="bg-amber-50 p-6 rounded-[32px] border border-amber-100 flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-amber-600 mt-1" />
                <p className="text-[11px] text-amber-900 font-bold leading-relaxed italic">
                  "Candidate mentioned working with legacy COBOL systems briefly. AI recommends a short deep-dive on modern cloud migration during the final human-led round."
                </p>
              </div>

              <div className="space-y-2">
                 <button className="w-full py-4 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20">
                   Move to Final Human Round
                 </button>
                 <button className="w-full py-4 bg-white border border-gray-200 text-gray-500 text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-gray-50 transition-all">
                   Share Analysis with Team
                 </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewAnalysisModal;
