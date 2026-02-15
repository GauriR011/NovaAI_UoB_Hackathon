
import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Users, 
  Briefcase, 
  TrendingUp, 
  Clock, 
  ArrowRight,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Building2
} from 'lucide-react';
import { JobRole } from '../types';

const INITIAL_JOBS: JobRole[] = [
  { id: 'j1', title: 'Senior Frontend Engineer', department: 'Engineering', openings: 2, applicants: 45 },
  { id: 'j2', title: 'Product Designer', department: 'Design', openings: 1, applicants: 28 },
  { id: 'j3', title: 'Backend Architect', department: 'Engineering', openings: 1, applicants: 12 },
  { id: 'j4', title: 'HR Specialist', department: 'People Ops', openings: 1, applicants: 56 },
  { id: 'j5', title: 'DevOps Lead', department: 'Engineering', openings: 1, applicants: 8 },
];

const JobBoardsPage: React.FC = () => {
  const [jobs] = useState<JobRole[]>(INITIAL_JOBS);
  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState<string | 'ALL'>('ALL');

  const departments = useMemo(() => {
    const depts = new Set(jobs.map(j => j.department));
    return Array.from(depts);
  }, [jobs]);

  const filteredJobs = useMemo(() => {
    return jobs.filter(j => {
      const matchesSearch = j.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDept = deptFilter === 'ALL' || j.department === deptFilter;
      return matchesSearch && matchesDept;
    });
  }, [jobs, searchTerm, deptFilter]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">Active Openings</h2>
          <p className="text-gray-500 font-medium mt-1">Configure and manage your recruitment pipeline across all sectors.</p>
        </div>
        <button className="flex items-center space-x-2 px-6 py-4 bg-blue-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20 active:scale-95">
          <Plus className="w-4 h-4" />
          <span>Create New Listing</span>
        </button>
      </div>

      {/* Quick Insights Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#0f172a] p-6 rounded-[32px] text-white flex items-center justify-between border border-blue-500/10 shadow-lg group">
          <div>
            <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Health Score</p>
            <p className="text-2xl font-black italic">Excellent</p>
          </div>
          <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center border border-blue-500/30 group-hover:scale-110 transition-transform">
            <TrendingUp className="w-6 h-6 text-blue-400" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm flex items-center justify-between group">
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Avg. Time-to-Hire</p>
            <p className="text-2xl font-black text-gray-900 italic">18 Days</p>
          </div>
          <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center border border-gray-100 group-hover:scale-110 transition-transform">
            <Clock className="w-6 h-6 text-gray-400" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm flex items-center justify-between group">
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Budget Used</p>
            <p className="text-2xl font-black text-gray-900 italic">64%</p>
          </div>
          <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center border border-gray-100 group-hover:scale-110 transition-transform">
            <Building2 className="w-6 h-6 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Control Strip */}
      <div className="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-1 w-full group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 group-focus-within:text-blue-500 transition-colors" />
          <input 
            type="text" 
            placeholder="Search by job title..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
          />
        </div>
        <div className="flex items-center space-x-2 w-full md:w-auto">
          <div className="flex items-center space-x-2 bg-gray-50 px-4 py-3 rounded-xl border border-gray-100 shadow-sm flex-1 md:flex-none">
            <Filter className="w-4 h-4 text-gray-400" />
            <select 
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="text-xs font-black uppercase tracking-widest bg-transparent border-none p-0 text-gray-600 focus:ring-0 cursor-pointer"
            >
              <option value="ALL">All Depts</option>
              {departments.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Jobs Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredJobs.map((job) => (
          <div key={job.id} className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group flex flex-col">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center border border-blue-100 transition-colors group-hover:bg-blue-600 group-hover:border-blue-700">
                  <Briefcase className="w-6 h-6 text-blue-600 group-hover:text-white" />
                </div>
                <div>
                  <h3 className="font-black text-gray-900 text-lg group-hover:text-blue-600 transition-colors">{job.title}</h3>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-0.5">{job.department}</p>
                </div>
              </div>
              <button className="p-2 hover:bg-gray-50 rounded-xl transition-colors">
                <MoreHorizontal className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100 group-hover:bg-white transition-colors">
                <div className="flex items-center space-x-2 mb-1">
                  <Users className="w-3.5 h-3.5 text-gray-400" />
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Applicants</span>
                </div>
                <p className="text-xl font-black text-gray-900 italic">{job.applicants}</p>
              </div>
              <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100 group-hover:bg-white transition-colors">
                <div className="flex items-center space-x-2 mb-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-gray-400" />
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Openings</span>
                </div>
                <p className="text-xl font-black text-gray-900 italic">{job.openings}</p>
              </div>
            </div>

            <div className="mt-auto pt-6 border-t border-gray-50 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Active Hiring</span>
              </div>
              
              <button className="flex items-center space-x-2 text-blue-600 font-black text-xs uppercase tracking-widest hover:translate-x-1 transition-transform">
                <span>View Pipeline</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* AI Insight Badge (Conditional Mock) */}
            {job.applicants > 40 && (
              <div className="mt-4 p-3 bg-amber-50 rounded-xl border border-amber-100 flex items-center space-x-3 group-hover:bg-amber-100 transition-colors">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <p className="text-[10px] font-bold text-amber-800 leading-tight">
                  High volume detected. AI suggests priority shortlisting for this role.
                </p>
              </div>
            )}
            {job.applicants < 10 && (
              <div className="mt-4 p-3 bg-blue-50 rounded-xl border border-blue-100 flex items-center space-x-3 group-hover:bg-blue-100 transition-colors">
                <Zap className="w-4 h-4 text-blue-600" />
                <p className="text-[10px] font-bold text-blue-800 leading-tight">
                  Sourcing needed. AI recommends boosting on LinkedIn Space & Orbital.
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default JobBoardsPage;
