import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '../home/components/Navigation';
import Footer from '../home/components/Footer';
import { sampleCVData, sampleJobMatches } from '../../mocks/sampleCV';
import { sendMessageToNova } from '../../lib/novaChat';

interface CandidateProfile {
  name: string;
  title: string;
  experience: number;
  overallMatch: number;
  keySkills: string[];
  topMatches: typeof sampleJobMatches;
}

interface Message {
  id: string;
  type: 'user' | 'nova';
  content: string;
  timestamp: Date;
}

const quickQuestions = [
  { icon: 'ri-building-line', label: 'About Space42', question: 'Tell me about Space42 and its mission' },
  { icon: 'ri-gift-line', label: 'Benefits', question: 'What benefits does Space42 offer?' },
  { icon: 'ri-map-pin-line', label: 'Locations', question: 'Where are Space42 offices located?' },
  { icon: 'ri-calendar-line', label: 'Hiring Process', question: 'What is the hiring process like?' },
  { icon: 'ri-team-line', label: 'Culture', question: 'What is the company culture like?' },
  { icon: 'ri-rocket-line', label: 'Growth', question: 'What growth opportunities are available?' },
];

const novaResponses: Record<string, string> = {
  'Tell me about Space42 and its mission': "Space42 is a leading space technology company headquartered in Abu Dhabi, UAE. Our mission is to leverage advanced satellite technology and AI to provide innovative solutions for Earth observation, communications, and space exploration. We're building the future of space technology! 🚀",
  'What benefits does Space42 offer?': "At Space42, we offer comprehensive benefits including:\n\n✨ Competitive salary packages\n🏥 Premium health insurance\n🌴 Generous vacation policy\n📚 Learning & development budget\n🏋️ Wellness programs\n🎯 Performance bonuses\n🌍 Relocation assistance for international hires",
  'Where are Space42 offices located?': "Our headquarters is in Abu Dhabi, UAE - a vibrant hub for space technology in the Middle East! We also have satellite offices and partnerships across the globe. Abu Dhabi offers an amazing quality of life with world-class amenities, tax-free income, and a multicultural environment. 🌍",
  'What is the hiring process like?': "Our hiring process is designed to be transparent and candidate-friendly:\n\n1️⃣ Application Review (1-2 days)\n2️⃣ Initial Chat with HR (30 mins)\n3️⃣ Technical/Role Assessment\n4️⃣ Team Interview\n5️⃣ Final Discussion & Offer\n\nWe aim to complete the process within 2-3 weeks!",
  'What is the company culture like?': "We pride ourselves on a culture of innovation and collaboration! 🌟\n\n• Flat hierarchy - your ideas matter\n• Diverse & inclusive teams\n• Work-life balance focused\n• Regular team events & hackathons\n• Open communication\n• Continuous learning mindset",
  'What growth opportunities are available?': "Space42 is committed to your growth! 📈\n\n🎓 Annual learning budget for courses & certifications\n🚀 Clear career progression paths\n🔄 Internal mobility opportunities\n👥 Mentorship programs\n🌟 Leadership development tracks\n💡 Innovation time for personal projects",
};

