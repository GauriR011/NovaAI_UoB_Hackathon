
import React, { useState } from 'react';
import { 
  Database, 
  Upload, 
  Download, 
  RefreshCw, 
  Search, 
  CheckCircle2, 
  Clock, 
  FileText, 
  Users, 
  Briefcase, 
  DollarSign, 
  Building, 
  MessageSquare,
  ChevronRight,
  MoreHorizontal
} from 'lucide-react';

const DataManagementPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'IMPORT' | 'EXPORT' | 'SYNC'>('IMPORT');
  const [selectedType, setSelectedType] = useState<string | null>(null);

  const dataTypes = [
    { id: 'candidates', label: 'Candidates', desc: 'Sync candidate profiles, CVs, and application history.', icon: Users },
    { id: 'jobs', label: 'Job Roles', desc: 'Manage job descriptions, requirements, and board listings.', icon: Briefcase },
    { id: 'financial', label: 'Budgeting', desc: 'Hiring budgets, referral bonuses, and agency fees.', icon: DollarSign },
    { id: 'workspace', label: 'Workspace', desc: 'Office locations, interview rooms, and equipment.', icon: Building },
    { id: 'channels', label: 'Sourcing', desc: 'Job board connections, social media, and CRM data.', icon: RefreshCw },
    { id: 'feedback', label: 'Feedback', desc: 'Interview reviews, survey responses, and sentiment data.', icon: MessageSquare },
  ];

  const recentImports = [
    { name: 'senior_frontend_candidates.csv', type: 'Candidates', status: 'Completed', records: 124, date: '2024-05-20' },
    { name: 'q3_hiring_budget.xlsx', type: 'Financial', status: 'Completed', records: 42, date: '2024-05-19' },
    { name: 'interview_room_availability.json', type: 'Workspace', status: 'Processing', records: 15, date: '2024-05-21' },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">Data Management</h2>
          <p className="text-gray-500 font-medium mt-1">Import, export, and sync your workspace recruitment data.</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="px-5 py-3 bg-white border border-gray-100 rounded-2xl text-xs font-black uppercase tracking-widest text-gray-500 hover:bg-gray-50 transition-all shadow-sm flex items-center space-x-2">
            <Clock className="w-4 h-4" />
            <span>Import History</span>
          </button>
          <button className="px-5 py-3 bg-blue-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 flex items-center space-x-2">
            <Upload className="w-4 h-4" />
            <span>New Import</span>
          </button>
        </div>
      </div>

      {/* Main Tab Navigation - Pill Style */}
      <div className="bg-white p-2 rounded-2xl border border-gray-100 shadow-sm flex items-center space-x-2 w-fit">
        <button 
          onClick={() => setActiveTab('IMPORT')}
          className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center space-x-2 ${activeTab === 'IMPORT' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600'}`}
        >
          <Upload className="w-4 h-4" />
          <span>Data Import</span>
        </button>
        <button 
          onClick={() => setActiveTab('EXPORT')}
          className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center space-x-2 ${activeTab === 'EXPORT' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600'}`}
        >
          <Download className="w-4 h-4" />
          <span>Data Export</span>
        </button>
        <button 
          onClick={() => setActiveTab('SYNC')}
          className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center space-x-2 ${activeTab === 'SYNC' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600'}`}
        >
          <RefreshCw className="w-4 h-4" />
          <span>Data Sync</span>
        </button>
      </div>

      {activeTab === 'IMPORT' && (
        <div className="space-y-12 animate-in fade-in duration-500">
          {/* Select Data Type Section */}
          <section>
            <h3 className="text-sm font-black text-gray-400 uppercase tracking-[0.2em] mb-6 px-1">Select Data Type</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {dataTypes.map((type) => {
                const Icon = type.icon;
                const isSelected = selectedType === type.id;
                return (
                  <button 
                    key={type.id}
                    onClick={() => setSelectedType(type.id)}
                    className={`text-left p-6 rounded-[32px] border transition-all flex items-start space-x-4 group ${
                      isSelected 
                        ? 'bg-blue-600 border-blue-600 text-white shadow-xl shadow-blue-600/20 ring-4 ring-blue-500/10' 
                        : 'bg-white border-gray-100 hover:border-blue-200 hover:shadow-md'
                    }`}
                  >
                    <div className={`p-3 rounded-2xl flex-shrink-0 transition-all ${
                      isSelected ? 'bg-white/10' : 'bg-gray-50 group-hover:bg-blue-50'
                    }`}>
                      <Icon className={`w-6 h-6 ${isSelected ? 'text-white' : 'text-gray-400 group-hover:text-blue-600'}`} />
                    </div>
                    <div>
                      <h4 className="font-black text-lg tracking-tight leading-none mb-2">{type.label}</h4>
                      <p className={`text-xs font-medium leading-relaxed ${isSelected ? 'text-blue-100' : 'text-gray-500'}`}>
                        {type.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Upload Section */}
          <section>
            <h3 className="text-sm font-black text-gray-400 uppercase tracking-[0.2em] mb-6 px-1">Upload Data Files</h3>
            <div className="bg-white border-2 border-dashed border-gray-100 rounded-[48px] p-20 flex flex-col items-center justify-center text-center space-y-6 hover:border-blue-200 hover:bg-blue-50/20 transition-all cursor-pointer group">
              <div className="w-24 h-24 bg-gray-50 rounded-[32px] flex items-center justify-center shadow-sm group-hover:scale-110 group-hover:bg-white transition-all">
                <Upload className="w-10 h-10 text-gray-300 group-hover:text-blue-600" />
              </div>
              <div className="max-w-md mx-auto">
                <p className="text-xl font-black text-gray-900 tracking-tight italic">Drop files here or click to browse</p>
                <p className="text-sm text-gray-500 font-medium mt-2 leading-relaxed">
                  Supported formats: <span className="text-blue-600 font-bold uppercase tracking-wider">CSV, XLSX, JSON</span> (Max 50MB per file)
                </p>
              </div>
              <button className="bg-blue-600 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-blue-600/20 hover:bg-blue-700 active:scale-95 transition-all">
                Choose Files
              </button>
            </div>
          </section>

          {/* Recent Imports Table */}
          <section>
            <div className="flex items-center justify-between mb-6 px-1">
              <h3 className="text-sm font-black text-gray-400 uppercase tracking-[0.2em]">Recent Imports</h3>
              <button className="text-xs font-black text-blue-600 uppercase tracking-widest flex items-center space-x-2">
                <span>Refresh</span>
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50/50 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    <th className="px-8 py-5">File Name</th>
                    <th className="px-8 py-5">Data Type</th>
                    <th className="px-8 py-5">Status</th>
                    <th className="px-8 py-5">Records</th>
                    <th className="px-8 py-5">Date</th>
                    <th className="px-8 py-5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {recentImports.map((item, i) => (
                    <tr key={i} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-8 py-5">
                        <div className="flex items-center space-x-3">
                          <FileText className="w-4 h-4 text-gray-300" />
                          <span className="text-sm font-bold text-gray-900">{item.name}</span>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <span className="text-xs font-black text-gray-400 uppercase tracking-widest bg-gray-100 px-3 py-1 rounded-lg">
                          {item.type}
                        </span>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center space-x-2">
                          <div className={`w-2 h-2 rounded-full ${item.status === 'Completed' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-blue-500 animate-pulse'}`}></div>
                          <span className={`text-[10px] font-black uppercase tracking-widest ${item.status === 'Completed' ? 'text-emerald-600' : 'text-blue-600'}`}>
                            {item.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <span className="text-sm font-black text-gray-900 italic">{item.records.toLocaleString()}</span>
                      </td>
                      <td className="px-8 py-5">
                        <span className="text-xs font-medium text-gray-400">{item.date}</span>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <button className="p-2 text-gray-300 hover:text-gray-900 transition-colors">
                          <MoreHorizontal className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}

      {(activeTab === 'EXPORT' || activeTab === 'SYNC') && (
        <div className="py-20 flex flex-col items-center justify-center text-center space-y-6 animate-in fade-in duration-500">
           <div className="w-24 h-24 bg-gray-50 rounded-[32px] flex items-center justify-center border border-gray-100 mb-4 shadow-inner">
             <Database className="w-10 h-10 text-gray-300 opacity-50" />
           </div>
           <div>
             <h3 className="text-2xl font-black text-gray-900 tracking-tight italic">{activeTab} Controls</h3>
             <p className="text-sm text-gray-500 mt-2 max-w-sm mx-auto leading-relaxed">
               This function is being optimized for large-scale data sets. Please contact support center for bulk operations.
             </p>
           </div>
           <button 
             onClick={() => setActiveTab('IMPORT')}
             className="text-blue-600 font-black text-xs uppercase tracking-widest flex items-center space-x-2 hover:translate-x-1 transition-transform"
           >
             <span>Back to Imports</span>
             <ChevronRight className="w-4 h-4" />
           </button>
        </div>
      )}
    </div>
  );
};

export default DataManagementPage;
