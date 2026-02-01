
import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Upload, 
  FileText, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Mail, 
  ExternalLink,
  ChevronRight,
  Layers,
  List,
  Sparkles,
  Zap,
  CheckCircle2,
  Clock,
  ArrowRight
} from 'lucide-react';
import { Candidate, CandidateStatus } from '../types';

interface CandidatesPageProps {
  candidates: Candidate[];
  onSelectCandidate: (candidate: Candidate) => void;
  onOpenUpload: () => void;
}

const CandidatesPage: React.FC<CandidatesPageProps> = ({ candidates, onSelectCandidate, onOpenUpload }) => {
  const [viewType, setViewType] = useState<'LIST' | 'PIPELINE'>('LIST');
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string | 'ALL'>('ALL');

  const uniqueRoles = useMemo(() => {
    const roles = new Set(candidates.map(c => c.role));
    return Array.from(roles);
  }, [candidates]);

  const filteredCandidates = useMemo(() => {
    return candidates.filter(c => {
      const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            c.role.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = roleFilter === 'ALL' || c.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [candidates, searchTerm, roleFilter]);

  // Grouping for Pipeline View
  const pipelineGroups = useMemo(() => {
    const groups: Record<CandidateStatus, Candidate[]> = {
      [CandidateStatus.APPLIED]: [],
      [CandidateStatus.SHORTLISTED]: [],
      [CandidateStatus.INTERVIEWING]: [],
      [CandidateStatus.OFFERED]: [],
      [CandidateStatus.REJECTED]: [],
      [CandidateStatus.ONBOARDING]: []
    };
    filteredCandidates.forEach(c => groups[c.status].push(c));
    return groups;
  }, [filteredCandidates]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">Talent Pipeline</h2>
          <p className="text-gray-500 font-medium mt-1">Manage and track your active candidate pool with AI-driven insights.</p>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={onOpenUpload}
            className="flex items-center space-x-2 px-6 py-3 bg-white border border-gray-200 text-gray-700 font-bold text-sm rounded-2xl hover:bg-gray-50 transition-all shadow-sm"
          >
            <Upload className="w-4 h-4" />
            <span>Extract CV</span>
          </button>
          <button className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white font-bold text-sm rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20">
            <Plus className="w-4 h-4" />
            <span>Add Candidate</span>
          </button>
        </div>
      </div>

      {/* Control Bar */}
      <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex flex-col lg:flex-row items-center justify-between gap-4">
        <div className="flex flex-1 items-center space-x-4 w-full lg:w-auto">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 group-focus-within:text-blue-500 transition-colors" />
            <input 
              type="text" 
              placeholder="Search by name, role, or skills..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
            />
          </div>
          <div className="flex items-center bg-gray-50 border border-gray-100 rounded-2xl p-1">
            <button 
              onClick={() => setViewType('LIST')}
              className={`p-2 rounded-xl transition-all ${viewType === 'LIST' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <List className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setViewType('PIPELINE')}
              className={`p-2 rounded-xl transition-all ${viewType === 'PIPELINE' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <Layers className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-3 w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0">
          <select 
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="text-xs font-black uppercase tracking-widest bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-gray-600 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all appearance-none cursor-pointer"
          >
            <option value="ALL">All Roles</option>
            {uniqueRoles.map(role => <option key={role} value={role}>{role}</option>)}
          </select>
          <button className="flex items-center space-x-2 px-4 py-3 bg-gray-50 border border-gray-100 text-xs font-black uppercase tracking-widest rounded-xl text-gray-500 hover:bg-gray-100 transition-all">
            <Filter className="w-4 h-4" />
            <span>Advanced Filters</span>
          </button>
        </div>
      </div>

      {/* Main View Area */}
      {viewType === 'LIST' ? (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 text-gray-400 text-[10px] font-black uppercase tracking-[0.2em]">
                <th className="px-8 py-5">Candidate Info</th>
                <th className="px-8 py-5">AI Fit Score</th>
                <th className="px-8 py-5">Stage</th>
                <th className="px-8 py-5">AI Insights</th>
                <th className="px-8 py-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredCandidates.map(c => (
                <tr 
                  key={c.id} 
                  onClick={() => onSelectCandidate(c)}
                  className="hover:bg-blue-50/20 transition-all cursor-pointer group"
                >
                  <td className="px-8 py-6">
                    <div className="flex items-center space-x-4">
                      <img src={c.avatar} className="w-12 h-12 rounded-2xl object-cover ring-2 ring-white shadow-sm" alt="" />
                      <div>
                        <p className="font-bold text-gray-900 text-base">{c.name}</p>
                        <p className="text-xs text-gray-500 font-medium mt-0.5">{c.role}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-20 bg-gray-100 h-2 rounded-full overflow-hidden shadow-inner">
                        <div 
                          className={`h-full rounded-full transition-all duration-1000 ${c.matchScore > 90 ? 'bg-emerald-500' : 'bg-blue-500'}`} 
                          style={{width: `${c.matchScore}%`}}
                        />
                      </div>
                      <span className={`text-sm font-black ${c.matchScore > 90 ? 'text-emerald-600' : 'text-blue-600'}`}>{c.matchScore}%</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`text-[10px] font-black uppercase px-3 py-1.5 rounded-xl tracking-wider ${
                      c.status === CandidateStatus.SHORTLISTED ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 
                      c.status === CandidateStatus.INTERVIEWING ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                      c.status === CandidateStatus.REJECTED ? 'bg-red-50 text-red-600 border border-red-100' :
                      'bg-blue-50 text-blue-600 border border-blue-100'
                    }`}>
                      {c.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-wrap gap-2 max-w-[300px]">
                      {c.aiInsights.slice(0, 2).map((insight, i) => (
                        <span key={i} className="text-[10px] font-bold text-gray-600 bg-gray-100 px-2 py-1 rounded-lg">
                          {insight}
                        </span>
                      ))}
                      {c.aiInsights.length > 2 && (
                        <span className="text-[10px] font-bold text-blue-500">+{c.aiInsights.length - 2} more</span>
                      )}
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                      <button className="p-2.5 bg-white hover:bg-blue-600 rounded-xl border border-gray-200 text-gray-400 hover:text-white transition-all shadow-sm">
                        <Mail className="w-4 h-4" />
                      </button>
                      <button className="p-2.5 bg-white hover:bg-gray-100 rounded-xl border border-gray-200 text-gray-400 hover:text-gray-900 transition-all shadow-sm">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex space-x-6 overflow-x-auto pb-6 scrollbar-hide">
          {/* Use type assertion to explicitly type the Object.entries result for better inference */}
          {(Object.entries(pipelineGroups) as [string, Candidate[]][]).map(([status, groupCandidates]) => (
            <div key={status} className="flex-shrink-0 w-80 flex flex-col space-y-4">
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center space-x-2">
                  <h4 className="text-xs font-black uppercase tracking-widest text-gray-500">{status.replace('_', ' ')}</h4>
                  {/* Fixed Property 'length' does not exist on type 'unknown' by casting Object.entries above */}
                  <span className="bg-gray-100 text-gray-500 text-[10px] font-black px-2 py-0.5 rounded-full">{groupCandidates.length}</span>
                </div>
                <button className="p-1 hover:bg-gray-100 rounded-lg text-gray-400">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <div className="flex-1 space-y-4">
                {/* Fixed Property 'map' does not exist on type 'unknown' */}
                {groupCandidates.map(c => (
                  <div 
                    key={c.id}
                    onClick={() => onSelectCandidate(c)}
                    className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all cursor-pointer group"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <img src={c.avatar} className="w-10 h-10 rounded-xl object-cover ring-2 ring-white" alt="" />
                        <div>
                          <p className="font-bold text-sm text-gray-900">{c.name}</p>
                          <p className="text-[10px] text-gray-500 font-medium tracking-tight mt-0.5">{c.role}</p>
                        </div>
                      </div>
                      <div className={`px-2 py-1 rounded-lg text-[10px] font-black ${c.matchScore > 90 ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>
                        {c.matchScore}%
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {c.aiInsights.map((insight, i) => (
                        <span key={i} className="text-[9px] font-bold text-gray-500 bg-gray-50 border border-gray-100 px-2 py-0.5 rounded-md">
                          {insight}
                        </span>
                      ))}
                    </div>
                    <div className="pt-4 border-t border-gray-50 flex items-center justify-between text-gray-400">
                      <div className="flex items-center space-x-2 text-[10px] font-bold">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Applied {new Date(c.appliedDate).toLocaleDateString()}</span>
                      </div>
                      <button className="text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
                {/* Fixed Property 'length' does not exist on type 'unknown' */}
                {groupCandidates.length === 0 && (
                  <div className="h-24 border-2 border-dashed border-gray-100 rounded-3xl flex items-center justify-center text-gray-300 text-xs font-medium italic">
                    No candidates in this stage
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CandidatesPage;
