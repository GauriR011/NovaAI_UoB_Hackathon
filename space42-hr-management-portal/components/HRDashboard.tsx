
import React, { useState, useMemo } from 'react';
import { 
  Users, 
  CheckCircle2, 
  Clock, 
  TrendingUp, 
  MoreHorizontal,
  Mail,
  ExternalLink,
  ChevronRight,
  Filter,
  Search,
  X,
  FileText,
  Zap
} from 'lucide-react';
import { Candidate, CandidateStatus } from '../types';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area 
} from 'recharts';

interface HRDashboardProps {
  candidates: Candidate[];
  onSelectCandidate: (candidate: Candidate) => void;
}

const statsData = [
  { name: 'Jan', count: 400 },
  { name: 'Feb', count: 600 },
  { name: 'Mar', count: 550 },
  { name: 'Apr', count: 800 },
  { name: 'May', count: 950 },
];

const HRDashboard: React.FC<HRDashboardProps> = ({ candidates, onSelectCandidate }) => {
  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<CandidateStatus | 'ALL'>('ALL');
  const [roleFilter, setRoleFilter] = useState<string | 'ALL'>('ALL');
  const [dateFilter, setDateFilter] = useState<'ALL' | '7D' | '30D'>('ALL');

  // Derived data for filters
  const uniqueRoles = useMemo(() => {
    const roles = new Set(candidates.map(c => c.role));
    return Array.from(roles);
  }, [candidates]);

  // Filtering Logic
  const filteredCandidates = useMemo(() => {
    return candidates.filter(c => {
      const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            c.role.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
      const matchesRole = roleFilter === 'ALL' || c.role === roleFilter;
      
      let matchesDate = true;
      if (dateFilter !== 'ALL') {
        const appliedDate = new Date(c.appliedDate);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - appliedDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (dateFilter === '7D') matchesDate = diffDays <= 7;
        if (dateFilter === '30D') matchesDate = diffDays <= 30;
      }

      return matchesSearch && matchesStatus && matchesRole && matchesDate;
    });
  }, [candidates, searchTerm, statusFilter, roleFilter, dateFilter]);

  const stats = [
    { label: 'Total Applicants', value: '1,284', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50', trend: '+12%' },
    { label: 'Short-listed', value: '142', icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50', trend: '+8%' },
    { label: 'Interviews', value: '56', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', trend: '+24%' },
    { label: 'Acceptance Rate', value: '4.2%', icon: TrendingUp, color: 'text-indigo-600', bg: 'bg-indigo-50', trend: '-2%' },
  ];

  const resetFilters = () => {
    setSearchTerm('');
    setStatusFilter('ALL');
    setRoleFilter('ALL');
    setDateFilter('ALL');
  };

  const isFiltered = searchTerm !== '' || statusFilter !== 'ALL' || roleFilter !== 'ALL' || dateFilter !== 'ALL';

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className={`${stat.bg} p-2.5 rounded-xl`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <span className={`text-xs font-bold px-2 py-1 rounded-full ${stat.trend.startsWith('+') ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                {stat.trend}
              </span>
            </div>
            <h3 className="text-gray-500 text-sm font-medium tracking-tight">{stat.label}</h3>
            <p className="text-2xl font-bold mt-1 text-gray-900">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recruitment Trends Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-bold text-gray-900">Recruitment Trends</h3>
            <div className="flex items-center space-x-2">
               <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Last 6 months</span>
               <select className="text-xs bg-gray-50 border-none rounded-lg px-2 py-1 text-gray-600 focus:ring-0 cursor-pointer font-medium">
                 <option>All Departments</option>
                 <option>Engineering</option>
                 <option>Design</option>
               </select>
            </div>
          </div>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={statsData}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 500}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 500}} />
                <Tooltip 
                  contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontWeight: 600}}
                />
                <Area type="monotone" dataKey="count" stroke="#2563eb" strokeWidth={4} fillOpacity={1} fill="url(#colorCount)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Recommendations Panel */}
        <div className="bg-[#0f172a] p-6 rounded-3xl text-white shadow-xl relative overflow-hidden group border border-blue-500/10">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Zap className="w-32 h-32 text-blue-400" />
          </div>
          
          <div className="flex items-center space-x-2 mb-6 relative z-10">
            <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
              <TrendingUp className="w-4 h-4 text-blue-400" />
            </div>
            <h3 className="font-bold tracking-tight">AI Recommendations</h3>
          </div>

          <div className="space-y-4 relative z-10">
            <div className="bg-white/[0.03] p-5 rounded-2xl border border-white/10 hover:bg-white/[0.06] transition-all cursor-pointer group/card">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[10px] text-blue-400 font-bold uppercase tracking-[0.2em]">Critical Action</p>
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.5)]"></span>
              </div>
              <p className="text-sm font-medium leading-relaxed text-gray-200">
                3 short-listed candidates for <span className="text-blue-400 font-bold underline decoration-blue-500/30 underline-offset-4">Senior Frontend Role</span> haven't received interview invites.
              </p>
              <button className="mt-5 w-full bg-blue-600 hover:bg-blue-500 px-4 py-2.5 rounded-xl transition-all flex items-center justify-center space-x-2 font-bold text-xs shadow-lg shadow-blue-600/20 group-hover/card:scale-[1.02] active:scale-95">
                <span>Bulk Invite</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-white/[0.03] p-5 rounded-2xl border border-white/10">
              <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-[0.2em] mb-3">Success Metric</p>
              <p className="text-sm font-medium text-gray-400 leading-relaxed">
                Candidate matching accuracy improved by <span className="text-emerald-400 font-black">14.2%</span> this month using <span className="text-white">Space42 V2.5</span> model.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Section */}
      <div className="bg-gray-100/50 p-3 rounded-2xl border border-gray-200/50 flex flex-col lg:flex-row items-center gap-4">
        <div className="relative flex-1 w-full lg:w-auto group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 group-focus-within:text-blue-500 transition-colors" />
          <input 
            type="text" 
            placeholder="Search by candidate name, role or skill..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all shadow-sm placeholder:text-gray-400"
          />
        </div>
        
        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          <div className="flex items-center space-x-2 bg-white rounded-xl px-4 py-3 border border-gray-200 shadow-sm hover:border-gray-300 transition-colors">
            <Filter className="w-4 h-4 text-gray-400" />
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="text-xs font-bold bg-transparent border-none p-0 text-gray-600 focus:outline-none focus:ring-0 cursor-pointer uppercase tracking-wider"
            >
              <option value="ALL">All Statuses</option>
              {Object.values(CandidateStatus).map(status => (
                <option key={status} value={status}>{status.replace('_', ' ')}</option>
              ))}
            </select>
          </div>

          <div className="bg-white rounded-xl px-4 py-3 border border-gray-200 shadow-sm hover:border-gray-300 transition-colors">
            <select 
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="text-xs font-bold bg-transparent border-none p-0 text-gray-600 focus:outline-none focus:ring-0 cursor-pointer uppercase tracking-wider"
            >
              <option value="ALL">All Roles</option>
              {uniqueRoles.map(role => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
          </div>

          <div className="bg-white rounded-xl px-4 py-3 border border-gray-200 shadow-sm hover:border-gray-300 transition-colors">
            <select 
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as any)}
              className="text-xs font-bold bg-transparent border-none p-0 text-gray-600 focus:outline-none focus:ring-0 cursor-pointer uppercase tracking-wider"
            >
              <option value="ALL">Any Time</option>
              <option value="7D">Past Week</option>
              <option value="30D">Past Month</option>
            </select>
          </div>

          {isFiltered && (
            <button 
              onClick={resetFilters}
              className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-all shadow-sm border border-red-100 hover:scale-105 active:scale-95"
              title="Clear Filters"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Candidates Table Area */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden mb-8">
        <div className="p-8 border-b border-gray-50 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-gray-900 text-xl tracking-tight">Candidate Pipeline</h3>
            <p className="text-xs text-gray-400 mt-1 uppercase tracking-[0.2em] font-black">Showing {filteredCandidates.length} potential hires</p>
          </div>
          <button className="flex items-center space-x-2 text-xs font-black text-blue-600 hover:text-blue-700 uppercase tracking-widest bg-blue-50/50 px-4 py-2.5 rounded-xl transition-all border border-blue-100/50 shadow-sm">
            <span>Export CSV</span>
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>
        
        <div className="overflow-x-auto">
          {filteredCandidates.length > 0 ? (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/30 text-gray-400 text-[10px] font-bold uppercase tracking-[0.15em]">
                  <th className="px-8 py-5">Candidate</th>
                  <th className="px-8 py-5">Match Score</th>
                  <th className="px-8 py-5">Status</th>
                  <th className="px-8 py-5">Applied Date</th>
                  <th className="px-8 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredCandidates.map((c) => (
                  <tr 
                    key={c.id} 
                    onClick={() => onSelectCandidate(c)}
                    className="hover:bg-blue-50/30 transition-all group cursor-pointer"
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-center space-x-4">
                        <div className="relative">
                          <img src={c.avatar} className="w-12 h-12 rounded-2xl object-cover ring-2 ring-white shadow-sm transition-transform group-hover:scale-105" alt="" />
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full shadow-sm"></div>
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 text-base">{c.name}</p>
                          <p className="text-xs text-gray-500 font-medium tracking-tight mt-0.5">{c.role}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-20 bg-gray-100 h-2 rounded-full overflow-hidden shadow-inner">
                          <div 
                            className={`h-full rounded-full transition-all duration-1000 ${c.matchScore > 90 ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-blue-500 shadow-[0_0_8px_rgba(37,99,235,0.5)]'}`} 
                            style={{width: `${c.matchScore}%`}}
                          />
                        </div>
                        <span className={`text-sm font-black ${c.matchScore > 90 ? 'text-emerald-600' : 'text-blue-600'}`}>{c.matchScore}%</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`text-[10px] font-black uppercase px-3 py-1.5 rounded-xl tracking-[0.1em] ${
                        c.status === CandidateStatus.SHORTLISTED ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 
                        c.status === CandidateStatus.INTERVIEWING ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                        c.status === CandidateStatus.REJECTED ? 'bg-red-50 text-red-600 border border-red-100' :
                        c.status === CandidateStatus.OFFERED ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' :
                        'bg-blue-50 text-blue-600 border border-blue-100'
                      }`}>
                        {c.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-sm text-gray-500 font-semibold italic">
                      {new Date(c.appliedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-8 py-6 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                        <button className="p-2.5 bg-white hover:bg-blue-600 rounded-xl border border-gray-200 text-gray-400 hover:text-white transition-all shadow-sm active:scale-95" title="Quick Email">
                          <Mail className="w-4 h-4" />
                        </button>
                        <button className="p-2.5 bg-white hover:bg-blue-600 rounded-xl border border-gray-200 text-gray-400 hover:text-white transition-all shadow-sm active:scale-95" title="View CV">
                          <FileText className="w-4 h-4" />
                        </button>
                        <button className="p-2.5 bg-white hover:bg-gray-100 rounded-xl border border-gray-200 text-gray-400 hover:text-gray-900 transition-all shadow-sm active:scale-95">
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="py-28 flex flex-col items-center justify-center text-gray-400 space-y-6">
              <div className="bg-gray-50 p-10 rounded-full border border-gray-100 shadow-inner">
                <Users className="w-20 h-20 opacity-5" />
              </div>
              <div className="text-center">
                <p className="font-black text-gray-900 text-xl tracking-tight">No candidates found</p>
                <p className="text-sm text-gray-500 max-w-xs mt-2 leading-relaxed">Adjust your search or filter parameters to explore other areas of your talent pipeline.</p>
              </div>
              <button 
                onClick={resetFilters}
                className="mt-4 text-[10px] font-black uppercase tracking-[0.2em] bg-blue-600 text-white px-10 py-4 rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20 active:scale-95"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HRDashboard;
