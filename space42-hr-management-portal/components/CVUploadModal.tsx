
import React, { useState } from 'react';
import { X, Upload, FileText, CheckCircle2, Sparkles, AlertCircle, RefreshCw, ArrowRight } from 'lucide-react';

interface CVUploadModalProps {
  onClose: () => void;
  onSuccess: (candidate: any) => void;
}

const CVUploadModal: React.FC<CVUploadModalProps> = ({ onClose, onSuccess }) => {
  const [stage, setStage] = useState<'IDLE' | 'UPLOADING' | 'PARSING' | 'REVIEW'>('IDLE');
  const [extractedData, setExtractedData] = useState<any>(null);

  const simulateExtraction = () => {
    setStage('UPLOADING');
    setTimeout(() => {
      setStage('PARSING');
      setTimeout(() => {
        setExtractedData({
          name: 'Elena Rodriguez',
          role: 'Fullstack Engineer',
          email: 'elena.r@space42.tech',
          summary: 'Expert in orbital software systems and React. 8+ years experience.',
          matchScore: 94,
          aiInsights: ['Cloud Architecture expert', 'Orbital Mechanics background', 'Team Leader']
        });
        setStage('REVIEW');
      }, 2500);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-xl rounded-[40px] overflow-hidden flex flex-col shadow-2xl border border-white/20 scale-in-center">
        {/* Progress Header */}
        <div className="p-8 pb-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 p-2.5 rounded-2xl shadow-lg shadow-blue-600/20">
              <Sparkles className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl font-black text-gray-900 tracking-tight">AI CV Intelligence</h2>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-0.5">Automated Extraction Core</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        <div className="p-8">
          {stage === 'IDLE' && (
            <div 
              onClick={simulateExtraction}
              className="border-4 border-dashed border-gray-100 rounded-[32px] p-12 flex flex-col items-center justify-center space-y-4 hover:border-blue-200 hover:bg-blue-50/30 transition-all cursor-pointer group"
            >
              <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm border border-gray-100">
                <Upload className="w-8 h-8 text-gray-400 group-hover:text-blue-500" />
              </div>
              <div className="text-center">
                <p className="font-black text-gray-900 text-lg">Drop CV files here</p>
                <p className="text-sm text-gray-500 mt-1">Supports PDF, DOCX, TXT, and RTF formats</p>
              </div>
              <button className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-600/20 group-hover:bg-blue-700 transition-all">
                Select Files
              </button>
            </div>
          )}

          {(stage === 'UPLOADING' || stage === 'PARSING') && (
            <div className="py-12 flex flex-col items-center justify-center space-y-8">
              <div className="relative">
                <div className="w-24 h-24 border-4 border-gray-100 border-t-blue-600 rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <RefreshCw className="w-8 h-8 text-blue-600 animate-pulse" />
                </div>
              </div>
              <div className="text-center space-y-2">
                <p className="font-black text-gray-900 text-xl">
                  {stage === 'UPLOADING' ? 'Uploading CV...' : 'Extracting Insights...'}
                </p>
                <div className="flex items-center justify-center space-x-2">
                   <span className="text-xs font-bold text-blue-500 uppercase tracking-widest animate-pulse">Running Neural Parser V3.0</span>
                </div>
              </div>
            </div>
          )}

          {stage === 'REVIEW' && extractedData && (
            <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
              <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl flex items-start space-x-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5" />
                <div>
                  <p className="text-sm font-black text-emerald-900 uppercase tracking-tight">Extraction Successful</p>
                  <p className="text-xs text-emerald-700 mt-0.5">Information mapped with 99.2% confidence.</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100">
                   <div className="flex items-center justify-between mb-2">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Candidate Found</p>
                      <span className="text-xs font-black text-blue-600">{extractedData.matchScore}% Match</span>
                   </div>
                   <h3 className="text-lg font-black text-gray-900">{extractedData.name}</h3>
                   <p className="text-sm font-bold text-gray-500 mt-0.5">{extractedData.role}</p>
                   <p className="text-xs text-gray-600 mt-4 leading-relaxed bg-white p-3 rounded-xl border border-gray-100 italic">
                     "{extractedData.summary}"
                   </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {extractedData.aiInsights.map((tag: string, i: number) => (
                    <span key={i} className="text-[10px] font-black uppercase tracking-wider bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg border border-blue-100">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-3 pt-4">
                <button 
                  onClick={() => setStage('IDLE')}
                  className="flex-1 py-4 px-6 bg-gray-50 text-gray-500 font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-gray-100 transition-all border border-gray-100"
                >
                  Discard
                </button>
                <button 
                  onClick={() => {
                    onSuccess(extractedData);
                    onClose();
                  }}
                  className="flex-[2] py-4 px-6 bg-blue-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/30 flex items-center justify-center space-x-2"
                >
                  <span>Confirm & Add to Pipeline</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CVUploadModal;
