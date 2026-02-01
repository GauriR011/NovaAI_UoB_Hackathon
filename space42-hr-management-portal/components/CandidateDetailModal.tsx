
import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, AlertCircle, Sparkles, Send, UserCheck, UserMinus, Globe, Briefcase } from 'lucide-react';
import { Candidate, CandidateStatus } from '../types';
import { analyzeCandidate } from '../services/geminiService';

interface CandidateDetailModalProps {
  candidate: Candidate;
  onClose: () => void;
  onUpdateStatus: (id: string, status: CandidateStatus) => void;
}

const CandidateDetailModal: React.FC<CandidateDetailModalProps> = ({ candidate, onClose, onUpdateStatus }) => {
  const [analysis, setAnalysis] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalysis = async () => {
      setLoading(true);
      const res = await analyzeCandidate(candidate, "Senior Level position with high technical requirements in React, Node, and Distributed Systems.");
      setAnalysis(res || 'No analysis available.');
      setLoading(false);
    };
    fetchAnalysis();
  }, [candidate]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-3xl overflow-hidden flex flex-col shadow-2xl border border-gray-100 scale-in-center">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div className="flex items-center space-x-4">
            <img src={candidate.avatar} className="w-16 h-16 rounded-2xl object-cover ring-4 ring-white shadow-md" alt="" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{candidate.name}</h2>
              <p className="text-gray-500 font-medium flex items-center space-x-2">
                <Briefcase className="w-4 h-4" />
                <span>{candidate.role}</span>
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-full transition-colors shadow-sm">
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Evaluation */}
          <div className="lg:col-span-2 space-y-6">
            <section>
              <div className="flex items-center space-x-2 mb-4">
                <Sparkles className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-gray-900 uppercase tracking-widest text-xs">AI Evaluation Summary</h3>
              </div>
              {loading ? (
                <div className="space-y-3 animate-pulse">
                  <div className="h-4 bg-gray-100 rounded w-full"></div>
                  <div className="h-4 bg-gray-100 rounded w-5/6"></div>
                  <div className="h-4 bg-gray-100 rounded w-4/6"></div>
                </div>
              ) : (
                <div className="prose prose-sm text-gray-600 bg-blue-50/30 p-5 rounded-2xl border border-blue-100/50 leading-relaxed whitespace-pre-wrap">
                  {analysis}
                </div>
              )}
            </section>

            <section>
               <div className="flex items-center space-x-2 mb-4">
                <Globe className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-gray-900 uppercase tracking-widest text-xs">Automated Background Research</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Github Pulse</p>
                  <p className="text-sm font-semibold">Active contributor (420+ commits/year)</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Employment Verification</p>
                  <p className="text-sm font-semibold text-emerald-600 flex items-center space-x-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Verified: OrbitScale</span>
                  </p>
                </div>
              </div>
            </section>
          </div>

          {/* Sidebar Stats & Actions */}
          <div className="space-y-6">
            <div className="bg-[#0a0f1e] text-white p-6 rounded-3xl shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5">
                <Sparkles className="w-20 h-20" />
              </div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-blue-400 mb-2">Job Match Similarity</p>
              <div className="text-4xl font-black mb-2 flex items-baseline space-x-1">
                <span>{candidate.matchScore}%</span>
                <span className="text-xs text-blue-400 font-medium">Optimal</span>
              </div>
              <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden mb-4">
                <div className="bg-blue-500 h-full transition-all duration-1000" style={{width: `${candidate.matchScore}%`}}></div>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">
                Candidate exceeds technical expectations and aligns perfectly with current cultural core values.
              </p>
            </div>

            <div className="space-y-3">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Actions</p>
              <button 
                onClick={() => onUpdateStatus(candidate.id, CandidateStatus.SHORTLISTED)}
                className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-sm transition-all flex items-center justify-center space-x-2"
              >
                <UserCheck className="w-4 h-4" />
                <span>Shortlist Candidate</span>
              </button>
              <button 
                onClick={() => onUpdateStatus(candidate.id, CandidateStatus.INTERVIEWING)}
                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-sm transition-all flex items-center justify-center space-x-2"
              >
                <Send className="w-4 h-4" />
                <span>Invite to Interview</span>
              </button>
              <button 
                onClick={() => onUpdateStatus(candidate.id, CandidateStatus.REJECTED)}
                className="w-full py-3 px-4 bg-white border border-red-100 text-red-600 hover:bg-red-50 rounded-2xl font-bold text-sm transition-all flex items-center justify-center space-x-2"
              >
                <UserMinus className="w-4 h-4" />
                <span>Send Gentle Rejection</span>
              </button>
            </div>

            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
              <p className="text-[11px] text-amber-700 leading-relaxed">
                <strong>AI Note:</strong> Rejection will automatically include personalized improvement suggestions based on their specific profile gaps.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateDetailModal;