export default function BrowsePage() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [isMatching, setIsMatching] = useState(false);
  const [candidateProfile, setCandidateProfile] = useState<CandidateProfile | null>(null);
  const [highlightedJobs, setHighlightedJobs] = useState<Set<string>>(new Set());
  const [hasAutoMatched, setHasAutoMatched] = useState(false);
  
  // Nova Chat State
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'nova',
      content: "Hi there! 👋 I'm Nova, your AI career guide. Feel free to ask me anything about Space42, our roles, or the application process!",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const novaChatRef = useRef<HTMLDivElement>(null);

  // 从 localStorage 加载聊天记录
  useEffect(() => {
    const savedMessages = localStorage.getItem('novaMessages');
    if (savedMessages) {
      try {
        const parsed = JSON.parse(savedMessages);
        // 转换 timestamp 字符串回 Date 对象
        const messagesWithDates = parsed.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
        setMessages(messagesWithDates);
      } catch (e) {
        console.error('Failed to load Nova messages');
      }
    }
  }, []);

  // 保存聊天记录到 localStorage
  useEffect(() => {
    localStorage.setItem('novaMessages', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    if (hasAutoMatched) return;
    
    const storedProfile = localStorage.getItem('userProfile');
    if (storedProfile) {
      try {
        const profile = JSON.parse(storedProfile);
        
        if (profile.matchResult && profile.completedBriefing) {
          setHasAutoMatched(true);
          handleRealMatchResult(profile.matchResult);
        } else if (profile.hasCV && profile.isSampleCV && profile.completedBriefing) {
          setHasAutoMatched(true);
          handleAutoMatch();
        } else if (profile.hasCV && profile.isRealCV && profile.completedBriefing) {
          setHasAutoMatched(true);
          handleRealCVFallback(profile.cvFileName);
        }
      } catch (e) {
        console.error('Failed to parse user profile');
      }
    }
  }, [hasAutoMatched]);

  const handleRealMatchResult = (matchResult: any) => {
    setIsMatching(true);
    
    const welcomeMessage: Message = {
      id: Date.now().toString(),
      type: 'nova',
      content: "Welcome back! 🎉 I've analyzed your CV and found some great matches!",
      timestamp: new Date()
    };
    setMessages(prev => [...prev, welcomeMessage]);
    
    setTimeout(() => {
      const topMatches = matchResult.topMatches || [];
      const mappedMatches = topMatches.map((m: any) => ({
        id: m.id || String(Math.random()),
        title: m.title,
        category: m.category || 'General',
        location: m.location || 'Abu Dhabi',
        matchScore: m.matchScore,
        matchedSkills: m.matchedSkills || [],
        description: `Match score: ${m.matchScore}%`
      }));
      
      const profile: CandidateProfile = {
        name: matchResult.name || 'Candidate',
        title: matchResult.title || 'Professional',
        experience: matchResult.experience || 0,
        overallMatch: matchResult.overallMatch || 0,
        keySkills: matchResult.keySkills || [],
        topMatches: mappedMatches.length > 0 ? mappedMatches : sampleJobMatches.slice(0, 3)
      };
      
      setCandidateProfile(profile);
      setHighlightedJobs(new Set(mappedMatches.map((j: any) => j.id)));
      setIsMatching(false);

      const matchMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'nova',
        content: `Great news! 🎉 Based on your CV analysis:\n\n📊 Overall Match: ${profile.overallMatch}%\n🛠️ Key Skills: ${profile.keySkills.slice(0, 4).join(', ')}\n\n${mappedMatches.length > 0 ? `🏆 Top Match: "${mappedMatches[0].title}" with ${mappedMatches[0].matchScore}% compatibility!` : 'Check out the available positions!'}\n\nI've highlighted the best roles for you!`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, matchMessage]);
    }, 1000);
  };

  const handleAutoMatch = async () => {
    setIsMatching(true);
    
    const welcomeMessage: Message = {
      id: Date.now().toString(),
      type: 'nova',
      content: "Welcome back! 🎉 I'm analyzing your CV to find the best matches for you...",
      timestamp: new Date()
    };
    setMessages(prev => [...prev, welcomeMessage]);
    
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    const profile: CandidateProfile = {
      name: sampleCVData.name,
      title: sampleCVData.title,
      experience: sampleCVData.experience,
      overallMatch: 85,
      keySkills: sampleCVData.skills.slice(0, 6),
      topMatches: sampleJobMatches.slice(0, 3)
    };
    
    setCandidateProfile(profile);
    setHighlightedJobs(new Set(sampleJobMatches.slice(0, 3).map(j => j.id)));
    setIsMatching(false);

    const matchMessage: Message = {
      id: (Date.now() + 1).toString(),
      type: 'nova',
      content: `Great news! 🎉 I've found ${profile.topMatches.length} excellent matches for you!\n\n🏆 Top Match: "${profile.topMatches[0].title}" with ${profile.topMatches[0].matchScore}% compatibility!\n\nI've highlighted the best roles on the left. Click any job to learn more!`,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, matchMessage]);
  };

  const handleRealCVFallback = (cvFileName: string) => {
    setIsMatching(true);
    
    const welcomeMessage: Message = {
      id: Date.now().toString(),
      type: 'nova',
      content: `I received your CV "${cvFileName}"! 📄 Let me find some great matches for you...`,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, welcomeMessage]);
    
    setTimeout(() => {
      const profile: CandidateProfile = {
        name: 'You',
        title: 'Professional',
        experience: 3,
        overallMatch: 78,
        keySkills: ['Problem Solving', 'Communication', 'Technical Skills'],
        topMatches: sampleJobMatches.slice(0, 3)
      };
      
      setCandidateProfile(profile);
      setHighlightedJobs(new Set(sampleJobMatches.slice(0, 3).map(j => j.id)));
      setIsMatching(false);

      const matchMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'nova',
        content: `Your CV has been uploaded! 🎉\n\nI've identified ${profile.topMatches.length} potential matches based on your profile.\n\n🏆 Top recommendation: "${profile.topMatches[0].title}"\n\nCheck out the highlighted roles!`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, matchMessage]);
    }, 1500);
  };

  // 修改自动滚动逻辑 - 只在 Nova 聊天区域内滚动
  useEffect(() => {
    if (messagesEndRef.current && novaChatRef.current) {
      const chatContainer = novaChatRef.current;
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: text,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    const hardcodedResponse = novaResponses[text];
    
    if (hardcodedResponse) {
      await new Promise(resolve => setTimeout(resolve, 800));
      const novaMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'nova',
        content: hardcodedResponse,
        timestamp: new Date()
      };
      setIsTyping(false);
      setMessages(prev => [...prev, novaMessage]);
    } else {
      try {
        const aiResponse = await sendMessageToNova(text);
        const novaMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: 'nova',
          content: aiResponse.response,
          timestamp: new Date()
        };
        setIsTyping(false);
        setMessages(prev => [...prev, novaMessage]);
      } catch (error) {
        console.error('Nova AI error:', error);
        const novaMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: 'nova',
          content: "I'm having trouble connecting right now. Please try again in a moment.",
          timestamp: new Date()
        };
        setIsTyping(false);
        setMessages(prev => [...prev, novaMessage]);
      }
    }
  };

  const handleSampleCVMatch = async () => {
    setIsMatching(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const profile: CandidateProfile = {
      name: sampleCVData.name,
      title: sampleCVData.title,
      experience: sampleCVData.experience,
      overallMatch: 85,
      keySkills: sampleCVData.skills.slice(0, 6),
      topMatches: sampleJobMatches.slice(0, 3)
    };
    
    setCandidateProfile(profile);
    setHighlightedJobs(new Set(sampleJobMatches.slice(0, 3).map(j => j.id)));
    setIsMatching(false);

    // Add Nova message about matching
    const matchMessage: Message = {
      id: Date.now().toString(),
      type: 'nova',
      content: `Great news! 🎉 I've analyzed your profile and found some excellent matches! Your top match is "${profile.topMatches[0].title}" with a ${profile.topMatches[0].matchScore}% compatibility score. Check out the highlighted roles on the left!`,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, matchMessage]);
  };

  const resetProfile = () => {
    setCandidateProfile(null);
    setHighlightedJobs(new Set());
    setHasAutoMatched(false);
    // 清除 localStorage 中的 CV 信息
    localStorage.removeItem('userProfile');
  };

  const getJobMatchScore = (jobId: string): number | null => {
    if (!candidateProfile) return null;
    const match = sampleJobMatches.find(m => m.id === jobId);
    return match ? match.matchScore : null;
  };

  const jobCategories = sampleJobMatches.reduce((acc, job) => {
    if (!acc[job.category]) {
      acc[job.category] = [];
    }
    acc[job.category].push(job);
    return acc;
  }, {} as Record<string, typeof sampleJobMatches>);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navigation scrolled={scrolled} />

      {/* Progress Bar */}
      <div className="pt-20 pb-6 px-8 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between relative max-w-3xl mx-auto">
            <div className="absolute top-6 left-0 right-0 h-0.5 bg-gray-200">
              <div className="h-full bg-[#5147EF] transition-all duration-500" style={{ width: candidateProfile ? '66.66%' : '33.33%' }}></div>
            </div>

            <div className="flex flex-col items-center gap-2 relative z-10">
              <div className="w-10 h-10 rounded-full bg-[#5147EF] flex items-center justify-center">
                <i className="ri-check-line text-white text-lg"></i>
              </div>
              <span className="text-xs font-semibold text-[#5147EF] uppercase tracking-wide">Discovery</span>
            </div>

            <div className="flex flex-col items-center gap-2 relative z-10">
              <div className="w-10 h-10 rounded-full bg-[#5147EF] flex items-center justify-center">
                {candidateProfile ? (
                  <i className="ri-check-line text-white text-lg"></i>
                ) : (
                  <span className="text-white text-sm font-bold">2</span>
                )}
              </div>
              <span className="text-xs font-semibold text-[#5147EF] uppercase tracking-wide">Identify</span>
            </div>

            <div className="flex flex-col items-center gap-2 relative z-10">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${candidateProfile ? 'bg-[#5147EF]' : 'bg-gray-200'}`}>
                <span className={`text-sm font-bold ${candidateProfile ? 'text-white' : 'text-gray-400'}`}>3</span>
              </div>
              <span className={`text-xs font-semibold uppercase tracking-wide ${candidateProfile ? 'text-[#5147EF]' : 'text-gray-400'}`}>Application</span>
            </div>

            <div className="flex flex-col items-center gap-2 relative z-10">
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-gray-400 text-sm font-bold">4</span>
              </div>
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Mission Log</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Two Column Layout */}
      <div className="flex-1 px-8 py-6">
        <div className="max-w-7xl mx-auto flex gap-6 h-full">
          
          {/* Left Column - Jobs */}
          <div className="flex-1 min-w-0">
            {/* Candidate Profile Card - 显示匹配后的档案 */}
            {candidateProfile && (
              <div className="mb-6">
                <div className="bg-gradient-to-r from-[#5147EF] to-[#7C3AED] rounded-2xl p-5 text-white">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                        <i className="ri-user-3-line text-2xl"></i>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-bold">{candidateProfile.name}</h3>
                          <span className="bg-white/20 text-white text-xs px-2 py-0.5 rounded-full">CV Analyzed</span>
                        </div>
                        <p className="text-white/80 text-sm">{candidateProfile.title}</p>
                        <p className="text-white/60 text-xs mt-0.5">{candidateProfile.experience} years experience • {sampleCVData.education[0].school}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="bg-white/20 rounded-xl px-4 py-2 inline-block">
                        <span className="text-xs text-white/80 block">Overall Match</span>
                        <div className="text-3xl font-bold">{candidateProfile.overallMatch}%</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Skills */}
                  <div className="mt-4">
                    <p className="text-white/60 text-xs mb-2">Key Skills</p>
                    <div className="flex flex-wrap gap-2">
                      {candidateProfile.keySkills.map((skill, index) => (
                        <span key={index} className="bg-white/20 px-3 py-1 rounded-full text-xs font-medium">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Top Matches Summary */}
                  <div className="mt-4 pt-4 border-t border-white/20">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <i className="ri-sparkling-2-fill text-yellow-300"></i>
                        <span className="text-sm font-medium">{candidateProfile.topMatches.length} Top Matches Found</span>
                      </div>
                      <button 
                        onClick={resetProfile}
                        className="text-white/70 hover:text-white text-xs flex items-center gap-1 cursor-pointer hover:bg-white/10 px-2 py-1 rounded-lg transition-colors"
                      >
                        <i className="ri-refresh-line"></i>
                        Reset
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Matching Animation */}
            {isMatching && (
              <div className="mb-6">
                <div className="bg-gradient-to-r from-[#5147EF] to-[#7C3AED] rounded-2xl p-8 text-white text-center">
                  <div className="w-20 h-20 mx-auto mb-4 relative">
                    <div className="absolute inset-0 border-4 border-white/20 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-white rounded-full border-t-transparent animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <i className="ri-sparkling-2-fill text-2xl"></i>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mb-2">AI Matching in Progress...</h3>
                  <p className="text-white/80 text-sm">Nova is analyzing your profile and finding the best opportunities</p>
                  <div className="mt-4 flex justify-center gap-1">
                    <span className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                </div>
              </div>
            )}

            {/* Upload Resume Banner - 只在没有档案且没有匹配时显示 */}
            {!candidateProfile && !isMatching && (
              <div className="mb-6">
                <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#5147EF]/10 to-purple-500/10 rounded-xl flex items-center justify-center">
                      <i className="ri-file-user-line text-[#5147EF] text-2xl"></i>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-base font-bold text-gray-900 mb-1">No Profile Yet</h3>
                      <p className="text-sm text-gray-600">Upload your CV or try our demo to see AI-powered job matching in action!</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => navigate('/briefing')}
                        className="text-[#5147EF] px-4 py-2.5 rounded-xl font-semibold text-sm hover:bg-[#5147EF]/5 transition-colors flex items-center gap-2 whitespace-nowrap cursor-pointer border border-[#5147EF]/20"
                      >
                        <i className="ri-upload-2-line"></i>
                        Upload CV
                      </button>
                      <button 
                        onClick={handleSampleCVMatch}
                        className="bg-gradient-to-r from-[#5147EF] to-[#7C3AED] text-white px-4 py-2.5 rounded-xl font-semibold text-sm hover:shadow-lg hover:shadow-[#5147EF]/25 transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer"
                      >
                        <i className="ri-sparkling-2-fill"></i>
                        Try Demo
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Jobs Header */}
            <div className="mb-4">
              <h2 className="text-xl font-bold text-gray-900">Available Missions</h2>
              <p className="text-sm text-gray-600">Nova has identified these roles across our sectors.</p>
            </div>

            {/* Job Categories - Scrollable */}
            <div className="space-y-8 pb-8">
              {Object.entries(jobCategories).map(([category, jobs]) => (
                <div key={category}>
                  <h3 className="text-base font-bold text-gray-900 mb-4">{category}</h3>
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                    {jobs.map((job) => {
                      const matchScore = getJobMatchScore(job.id);
                      const isHighlighted = highlightedJobs.has(job.id);
                      
                      return (
                        <div 
                          key={job.id} 
                          onClick={() => navigate(`/job/${job.id}`)}
                          className={`bg-white rounded-xl p-4 hover:shadow-lg transition-all cursor-pointer flex flex-col relative ${
                            isHighlighted 
                              ? 'border-2 border-[#5147EF] shadow-md' 
                              : 'border border-gray-200'
                          }`}
                        >
                          {matchScore !== null && (
                            <div className="absolute top-3 right-3">
                              <div className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                                matchScore >= 80 
                                  ? 'bg-green-100 text-green-700' 
                                  : matchScore >= 60 
                                  ? 'bg-yellow-100 text-yellow-700' 
                                  : 'bg-gray-100 text-gray-600'
                              }`}>
                                {matchScore}% Match
                              </div>
                            </div>
                          )}
                          
                          <div className="flex-1">
                            <h4 className="text-sm font-bold text-gray-900 mb-2 pr-20">• {job.title}</h4>
                            <p className="text-xs text-gray-600 mb-3 leading-relaxed line-clamp-2">{job.description}</p>
                            <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-3">
                              <i className="ri-map-pin-line"></i>
                              <span>{job.location}</span>
                            </div>
                            
                            {candidateProfile && matchScore !== null && (
                              <div className="mb-3">
                                <div className="flex flex-wrap gap-1">
                                  {job.matchedSkills.slice(0, 3).map((skill, idx) => (
                                    <span 
                                      key={idx} 
                                      className="bg-[#5147EF]/10 text-[#5147EF] px-1.5 py-0.5 rounded text-xs"
                                    >
                                      {skill}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                          
                          <span className="text-[#5147EF] font-semibold text-xs hover:text-[#4339D8] transition-colors flex items-center gap-1 whitespace-nowrap self-start">
                            View Mission
                            <i className="ri-arrow-right-line"></i>
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column - Nova Q&A */}
          <div className="w-96 flex-shrink-0">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm sticky top-24 flex flex-col" style={{ height: 'calc(100vh - 180px)' }}>
              {/* Nova Header */}
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#5147EF] to-[#7C3AED] flex items-center justify-center">
                    <i className="ri-sparkling-2-fill text-white text-lg"></i>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Nova</h3>
                    <p className="text-xs text-gray-500">Your AI Career Guide</p>
                  </div>
                  <div className="ml-auto flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                    <span className="text-xs text-gray-500">Online</span>
                  </div>
                </div>
              </div>

              {/* Quick Questions */}
              <div className="p-3 border-b border-gray-100">
                <p className="text-xs text-gray-500 mb-2">Quick Questions</p>
                <div className="flex flex-wrap gap-1.5">
                  {quickQuestions.map((q, index) => (
                    <button
                      key={index}
                      onClick={() => handleSendMessage(q.question)}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 bg-gray-50 hover:bg-[#5147EF]/10 hover:text-[#5147EF] rounded-full text-xs text-gray-600 transition-colors cursor-pointer"
                    >
                      <i className={`${q.icon} text-sm`}></i>
                      {q.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Messages - 添加 ref 并设置 scroll-behavior */}
              <div 
                ref={novaChatRef}
                className="flex-1 overflow-y-auto p-4 space-y-4"
                style={{ scrollBehavior: 'smooth' }}
              >
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {message.type === 'nova' && (
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#5147EF] to-[#7C3AED] flex items-center justify-center flex-shrink-0 mr-2">
                        <i className="ri-sparkling-2-fill text-white text-xs"></i>
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] rounded-2xl px-3 py-2 ${
                        message.type === 'user'
                          ? 'bg-[#5147EF] text-white rounded-br-md'
                          : 'bg-gray-100 text-gray-800 rounded-bl-md'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-line">{message.content}</p>
                    </div>
                  </div>
                ))}
                
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#5147EF] to-[#7C3AED] flex items-center justify-center flex-shrink-0 mr-2">
                      <i className="ri-sparkling-2-fill text-white text-xs"></i>
                    </div>
                    <div className="bg-gray-100 rounded-2xl rounded-bl-md px-4 py-3">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-3 border-t border-gray-100">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage(inputValue)}
                    placeholder="Ask Nova anything..."
                    className="flex-1 px-4 py-2.5 bg-gray-50 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#5147EF]/20"
                  />
                  <button
                    onClick={() => handleSendMessage(inputValue)}
                    disabled={!inputValue.trim()}
                    className="w-10 h-10 bg-[#5147EF] text-white rounded-full flex items-center justify-center hover:bg-[#4339D8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <i className="ri-send-plane-fill"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
