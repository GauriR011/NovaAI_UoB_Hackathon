
import React, { useState } from 'react';
import { X, Sparkles, Send, RefreshCw, MessageSquare, Copy, Check } from 'lucide-react';
import { Candidate } from '../types';

interface InterviewInviteModalProps {
  candidate: Candidate;
  onClose: () => void;
}

const InterviewInviteModal: React.FC<InterviewInviteModalProps> = ({ candidate, onClose }) => {
  const [tone, setTone] = useState<'PROFESSIONAL' | 'ENTHUSIASTIC' | 'CONCISE'>('ENTHUSIASTIC');
  const [draft, setDraft] = useState('');
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const generateDraft = () => {
    setGenerating(true);
    // Simulation
    setTimeout(() => {
      const texts = {
        PROFESSIONAL: `Dear ${candidate.name},\n\nThank you for your application to the ${candidate.role} position at Space42. We were impressed by your background in ${candidate.aiInsights[0]} and would like to invite you for a preliminary technical interview.\n\nPlease let us know your availability for next week.`,
        ENTHUSIASTIC: `Hi ${candidate.name}! 👋\n\nOur team just reviewed your profile and we're absolutely excited about your experience with ${candidate.aiInsights[0]}! Your background at OrbitScale perfectly aligns with our current orbital mission.\n\nWe'd love to hop on a call and show you what we're building. When works for you?`,
        CONCISE: `${candidate.name}, your profile stands out. We'd like to schedule an interview for the ${candidate.role} role. \n\nAvailability link below:`
      };
      setDraft(texts[tone]);
      setGenerating(false);
    }, 1200);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(draft);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-2xl rounded-[40px] overflow-hidden flex flex-col shadow-2xl scale-in-center border border-white/20">
        <div className="p-8 pb-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 p-2.5 rounded-2xl shadow-lg shadow-blue-600/20">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-black text-gray-900 tracking-tight">AI Invite Draft</h2>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Personalized Outreach Core</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        <div className="p-8 space-y-6">
          <div className="flex items-center space-x-4">
            <img src={candidate.avatar} className="w-12 h-12 rounded-2xl object-cover" alt="" />
            <div>
              <p className="text-sm font-black text-gray-900">{candidate.name}</p>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{candidate.role}</p>
            </div>
          </div>

          <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Draft Configuration</p>
            <div className="flex space-x-2">
              {(['PROFESSIONAL', 'ENTHUSIASTIC', 'CONCISE'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setTone(t)}
                  className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${tone === t ? 'bg-blue-600 text-white shadow-lg' : 'bg-white text-gray-400 border border-gray-100 hover:border-blue-200'}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="relative group">
            <textarea 
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Configure tone and click generate..."
              className="w-full h-48 bg-gray-50 border border-gray-100 rounded-3xl p-6 text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all resize-none font-medium text-gray-700"
            />
            {!draft && !generating && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                 <button className="bg-white px-6 py-3 rounded-2xl shadow-xl border border-gray-100 text-blue-600 font-black text-[10px] uppercase tracking-widest flex items-center space-x-2">
                   <Sparkles className="w-4 h-4" />
                   <span>Start Drafting</span>
                 </button>
              </div>
            )}
            {generating && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-sm rounded-3xl">
                <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
              </div>
            )}
          </div>

          <div className="flex items-center space-x-4">
            <button 
              onClick={generateDraft}
              className="flex-1 py-4 bg-gray-100 text-gray-600 font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-gray-200 transition-all flex items-center justify-center space-x-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Regenerate</span>
            </button>
            <button 
              onClick={handleCopy}
              className={`flex-1 py-4 font-black text-[10px] uppercase tracking-widest rounded-2xl transition-all flex items-center justify-center space-x-2 ${copied ? 'bg-emerald-600 text-white' : 'bg-[#0a0f1e] text-white hover:bg-blue-600 shadow-xl'}`}
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied!' : 'Copy to Clipboard'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewInviteModal;
