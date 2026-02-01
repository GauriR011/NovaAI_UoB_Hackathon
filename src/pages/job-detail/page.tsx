
import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navigation from '../home/components/Navigation';
import Footer from '../home/components/Footer';
import { sampleJobMatches } from '../../mocks/sampleCV';
import { sendMessageToNova } from '../../lib/novaChat';

interface Message {
  id: string;
  type: 'user' | 'nova';
  content: string;
  timestamp: Date;
}

const quickQuestions = [
  { icon: 'ri-questionnaire-line', label: 'Interview Tips', question: 'How should I prepare for the interview?' },
  { icon: 'ri-money-dollar-circle-line', label: 'Salary', question: 'What is the salary range for this position?' },
  { icon: 'ri-team-line', label: 'Culture', question: 'What is the company culture like?' },
  { icon: 'ri-checkbox-circle-line', label: 'Requirements', question: 'What skills are required for this role?' },
  { icon: 'ri-file-list-3-line', label: 'Apply Process', question: 'How do I apply for this position?' },
  { icon: 'ri-building-line', label: 'About Space42', question: 'Tell me about Space42 and its mission' },
];

const novaResponses: Record<string, string> = {
  'Tell me about Space42 and its mission': "Space42 is a leading space technology company headquartered in Abu Dhabi, UAE. Our mission is to leverage advanced satellite technology and AI to provide innovative solutions for Earth observation, communications, and space exploration. We're building the future of space technology! 🚀",
  'What benefits does Space42 offer?': "At Space42, we offer comprehensive benefits including:\n\n✨ Competitive salary packages\n🏥 Premium health insurance\n🌴 Generous vacation policy\n📚 Learning & development budget\n🏋️ Wellness programs\n🎯 Performance bonuses\n🌍 Relocation assistance for international hires",
  'Where are Space42 offices located?': "Our headquarters is in Abu Dhabi, UAE - a vibrant hub for space technology in the Middle East! We also have satellite offices and partnerships across the globe. Abu Dhabi offers an amazing quality of life with world-class amenities, tax-free income, and a multicultural environment. 🌍",
  'What is the hiring process like?': "Our hiring process is designed to be transparent and candidate-friendly:\n\n1️⃣ Application Review (1-2 days)\n2️⃣ Initial Chat with HR (30 mins)\n3️⃣ Technical/Role Assessment\n4️⃣ Team Interview\n5️⃣ Final Discussion & Offer\n\nWe aim to complete the process within 2-3 weeks!",
  'What is the company culture like?': "We pride ourselves on a culture of innovation and collaboration! 🌟\n\n• Flat hierarchy - your ideas matter\n• Diverse & inclusive teams\n• Work-life balance focused\n• Regular team events & hackathons\n• Open communication\n• Continuous learning mindset",
  'What growth opportunities are available?': "Space42 is committed to your growth! 📈\n\n🎓 Annual learning budget for courses & certifications\n🚀 Clear career progression paths\n🔄 Internal mobility opportunities\n👥 Mentorship programs\n🌟 Leadership development tracks\n💡 Innovation time for personal projects",
};

