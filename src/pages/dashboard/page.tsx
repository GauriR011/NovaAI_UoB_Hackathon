import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { setRejectionContext } from '../../lib/chatStorage';

type TabType = 'overview' | 'applications' | 'interviews' | 'profile';

interface Application {
  id: string;
  jobTitle: string;
  company: string;
  status: 'pending' | 'reviewing' | 'interview' | 'rejected' | 'accepted';
  appliedDate: string;
  matchScore: number;
}

interface Interview {
  id: string;
  jobTitle: string;
  company: string;
  date: string;
  time: string;
  type: 'phone' | 'video' | 'in-person';
  status: 'scheduled' | 'completed' | 'cancelled';
}

interface Notification {
  id: string;
  type: 'success' | 'info' | 'warning';
  title: string;
  message: string;
  time: string;
  read: boolean;
}

interface Feedback {
  id: string;
  jobTitle: string;
  stage: string;
  feedback: string;
  date: string;
  rating: number;
}

interface Question {
  id: string;
  question: string;
  answer: string | null;
  status: 'answered' | 'pending';
  date: string;
}

// AI Agent 提示消息类型
interface AIPrompt {
  id: string;
  type: 'greeting' | 'tip' | 'reminder' | 'celebration' | 'encouragement' | 'question';
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  icon: string;
  color: string;
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [showAIAgent, setShowAIAgent] = useState(true);
  const [currentAIPrompt, setCurrentAIPrompt] = useState<AIPrompt | null>(null);
  const [aiPromptIndex, setAiPromptIndex] = useState(0);
  const [isAIThinking, setIsAIThinking] = useState(false);

  // Mock data
  const [notifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'success',
      title: 'Application Received',
      message: 'Your application for Manager - Spacecraft Analysis has been received and is under review.',
      time: '2 hours ago',
      read: false
    },
    {
      id: '2',
      type: 'info',
      title: 'Profile Tip',
      message: 'Complete your profile to increase your chances of getting noticed by recruiters.',
      time: '1 day ago',
      read: false
    },
    {
      id: '3',
      type: 'warning',
      title: 'Document Required',
      message: 'Please upload your latest certifications to complete your application.',
      time: '2 days ago',
      read: true
    }
  ]);

  const [feedbacks] = useState<Feedback[]>([
    {
      id: '1',
      jobTitle: 'Manager - Spacecraft Analysis',
      stage: 'Resume Screening',
      feedback: 'Strong technical background with relevant spacecraft operations experience. Recommended for technical interview.',
      date: 'Jan 15, 2025',
      rating: 4
    },
    {
      id: '2',
      jobTitle: 'Senior Satellite Systems Engineer',
      stage: 'Initial Review',
      feedback: 'Good match for the role. Experience in satellite systems aligns well with requirements.',
      date: 'Jan 12, 2025',
      rating: 3
    }
  ]);

  const [questions, setQuestions] = useState<Question[]>([
    {
      id: '1',
      question: 'What is the typical interview process timeline?',
      answer: 'Our interview process typically takes 2-3 weeks, including initial screening, technical interview, and final round with leadership.',
      status: 'answered',
      date: 'Jan 10, 2025'
    },
    {
      id: '2',
      question: 'Is relocation assistance provided?',
      answer: null,
      status: 'pending',
      date: 'Jan 14, 2025'
    }
  ]);

  const applicationProgress = [
    { stage: 'Application Submitted', status: 'completed', date: 'Jan 10, 2025' },
    { stage: 'Resume Screening', status: 'completed', date: 'Jan 12, 2025' },
    { stage: 'Technical Interview', status: 'current', date: 'Scheduled: Jan 20, 2025' },
    { stage: 'Final Interview', status: 'pending', date: '' },
    { stage: 'Offer', status: 'pending', date: '' }
  ];

  const applications = [
    {
      id: '1',
      jobTitle: 'Manager - Spacecraft Analysis',
      company: 'Space42',
      status: 'interview',
      appliedDate: 'Jan 10, 2025',
      matchScore: 92,
      nextStep: 'AI Phone Screening',
      nextStepDate: 'Jan 20, 2025',
      location: 'Abu Dhabi, UAE'
    },
    {
      id: '2',
      jobTitle: 'Senior Satellite Communications Engineer',
      company: 'Space42',
      status: 'accepted',
      appliedDate: 'Jan 8, 2025',
      matchScore: 89,
      offerDeadline: 'Jan 25, 2025',
      location: 'Abu Dhabi, UAE'
    },
    {
      id: '3',
      jobTitle: 'Mission Control Analyst',
      company: 'Space42',
      status: 'rejected',
      appliedDate: 'Jan 5, 2025',
      matchScore: 78,
      rejectionReason: 'While your profile is impressive, we found candidates with more direct mission control experience.',
      improvementAreas: [
        'Consider gaining hands-on mission control simulation experience',
        'Certifications in real-time operations would strengthen your profile',
        'Highlight any crisis management or time-critical decision-making experience'
      ],
      location: 'Remote'
    },
    {
      id: '4',
      jobTitle: 'Payload Operations Specialist',
      company: 'Space42',
      status: 'pending',
      appliedDate: 'Jan 12, 2025',
      matchScore: 85,
      pendingReason: 'Your application is strong, but we need a few more details to proceed.',
      missingInfo: [
        'Security clearance status',
        'Specific payload handling certifications',
        'References from previous aerospace roles'
      ],
      location: 'Abu Dhabi, UAE'
    },
    {
      id: '5',
      jobTitle: 'Senior Satellite Communications Engineer',
      company: 'Space42',
      status: 'onboarding',
      appliedDate: 'Jan 8, 2025',
      matchScore: 89,
      onboardingProgress: 2,
      onboardingTotal: 5,
      location: 'Abu Dhabi, UAE',
      startDate: 'Feb 15, 2025'
    }
  ];

  const interviews: Interview[] = [
    {
      id: '1',
      jobTitle: 'Manager - Spacecraft Analysis',
      company: 'Space42',
      date: 'Jan 20, 2025',
      time: '10:00 AM',
      type: 'phone',
      status: 'scheduled'
    }
  ];

  // AI Agent 主动提示消息库
  const aiPrompts: AIPrompt[] = [
    {
      id: '1',
      type: 'greeting',
      message: "Hey there! 👋 Welcome back! I noticed you have an interview coming up. Want me to help you prepare?",
      action: {
        label: "Start Preparing",
        onClick: () => navigate('/interview?job=Manager - Spacecraft Analysis')
      },
      icon: 'ri-sparkling-2-fill',
      color: 'from-purple-500 to-pink-500'
    },
    {
      id: '2',
      type: 'tip',
      message: "💡 Pro tip: Your Space42 interview has a 92% match score! I suggest focusing on spacecraft analysis technical questions.",
      action: {
        label: "View Suggestions",
        onClick: () => navigate('/interview?job=Manager - Spacecraft Analysis')
      },
      icon: 'ri-lightbulb-flash-fill',
      color: 'from-yellow-400 to-orange-500'
    },
    {
      id: '3',
      type: 'reminder',
      message: "⏰ Don't forget! Your AI phone screening is in 3 days. Want to do a practice run now?",
      action: {
        label: "Start Practice",
        onClick: () => navigate('/interview?job=Manager - Spacecraft Analysis')
      },
      icon: 'ri-alarm-warning-fill',
      color: 'from-red-500 to-pink-500'
    },
    {
      id: '4',
      type: 'celebration',
      message: "🎉 Amazing news! Your resume has been viewed by Orbital Dynamics! They seem interested in your background.",
      icon: 'ri-trophy-fill',
      color: 'from-green-400 to-emerald-500'
    },
    {
      id: '5',
      type: 'encouragement',
      message: "💪 You've applied to 3 positions with an average match of 88%! Keep going, success is just around the corner!",
      action: {
        label: "Browse More Jobs",
        onClick: () => navigate('/browse')
      },
      icon: 'ri-rocket-2-fill',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: '6',
      type: 'question',
      message: "🤔 I see you're interested in the aerospace field. Want me to find some personalized job recommendations for you?",
      action: {
        label: "View Recommendations",
        onClick: () => navigate('/browse')
      },
      icon: 'ri-search-eye-fill',
      color: 'from-indigo-500 to-purple-500'
    }
  ];

  // AI Agent 主动推送消息
  useEffect(() => {
    // 初始问候
    const greetingTimer = setTimeout(() => {
      setIsAIThinking(true);
      setTimeout(() => {
        setCurrentAIPrompt(aiPrompts[0]);
        setIsAIThinking(false);
      }, 1500);
    }, 2000);

    // 定期切换提示
    const promptInterval = setInterval(() => {
      setIsAIThinking(true);
      setTimeout(() => {
        setAiPromptIndex(prev => {
          const nextIndex = (prev + 1) % aiPrompts.length;
          setCurrentAIPrompt(aiPrompts[nextIndex]);
          return nextIndex;
        });
        setIsAIThinking(false);
      }, 1000);
    }, 15000); // 每15秒切换一次

    return () => {
      clearTimeout(greetingTimer);
      clearInterval(promptInterval);
    };
  }, []);

  // 打开 Readdy Agent Widget
  const openAIChat = () => {
    const widget = document.querySelector('#vapi-widget-floating-button') as HTMLElement;
    if (widget) {
      widget.click();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'interview':
        return 'bg-blue-100 text-blue-700';
      case 'accepted':
        return 'bg-green-100 text-green-700';
      case 'rejected':
        return 'bg-slate-100 text-slate-700';
      case 'pending':
        return 'bg-amber-100 text-amber-700';
      case 'onboarding':
        return 'bg-purple-100 text-purple-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'interview':
        return 'Interview Scheduled';
      case 'accepted':
        return 'Offer Received';
      case 'rejected':
        return 'Not Selected';
      case 'pending':
        return 'Action Required';
      case 'onboarding':
        return 'Onboarding';
      default:
        return 'Under Review';
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/')}
              className="border border-gray-800 px-2 py-1 cursor-pointer hover:bg-gray-100 transition-colors"
            >
              <span className="text-gray-900 text-sm font-bold tracking-wider">SPACE</span>
              <span className="text-gray-900 text-sm font-bold">42</span>
            </button>
          </div>
          <div className="flex items-center gap-4">
            <button className="text-gray-600 hover:text-gray-900 transition-colors cursor-pointer">
              <i className="ri-notification-3-line text-xl"></i>
            </button>
            <div className="w-10 h-10 bg-gradient-to-br from-[#5147EF] to-[#7C3AED] rounded-full flex items-center justify-center cursor-pointer">
              <span className="text-white font-bold text-sm">JD</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-12 gap-6">
          {/* Main Content */}
          <div className="col-span-8">
            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-8 mb-6 border border-gray-200">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, John!</h1>
              <p className="text-gray-600">Here's what's happening with your job search</p>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="flex border-b border-gray-200">
                {[
                  { id: 'overview', label: 'Overview', icon: 'ri-dashboard-line' },
                  { id: 'applications', label: 'Applications', icon: 'ri-file-list-3-line' },
                  { id: 'interviews', label: 'Interviews', icon: 'ri-calendar-check-line' },
                  { id: 'profile', label: 'Profile', icon: 'ri-user-line' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as TabType)}
                    className={`flex-1 px-6 py-4 text-sm font-medium transition-colors cursor-pointer flex items-center justify-center gap-2 ${
                      activeTab === tab.id 
                        ? 'text-gray-900 bg-gray-50 border-b-2 border-[#5147EF]' 
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <i className={tab.icon}></i>
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="p-6">
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-gray-600 text-sm">Total Applications</span>
                          <i className="ri-file-list-line text-[#5147EF] text-xl"></i>
                        </div>
                        <p className="text-3xl font-bold text-gray-900">4</p>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-gray-600 text-sm">Interviews</span>
                          <i className="ri-calendar-check-line text-green-500 text-xl"></i>
                        </div>
                        <p className="text-3xl font-bold text-gray-900">1</p>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-gray-600 text-sm">Avg Match Score</span>
                          <i className="ri-star-line text-yellow-500 text-xl"></i>
                        </div>
                        <p className="text-3xl font-bold text-gray-900">88%</p>
                      </div>
                    </div>

                    {/* Recent Applications */}
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Applications</h3>
                      <div className="space-y-3">
                        {applications.slice(0, 2).map(app => (
                          <div key={app.id} className="bg-gray-50 rounded-xl p-4 border border-gray-200 hover:bg-gray-100 transition-colors">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-[#5147EF] rounded-lg flex items-center justify-center">
                                  <i className="ri-building-line text-white text-xl"></i>
                                </div>
                                <div>
                                  <h4 className="font-semibold text-gray-900">{app.jobTitle}</h4>
                                  <p className="text-gray-600 text-sm">{app.company}</p>
                                </div>
                              </div>
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(app.status)}`}>
                                {getStatusText(app.status)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Upcoming Interview */}
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-4">Upcoming Interview</h3>
                      <div className="bg-gradient-to-r from-[#5147EF]/10 to-purple-500/10 rounded-xl p-6 border border-[#5147EF]/30">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-[#5147EF] rounded-xl flex items-center justify-center">
                              <i className="ri-phone-line text-white text-2xl"></i>
                            </div>
                            <div>
                              <h4 className="font-bold text-gray-900 text-lg">{interviews[0].jobTitle}</h4>
                              <p className="text-gray-600">{interviews[0].company}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => navigate('/interview?job=Manager - Spacecraft Analysis')}
                            className="bg-[#5147EF] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#4339D8] transition-all cursor-pointer whitespace-nowrap"
                          >
                            Prepare Now
                          </button>
                        </div>
                        <div className="flex items-center gap-6 text-gray-700">
                          <div className="flex items-center gap-2">
                            <i className="ri-calendar-line"></i>
                            <span className="text-sm">{interviews[0].date}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <i className="ri-time-line"></i>
                            <span className="text-sm">{interviews[0].time}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <i className="ri-phone-line"></i>
                            <span className="text-sm">AI Phone Screening</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Applications Tab */}
                {activeTab === 'applications' && (
                  <div className="space-y-4">
                    {applications.map(app => (
                      <div key={app.id} className={`rounded-xl p-6 border transition-colors ${
                        app.status === 'accepted' 
                          ? 'bg-green-50 border-green-200 hover:bg-green-100' 
                          : app.status === 'rejected'
                          ? 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                          : app.status === 'pending'
                          ? 'bg-amber-50 border-amber-200 hover:bg-amber-100'
                          : app.status === 'onboarding'
                          ? 'bg-purple-50 border-purple-200 hover:bg-purple-100'
                          : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                      }`}>
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-4">
                            <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                              app.status === 'accepted' 
                                ? 'bg-green-500' 
                                : app.status === 'rejected'
                                ? 'bg-slate-400'
                                : app.status === 'pending'
                                ? 'bg-amber-500'
                                : app.status === 'onboarding'
                                ? 'bg-purple-500'
                                : 'bg-[#5147EF]'
                            }`}>
                              <i className={`text-white text-2xl ${
                                app.status === 'accepted' 
                                  ? 'ri-checkbox-circle-fill' 
                                  : app.status === 'rejected'
                                  ? 'ri-information-fill'
                                  : app.status === 'pending'
                                  ? 'ri-error-warning-fill'
                                  : app.status === 'onboarding'
                                  ? 'ri-user-follow-fill'
                                  : 'ri-building-line'
                              }`}></i>
                            </div>
                            <div>
                              <h4 className="font-bold text-gray-900 text-lg">{app.jobTitle}</h4>
                              <p className="text-gray-600">{app.company}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 ${getStatusColor(app.status)}`}>
                              {app.status === 'accepted' && <i className="ri-trophy-fill"></i>}
                              {app.status === 'rejected' && <i className="ri-heart-line"></i>}
                              {app.status === 'pending' && <i className="ri-time-line"></i>}
                              {app.status === 'interview' && <i className="ri-calendar-check-fill"></i>}
                              {app.status === 'onboarding' && <i className="ri-rocket-fill"></i>}
                              {getStatusText(app.status)}
                            </span>
                          </div>
                        </div>

                        {/* Onboarding Details */}
                        {app.status === 'onboarding' && (
                          <div className="mt-4 space-y-4">
                            <div className="bg-white rounded-lg p-4 border border-purple-200">
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-3">
                                  <i className="ri-rocket-fill text-purple-500 text-xl"></i>
                                  <div>
                                    <p className="font-semibold text-gray-900">Onboarding in Progress</p>
                                    <p className="text-sm text-gray-600">Start Date: {app.startDate}</p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm text-gray-600">Progress</p>
                                  <p className="font-bold text-purple-600">{app.onboardingProgress}/{app.onboardingTotal} Steps</p>
                                </div>
                              </div>
                              
                              {/* Progress Bar */}
                              <div className="mb-4">
                                <div className="h-2 bg-purple-100 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-gradient-to-r from-purple-500 to-[#5147EF] rounded-full transition-all"
                                    style={{ width: `${(app.onboardingProgress! / app.onboardingTotal!) * 100}%` }}
                                  ></div>
                                </div>
                              </div>

                              {/* Steps Overview */}
                              <div className="flex items-center justify-between mb-4 px-2">
                                {['Welcome', 'Contract', 'Info', 'Docs', 'Done'].map((step, idx) => (
                                  <div key={step} className="flex flex-col items-center">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                                      idx < app.onboardingProgress! 
                                        ? 'bg-green-500 text-white' 
                                        : idx === app.onboardingProgress!
                                        ? 'bg-purple-500 text-white'
                                        : 'bg-gray-200 text-gray-500'
                                    }`}>
                                      {idx < app.onboardingProgress! ? (
                                        <i className="ri-check-line"></i>
                                      ) : (
                                        idx + 1
                                      )}
                                    </div>
                                    <span className={`text-xs mt-1 ${
                                      idx <= app.onboardingProgress! ? 'text-gray-900' : 'text-gray-400'
                                    }`}>{step}</span>
                                  </div>
                                ))}
                              </div>

                              <div className="flex items-center gap-3">
                                <button 
                                  onClick={() => navigate('/onboarding')}
                                  className="flex-1 bg-purple-500 text-white px-4 py-3 rounded-lg font-semibold hover:bg-purple-600 transition-colors cursor-pointer flex items-center justify-center gap-2"
                                >
                                  <i className="ri-arrow-right-circle-fill"></i>
                                  Continue Onboarding
                                </button>
                                <button 
                                  onClick={() => navigate('/chat')}
                                  className="bg-white text-gray-700 px-4 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors cursor-pointer border border-gray-200 flex items-center justify-center gap-2"
                                >
                                  <i className="ri-question-line"></i>
                                  Help
                                </button>
                              </div>
                            </div>

                            <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                              <div className="flex items-start gap-2">
                                <i className="ri-information-line text-blue-500 mt-0.5"></i>
                                <p className="text-sm text-gray-700">
                                  Your progress is automatically saved. You can return anytime to continue where you left off.
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Rejection Details - Empathetic & Transparent */}
                        {app.status === 'rejected' && (
                          <div className="mt-4 space-y-4">
                            <div className="bg-white rounded-lg p-4 border border-slate-200">
                              <div className="flex items-start gap-3 mb-3">
                                <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                  <i className="ri-message-3-line text-slate-600"></i>
                                </div>
                                <div className="flex-1">
                                  <h5 className="font-semibold text-gray-900 mb-2">Feedback from {app.company}</h5>
                                  <p className="text-gray-700 text-sm leading-relaxed">
                                    {app.rejectionReason}
                                  </p>
                                </div>
                              </div>
                            </div>

                            <div className="bg-white rounded-lg p-4 border border-slate-200">
                              <div className="flex items-start gap-3">
                                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                  <i className="ri-lightbulb-line text-blue-600"></i>
                                </div>
                                <div className="flex-1">
                                  <h5 className="font-semibold text-gray-900 mb-3">How to Strengthen Your Profile</h5>
                                  <ul className="space-y-2">
                                    {app.improvementAreas?.map((area, idx) => (
                                      <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                                        <i className="ri-arrow-right-s-line text-blue-500 mt-0.5 flex-shrink-0"></i>
                                        <span>{area}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-3 pt-2">
                              <button 
                                onClick={() => navigate('/browse')}
                                className="flex-1 bg-[#5147EF] text-white px-4 py-3 rounded-lg font-semibold hover:bg-[#4339D8] transition-colors cursor-pointer flex items-center justify-center gap-2"
                              >
                                <i className="ri-search-line"></i>
                                Find Similar Opportunities
                              </button>
                              <button 
                                onClick={() => {
                                  setRejectionContext({
                                    jobTitle: app.jobTitle,
                                    company: app.company,
                                    rejectionReason: app.rejectionReason || '',
                                    improvementAreas: app.improvementAreas || []
                                  });
                                  navigate('/chat?context=rejection');
                                }}
                                className="flex-1 bg-white text-gray-700 px-4 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors cursor-pointer border border-gray-200 flex items-center justify-center gap-2"
                              >
                                <i className="ri-chat-3-line"></i>
                                Talk to Nova
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Accepted Details */}
                        {app.status === 'accepted' && (
                          <div className="mt-4 bg-white rounded-lg p-4 border border-green-200">
                            <div className="flex items-center gap-3 mb-3">
                              <i className="ri-trophy-fill text-green-500 text-xl"></i>
                              <div>
                                <p className="font-semibold text-gray-900">Congratulations! 🎉</p>
                                <p className="text-sm text-gray-600">You've received an offer from {app.company}</p>
                              </div>
                            </div>
                            <div className="flex items-center justify-between pt-3 border-t border-green-100">
                              <div className="text-sm">
                                <span className="text-gray-600">Respond by: </span>
                                <span className="font-semibold text-gray-900">{app.offerDeadline}</span>
                              </div>
                              <button 
                                onClick={() => navigate('/onboarding')}
                                className="bg-green-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-600 transition-colors cursor-pointer whitespace-nowrap"
                              >
                                Accept Offer
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Pending Details */}
                        {app.status === 'pending' && (
                          <div className="mt-4 bg-white rounded-lg p-4 border border-amber-200">
                            <div className="flex items-start gap-3 mb-3">
                              <i className="ri-error-warning-fill text-amber-500 text-xl"></i>
                              <div className="flex-1">
                                <p className="font-semibold text-gray-900 mb-1">Additional Information Needed</p>
                                <p className="text-sm text-gray-600 mb-3">{app.pendingReason}</p>
                                <ul className="space-y-1.5">
                                  {app.missingInfo?.map((info, idx) => (
                                    <li key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                                      <i className="ri-checkbox-blank-circle-line text-amber-500 text-xs"></i>
                                      {info}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                            <button className="w-full bg-amber-500 text-white px-4 py-2.5 rounded-lg font-semibold hover:bg-amber-600 transition-colors cursor-pointer mt-3">
                              Complete Profile
                            </button>
                          </div>
                        )}

                        {/* Interview Details */}
                        {app.status === 'interview' && (
                          <div className="mt-4 bg-white rounded-lg p-4 border border-blue-200">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <i className="ri-calendar-check-fill text-blue-500 text-xl"></i>
                                <div>
                                  <p className="font-semibold text-gray-900">{app.nextStep}</p>
                                  <p className="text-sm text-gray-600">{app.nextStepDate}</p>
                                </div>
                              </div>
                              <button 
                                onClick={() => navigate('/interview')}
                                className="bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-600 transition-colors cursor-pointer whitespace-nowrap"
                              >
                                Prepare Now
                              </button>
                            </div>
                          </div>
                        )}

                        <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between text-sm text-gray-600">
                          <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1.5">
                              <i className="ri-calendar-line"></i>
                              Applied: {app.appliedDate}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <i className="ri-map-pin-line"></i>
                              {app.location}
                            </span>
                          </div>
                          <span className="flex items-center gap-1.5 font-medium text-[#5147EF]">
                            <i className="ri-sparkling-2-fill"></i>
                            Match Score: {app.matchScore}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Interviews Tab */}
                {activeTab === 'interviews' && (
                  <div className="space-y-4">
                    {interviews.map(interview => (
                      <div key={interview.id} className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-[#5147EF] rounded-xl flex items-center justify-center">
                              <i className="ri-video-chat-line text-white text-2xl"></i>
                            </div>
                            <div>
                              <h4 className="font-bold text-gray-900 text-lg">{interview.jobTitle}</h4>
                              <p className="text-gray-600">{interview.company}</p>
                            </div>
                          </div>
                          <span className="px-4 py-2 rounded-full text-sm font-medium bg-green-100 text-green-700">
                            {interview.status === 'scheduled' ? 'Scheduled' : interview.status}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-6 text-gray-600 text-sm">
                            <span className="flex items-center gap-2">
                              <i className="ri-calendar-line"></i>
                              {interview.date}
                            </span>
                            <span className="flex items-center gap-2">
                              <i className="ri-time-line"></i>
                              {interview.time}
                            </span>
                            <span className="flex items-center gap-2">
                              <i className="ri-phone-line"></i>
                              {interview.type === 'phone' ? 'Phone' : interview.type === 'video' ? 'Video' : 'In-Person'}
                            </span>
                          </div>
                          <button
                            onClick={() => navigate('/interview?job=' + interview.jobTitle)}
                            className="bg-[#5147EF] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#4339D8] transition-all cursor-pointer whitespace-nowrap"
                          >
                            Prepare Interview
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Profile Tab */}
                {activeTab === 'profile' && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-6">
                      <div className="w-24 h-24 bg-gradient-to-br from-[#5147EF] to-[#7C3AED] rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-3xl">JD</span>
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-1">John Doe</h3>
                        <p className="text-gray-600">john.doe@email.com</p>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                      <h4 className="font-bold text-gray-900 mb-4">Professional Summary</h4>
                      <p className="text-gray-700 leading-relaxed">
                        Experienced aerospace engineer with 8+ years in spacecraft analysis and mission planning. 
                        Proven track record in leading technical teams and delivering complex projects.
                      </p>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                      <h4 className="font-bold text-gray-900 mb-4">Skills</h4>
                      <div className="flex flex-wrap gap-2">
                        {['Spacecraft Analysis', 'Mission Planning', 'Team Leadership', 'Systems Engineering', 'Orbital Mechanics'].map(skill => (
                          <span key={skill} className="px-4 py-2 bg-[#5147EF]/20 text-[#5147EF] rounded-full text-sm font-medium">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* AI Agent Sidebar - 更活跃的设计 */}
          <div className="col-span-4">
            <div className="sticky top-24 space-y-4">
              {/* AI Agent 主卡片 - 使用渐变色背景 */}
              <div className="bg-gradient-to-br from-[#5147EF] via-[#7C3AED] to-[#9333EA] rounded-2xl p-6 shadow-xl relative overflow-hidden">
                {/* 动态背景效果 */}
                <div className="absolute inset-0 opacity-30">
                  <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full blur-3xl animate-pulse"></div>
                  <div className="absolute bottom-0 right-0 w-40 h-40 bg-pink-300 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
                </div>

                <div className="relative z-10">
                  {/* AI Avatar */}
                  <div className="flex items-center gap-4 mb-6">
                    <div className="relative">
                      <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg">
                        <i className="ri-robot-2-fill text-white text-3xl"></i>
                      </div>
                      {/* 在线状态指示器 */}
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">Nova AI</h3>
                      <p className="text-white/80 text-sm">Your Career Guide</p>
                    </div>
                  </div>

                  {/* AI 消息区域 */}
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-4 min-h-32 border border-white/20">
                    {isAIThinking ? (
                      <div className="flex items-center gap-3">
                        <div className="flex gap-1">
                          <span className="w-2 h-2 bg-white rounded-full animate-bounce"></span>
                          <span className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
                          <span className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                        </div>
                        <span className="text-white/80 text-sm">Nova is thinking...</span>
                      </div>
                    ) : currentAIPrompt ? (
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <div className={`w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center flex-shrink-0`}>
                            <i className={`${currentAIPrompt.icon} text-white text-sm`}></i>
                          </div>
                          <p className="text-white text-sm leading-relaxed">{currentAIPrompt.message}</p>
                        </div>
                        {currentAIPrompt.action && (
                          <button
                            onClick={currentAIPrompt.action.onClick}
                            className="w-full bg-white text-[#5147EF] px-4 py-2 rounded-lg font-semibold hover:bg-white/90 transition-all cursor-pointer whitespace-nowrap text-sm"
                          >
                            {currentAIPrompt.action.label}
                          </button>
                        )}
                      </div>
                    ) : null}
                  </div>

                  {/* 快速操作按钮 */}
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <button
                      onClick={() => navigate('/chat')}
                      className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white px-4 py-3 rounded-lg font-medium transition-all cursor-pointer whitespace-nowrap text-sm flex items-center justify-center gap-2 border border-white/20"
                    >
                      <i className="ri-chat-3-line"></i>
                      Chat
                    </button>
                    <button
                      onClick={() => navigate('/interview?job=Manager - Spacecraft Analysis')}
                      className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white px-4 py-3 rounded-lg font-medium transition-all cursor-pointer whitespace-nowrap text-sm flex items-center justify-center gap-2 border border-white/20"
                    >
                      <i className="ri-calendar-check-line"></i>
                      Interview Prep
                    </button>
                  </div>

                  {/* AI 状态指示 */}
                  <div className="flex items-center justify-center gap-2 text-white/70 text-xs">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                    <span>Nova is always here for you</span>
                  </div>
                </div>
              </div>

              {/* 快速统计卡片 */}
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <i className="ri-line-chart-line text-[#5147EF]"></i>
                  This Week's Progress
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 text-sm">New Applications</span>
                    <span className="text-gray-900 font-bold">2</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 text-sm">Resume Views</span>
                    <span className="text-gray-900 font-bold">5</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 text-sm">Interview Invites</span>
                    <span className="text-gray-900 font-bold">1</span>
                  </div>
                </div>
              </div>

              {/* 推荐职位 */}
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <i className="ri-star-line text-yellow-500"></i>
                  Recommended for You
                </h4>
                <div className="space-y-3">
                  <div className="bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors cursor-pointer">
                    <h5 className="font-semibold text-gray-900 text-sm mb-1">Lead Systems Architect</h5>
                    <p className="text-gray-600 text-xs mb-2">SpaceTech Corp</p>
                    <div className="flex items-center justify-between">
                      <span className="text-[#5147EF] text-xs font-medium">95% Match</span>
                      <i className="ri-arrow-right-line text-gray-400"></i>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors cursor-pointer">
                    <h5 className="font-semibold text-gray-900 text-sm mb-1">Mission Control Engineer</h5>
                    <p className="text-gray-600 text-xs mb-2">Lunar Dynamics</p>
                    <div className="flex items-center justify-between">
                      <span className="text-[#5147EF] text-xs font-medium">91% Match</span>
                      <i className="ri-arrow-right-line text-gray-400"></i>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => navigate('/browse')}
                  className="w-full mt-4 bg-gray-100 hover:bg-gray-200 text-gray-900 px-4 py-2 rounded-lg font-medium transition-all cursor-pointer whitespace-nowrap text-sm"
                >
                  View More Jobs
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