export default function JobDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  
  // Nova Chat State - 和 Browse 页面一致
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const novaChatRef = useRef<HTMLDivElement>(null);

  const job = sampleJobMatches.find(j => j.id === id);

  // 从 localStorage 加载聊天记录并添加欢迎消息
  useEffect(() => {
    const savedMessages = localStorage.getItem('novaMessages');
    if (savedMessages) {
      try {
        const parsed = JSON.parse(savedMessages);
        const messagesWithDates = parsed.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
        setMessages(messagesWithDates);
        
        // 添加进入职位详情的欢迎消息
        if (job) {
          const welcomeMessage: Message = {
            id: Date.now().toString(),
            type: 'nova',
            content: `I see you're interested in the "${job.title}" position! 🎯 Feel free to ask me anything specific about this role, or continue our previous conversation.`,
            timestamp: new Date()
          };
          setMessages(prev => [...prev, welcomeMessage]);
        }
      } catch (e) {
        // 如果解析失败，使用默认消息
        setMessages([{
          id: '1',
          type: 'nova',
          content: `Hi there! 👋 I'm Nova, your AI career guide. I can help you learn more about the "${job?.title}" position!`,
          timestamp: new Date()
        }]);
      }
    } else {
      // 没有保存的消息，使用默认消息
      setMessages([{
        id: '1',
        type: 'nova',
        content: `Hi there! 👋 I'm Nova, your AI career guide. I can help you learn more about the "${job?.title}" position!`,
        timestamp: new Date()
      }]);
    }
  }, [job?.title]);

  // 保存聊天记录到 localStorage
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('novaMessages', JSON.stringify(messages));
    }
  }, [messages]);

  // 自动滚动到最新消息
  useEffect(() => {
    if (messagesEndRef.current && novaChatRef.current) {
      const chatContainer = novaChatRef.current;
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    window.addEventListener('scroll', () => {
      setScrolled(window.scrollY > 50);
    });
  }, []);

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
        const contextMessage = job 
          ? `[Context: User is viewing the "${job.title}" position at Space42]\n\nUser question: ${text}`
          : text;
        const aiResponse = await sendMessageToNova(contextMessage);
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

  if (!job) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Navigation scrolled={scrolled} />
        <div className="flex-1 flex items-center justify-center pt-20">
          <div className="text-center">
            <i className="ri-file-unknow-line text-6xl text-gray-300 mb-4"></i>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Job Not Found</h2>
            <p className="text-gray-600 mb-6">The position you're looking for doesn't exist.</p>
            <button 
              onClick={() => navigate('/browse')}
              className="bg-[#5147EF] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#4339D8] transition-colors cursor-pointer whitespace-nowrap"
            >
              Back to Jobs
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const handleApply = () => {
    localStorage.setItem('applyingJob', JSON.stringify(job));
    navigate('/register');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navigation scrolled={scrolled} />

      {/* Hero Section */}
      <div className="pt-20 bg-[#0E1A70]">
        <div className="max-w-7xl mx-auto px-8 py-12">
          <button 
            onClick={() => navigate('/browse')}
            className="text-white/70 hover:text-white flex items-center gap-2 mb-6 cursor-pointer"
          >
            <i className="ri-arrow-left-line"></i>
            Back to Jobs
          </button>
          
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className="bg-white/20 text-white px-3 py-1 rounded-full text-sm">
                  {job.category}
                </span>
                {job.matchScore >= 80 && (
                  <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    {job.matchScore}% Match
                  </span>
                )}
              </div>
              <h1 className="text-3xl font-bold text-white mb-3">{job.title}</h1>
              <div className="flex items-center gap-4 text-white/80">
                <span className="flex items-center gap-2">
                  <i className="ri-map-pin-line"></i>
                  {job.location}
                </span>
                <span className="flex items-center gap-2">
                  <i className="ri-building-line"></i>
                  Space42
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setIsSaved(!isSaved)}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
                  isSaved ? 'bg-yellow-500 text-white' : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                <i className={isSaved ? 'ri-star-fill text-xl' : 'ri-star-line text-xl'}></i>
              </button>
              <button 
                onClick={handleApply}
                className="bg-white text-[#0E1A70] px-8 py-3 rounded-lg font-bold hover:bg-gray-100 transition-colors cursor-pointer whitespace-nowrap"
              >
                Apply Now
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content with Nova */}
      <div className="flex-1 py-12">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex gap-8">
            {/* Main Content - Left Side */}
            <div className="flex-1 space-y-8">
              {/* Match Analysis */}
              {job.matchScore > 0 && (
                <div className="bg-white rounded-xl p-6 border border-gray-200">
                  <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <i className="ri-sparkling-2-fill text-[#5147EF]"></i>
                    AI Match Analysis
                  </h2>
                  <div className="flex items-center gap-6 mb-4">
                    <div className="relative w-24 h-24">
                      <svg className="w-24 h-24 transform -rotate-90">
                        <circle cx="48" cy="48" r="40" stroke="#E5E7EB" strokeWidth="8" fill="none" />
                        <circle 
                          cx="48" cy="48" r="40" 
                          stroke={job.matchScore >= 80 ? '#22C55E' : job.matchScore >= 60 ? '#EAB308' : '#9CA3AF'}
                          strokeWidth="8" 
                          fill="none"
                          strokeDasharray={`${job.matchScore * 2.51} 251`}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-2xl font-bold text-gray-900">{job.matchScore}%</span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-600 mb-3">
                        {job.matchScore >= 80 
                          ? "Excellent match! Your profile aligns strongly with this position."
                          : job.matchScore >= 60
                          ? "Good match! You have many relevant skills for this role."
                          : "Partial match. Consider highlighting transferable skills."}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {job.matchedSkills.map((skill, index) => (
                          <span key={index} className="bg-[#5147EF]/10 text-[#5147EF] px-3 py-1 rounded-full text-sm">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Description */}
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <h2 className="text-lg font-bold text-gray-900 mb-4">About This Role</h2>
                <p className="text-gray-600 leading-relaxed">{job.description}</p>
              </div>

              {/* Responsibilities */}
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Key Responsibilities</h2>
                <ul className="space-y-3">
                  {job.responsibilities.map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <i className="ri-checkbox-circle-fill text-green-500 mt-0.5"></i>
                      <span className="text-gray-600">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Requirements */}
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Requirements</h2>
                <ul className="space-y-3">
                  {job.requirements.map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <i className="ri-checkbox-blank-circle-line text-gray-400 mt-0.5"></i>
                      <span className="text-gray-600">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Right Sidebar - Nova + Apply Card */}
            <div className="w-96 flex-shrink-0">
              {/* Nova Assistant - 和 Browse 页面一致的完整版本 */}
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

                {/* Messages */}
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
      </div>

      <Footer />
    </div>
  );
}
