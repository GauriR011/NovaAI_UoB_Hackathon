import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { saveMessages, loadMessages, clearMessages, getRejectionContext, RejectionContext } from '../../lib/chatStorage';
import { sendMessageToNova, formatConversationHistory } from '../../lib/novaChat';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  reaction?: string;
}

interface SuggestedQuestion {
  id: string;
  question: string;
  category: 'application' | 'interview' | 'company' | 'salary' | 'process';
  icon: string;
  color: string;
}

interface QuickAction {
  id: string;
  label: string;
  icon: string;
  action: string;
}

interface RejectionQuestion {
  id: string;
  question: string;
  icon: string;
  color: string;
}

export default function ChatPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [showMoodPicker, setShowMoodPicker] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [userName, setUserName] = useState('');
  const [chatTheme, setChatTheme] = useState<'default' | 'warm' | 'focus'>('default');
  const [rejectionContext, setRejectionContextState] = useState<RejectionContext | null>(null);
  const [showRejectionQuestions, setShowRejectionQuestions] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 获取用户名
  useEffect(() => {
    const profile = localStorage.getItem('userProfile');
    if (profile) {
      const parsed = JSON.parse(profile);
      setUserName(parsed.name || '');
    }
  }, []);

  // 根据时间获取问候语
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  // 心情选项
  const moods = [
    { emoji: '😊', label: 'Happy', color: 'bg-yellow-100' },
    { emoji: '😌', label: 'Calm', color: 'bg-green-100' },
    { emoji: '🤔', label: 'Curious', color: 'bg-blue-100' },
    { emoji: '😰', label: 'Anxious', color: 'bg-orange-100' },
    { emoji: '💪', label: 'Motivated', color: 'bg-purple-100' },
    { emoji: '😴', label: 'Tired', color: 'bg-gray-100' },
  ];

  // 快捷操作
  const quickActions: QuickAction[] = [
    { id: '1', label: 'Check my status', icon: 'ri-file-list-3-line', action: 'What is the current status of my applications?' },
    { id: '2', label: 'Prep for interview', icon: 'ri-mic-line', action: 'Help me prepare for my upcoming interview' },
    { id: '3', label: 'Update resume', icon: 'ri-file-edit-line', action: 'I want to update my resume' },
    { id: '4', label: 'Find new jobs', icon: 'ri-search-line', action: 'Show me new job opportunities that match my profile' },
  ];

  // 消息反应选项
  const reactions = ['👍', '❤️', '😊', '🎉', '🤔', '👏'];

  // 常见问题 - Bento Box 风格
  const suggestedQuestions: SuggestedQuestion[] = [
    {
      id: '1',
      question: 'What is the interview process like?',
      category: 'process',
      icon: 'ri-flow-chart',
      color: 'from-violet-500 to-purple-600'
    },
    {
      id: '2',
      question: 'What is the expected salary range?',
      category: 'salary',
      icon: 'ri-money-dollar-circle-line',
      color: 'from-emerald-500 to-teal-600'
    },
    {
      id: '3',
      question: 'What are the key skills required?',
      category: 'interview',
      icon: 'ri-lightbulb-line',
      color: 'from-amber-500 to-orange-600'
    },
    {
      id: '4',
      question: 'How can I improve my application?',
      category: 'application',
      icon: 'ri-file-edit-line',
      color: 'from-rose-500 to-pink-600'
    },
    {
      id: '5',
      question: 'What is the company culture like?',
      category: 'company',
      icon: 'ri-building-2-line',
      color: 'from-cyan-500 to-blue-600'
    },
    {
      id: '6',
      question: 'When will I hear back about my application?',
      category: 'process',
      icon: 'ri-time-line',
      color: 'from-indigo-500 to-violet-600'
    }
  ];

  // AI 回复模拟
  const aiResponses: Record<string, string> = {
    'What is the interview process like?': "Great question! 🎯 The interview process at Space42 typically includes:\n\n1. **AI Phone Screening** (15-20 mins) - Basic qualification check\n2. **Technical Interview** (45 mins) - Deep dive into your skills\n3. **Team Fit Interview** (30 mins) - Meet potential colleagues\n4. **Final Round** (1 hour) - Leadership discussion\n\nThe entire process usually takes 2-3 weeks. Would you like me to help you prepare for any specific round?",
    'What is the expected salary range?': "Based on your profile and the Manager - Spacecraft Analysis position, here's what I found:\n\n💰 **Salary Range**: $120,000 - $160,000/year\n📈 **Bonus**: 10-15% annual performance bonus\n🏥 **Benefits**: Full health coverage, 401k matching\n✈️ **Perks**: Relocation assistance available\n\nYour experience level suggests you'd be competitive at the higher end of this range!",
    'What are the key skills required?': "For the Spacecraft Analysis role, here are the key skills they're looking for:\n\n✅ **Must-Have:**\n• Spacecraft systems analysis (you have this! ⭐)\n• Mission planning experience\n• Team leadership (5+ years preferred)\n\n🎯 **Nice-to-Have:**\n• Python/MATLAB proficiency\n• Orbital mechanics expertise\n• Security clearance\n\nYour profile shows a 92% match - you're well-positioned!",
    'How can I improve my application?': "I've analyzed your application and here are my suggestions:\n\n🚀 **Quick Wins:**\n1. Add more quantifiable achievements (e.g., \"Led team of 12 engineers\")\n2. Highlight your spacecraft analysis certifications\n3. Include relevant project outcomes\n\n📝 **Resume Tips:**\n• Your summary is strong, but could mention leadership earlier\n• Consider adding a \"Key Achievements\" section\n\nWant me to help you refine any specific section?",
    'What is the company culture like?': "Space42 has a fantastic culture! Here's what employees say:\n\n🌟 **Work Environment:**\n• Innovation-focused with 20% time for personal projects\n• Collaborative teams across global offices\n• Strong emphasis on work-life balance\n\n👥 **Team Dynamics:**\n• Flat hierarchy, open communication\n• Regular team events and hackathons\n• Mentorship programs available\n\n📊 **Glassdoor Rating**: 4.5/5 stars",
    'When will I hear back about my application?': "Based on your application timeline:\n\n📅 **Current Status**: Interview Scheduled\n⏰ **Next Step**: AI Phone Screening on Jan 20, 2025\n\n**Typical Timeline:**\n• After phone screen: 2-3 business days\n• After technical: 3-5 business days\n• Final decision: Within 1 week of final round\n\nI'll keep you updated on any changes! 🔔",
    'What is the current status of my applications?': "Here's a quick overview of your applications:\n\n📋 **Active Applications:**\n\n1. **Space42 - Manager, Spacecraft Analysis**\n   • Status: Interview Scheduled 📅\n   • Next: AI Phone Screening (Jan 20)\n   • Match Score: 92%\n\n2. **Orbital Dynamics Inc - Senior Engineer**\n   • Status: Under Review 🔍\n   • Submitted: 3 days ago\n   • Match Score: 87%\n\n3. **AstroTech Labs - Team Lead**\n   • Status: Application Viewed 👀\n   • Submitted: 1 week ago\n   • Match Score: 85%\n\nWould you like me to help you follow up on any of these?",
    'Help me prepare for my upcoming interview': "Let's get you ready! 🎯 Here's your personalized interview prep plan:\n\n**Your Interview: Space42 - AI Phone Screening**\n📅 Date: Jan 20, 2025\n⏰ Duration: 15-20 minutes\n\n**Key Topics to Prepare:**\n1. Your spacecraft analysis experience\n2. Leadership examples (STAR method)\n3. Why Space42?\n\n**Practice Questions:**\n• Tell me about a complex analysis project you led\n• How do you handle tight deadlines?\n• What interests you about our mission?\n\n**Pro Tips:**\n✅ Have your resume nearby\n✅ Prepare 2-3 questions to ask\n✅ Test your phone/internet beforehand\n\nWant me to do a mock interview with you?",
    'I want to update my resume': "Great idea! Let me help you optimize your resume 📝\n\n**Current Resume Strengths:**\n✅ Strong technical background\n✅ Clear work history\n✅ Good education section\n\n**Suggested Improvements:**\n\n1. **Add Metrics** - Quantify your achievements\n   • \"Led team\" → \"Led team of 12 engineers\"\n   • \"Improved efficiency\" → \"Improved efficiency by 35%\"\n\n2. **Keywords to Add:**\n   • Mission planning\n   • Systems integration\n   • Cross-functional leadership\n\n3. **Format Tips:**\n   • Move certifications higher\n   • Add a \"Key Achievements\" section\n\nWould you like me to help you rewrite any specific section?",
    'Show me new job opportunities that match my profile': "I found some exciting opportunities for you! 🚀\n\n**Top Matches Based on Your Profile:**\n\n1. **SpaceX - Senior Systems Engineer**\n   • Match: 94% ⭐\n   • Location: Hawthorne, CA\n   • Salary: $140K - $180K\n\n2. **Blue Origin - Mission Analyst Lead**\n   • Match: 91%\n   • Location: Kent, WA\n   • Salary: $130K - $165K\n\n3. **NASA JPL - Spacecraft Operations Manager**\n   • Match: 89%\n   • Location: Pasadena, CA\n   • Salary: $125K - $155K\n\n**New This Week:** 3 positions\n**Deadline Soon:** 2 positions closing in 5 days\n\nWant me to help you apply to any of these?"
  };

  // 被拒绝申请的专门辅导问题
  const getRejectionQuestions = (context: RejectionContext): RejectionQuestion[] => [
    {
      id: 'r1',
      question: `Why wasn't I selected for the ${context.jobTitle} position?`,
      icon: 'ri-question-line',
      color: 'from-slate-500 to-slate-600'
    },
    {
      id: 'r2',
      question: 'How can I improve my profile for similar roles?',
      icon: 'ri-user-star-line',
      color: 'from-blue-500 to-cyan-600'
    },
    {
      id: 'r3',
      question: 'What skills should I develop to be more competitive?',
      icon: 'ri-lightbulb-line',
      color: 'from-amber-500 to-orange-600'
    },
    {
      id: 'r4',
      question: 'Can you help me find similar positions that match my experience?',
      icon: 'ri-search-eye-line',
      color: 'from-emerald-500 to-teal-600'
    },
    {
      id: 'r5',
      question: 'How should I address this rejection in future applications?',
      icon: 'ri-file-edit-line',
      color: 'from-violet-500 to-purple-600'
    },
    {
      id: 'r6',
      question: 'What certifications would strengthen my candidacy?',
      icon: 'ri-award-line',
      color: 'from-rose-500 to-pink-600'
    }
  ];

  // 被拒绝申请的 AI 回复
  const getRejectionResponses = (context: RejectionContext): Record<string, string> => ({
    [`Why wasn't I selected for the ${context.jobTitle} position?`]: `I understand this is disappointing, and I want to help you understand what happened. 💙\n\n**Feedback from ${context.company}:**\n${context.rejectionReason}\n\n**Important to remember:**\n• This doesn't reflect your overall worth as a professional\n• Many factors influence hiring decisions, including timing and team dynamics\n• Your ${Math.floor(Math.random() * 10) + 80}% match score shows you were a strong candidate\n\nWould you like me to help you identify opportunities where your skills would be an even better fit?`,
    
    'How can I improve my profile for similar roles?': `Great question! Here's a personalized improvement plan based on the feedback:\n\n**Areas to Strengthen:**\n${context.improvementAreas.map((area, i) => `${i + 1}. ${area}`).join('\n')}\n\n**Quick Wins:**\n• Update your resume to highlight relevant experience more prominently\n• Add specific metrics and achievements to your profile\n• Consider getting endorsements from colleagues in the field\n\n**Long-term Growth:**\n• Look into relevant certifications\n• Seek out projects that build the specific experience mentioned\n\nWant me to help you prioritize these improvements?`,
    
    'What skills should I develop to be more competitive?': `Based on the feedback from ${context.company}, here are the skills that would make you more competitive:\n\n**Technical Skills to Develop:**\n${context.improvementAreas.slice(0, 2).map(area => `• ${area}`).join('\n')}\n\n**Soft Skills to Highlight:**\n• Crisis management and decision-making under pressure\n• Cross-functional team collaboration\n• Clear communication of technical concepts\n\n**Recommended Learning Path:**\n1. Online courses in mission control operations\n2. Simulation-based training programs\n3. Industry certifications\n\nWould you like me to provide more details on any of these certifications?`,
    
    'Can you help me find similar positions that match my experience?': `Absolutely! I've analyzed your profile and found some great opportunities:\n\n**Top Matches for You:**\n\n1. **Satellite Operations Engineer** - SpaceTech Corp\n   • Match: 94% ⭐\n   • Why: Aligns with your systems analysis background\n\n2. **Mission Planning Specialist** - Lunar Dynamics\n   • Match: 91%\n   • Why: Values your planning experience\n\n3. **Spacecraft Systems Analyst** - Orbital Solutions\n   • Match: 89%\n   • Why: Perfect fit for your technical skills\n\nThese roles have similar requirements but may value your specific experience more highly. Want me to help you apply to any of these?`,
    
    'How should I address this rejection in future applications?': `This is a smart question! Here's how to turn this experience into a strength:\n\n**In Your Cover Letter:**\n• Focus on what you learned and how you've grown\n• Highlight any new skills or certifications you've gained\n• Show enthusiasm for the specific role\n\n**In Interviews:**\n• If asked, be honest but positive: "I've used that experience to focus on developing [specific skill]"\n• Demonstrate self-awareness and growth mindset\n\n**What NOT to Do:**\n• Don't speak negatively about ${context.company}\n• Don't dwell on the rejection\n• Don't let it affect your confidence\n\nRemember: Many successful professionals faced rejections before landing their dream roles! 💪`,
    
    'What certifications would strengthen my candidacy?': `Based on the feedback and industry trends, here are certifications that would boost your profile:\n\n**Highly Recommended:**\n• Certified Mission Operations Professional (CMOP)\n• Space Systems Engineering Certificate\n• Project Management Professional (PMP)\n\n**Industry-Specific:**\n• Real-time Operations Certification\n• Spacecraft Systems Analysis Certificate\n• Crisis Management Training\n\n**Online Options:**\n• MIT OpenCourseWare - Space Systems Engineering\n• Coursera - Satellite Communications Specialization\n• edX - Aerospace Engineering MicroMasters\n\nWould you like me to provide more details on any of these certifications?`
  });

  // 根据心情调整回复
  const getMoodAdjustedResponse = (response: string, mood: string | null) => {
    if (!mood) return response;
    
    const moodPrefixes: Record<string, string> = {
      'Happy': "I love your positive energy! 🌟 ",
      'Calm': "Taking it easy, I see. ",
      'Curious': "Great question! I love your curiosity. ",
      'Anxious': "I understand this can be stressful. Don't worry, I'm here to help! ",
      'Motivated': "That's the spirit! Let's make things happen! 💪 ",
      'Tired': "I'll keep this brief and helpful. "
    };

    return (moodPrefixes[mood] || '') + response;
  };

  // 加载历史消息
  useEffect(() => {
    const loadHistory = async () => {
      try {
        // 检查是否有拒绝上下文
        const context = searchParams.get('context');
        const rejectionData = getRejectionContext();
        
        if (context === 'rejection' && rejectionData) {
          setRejectionContextState(rejectionData);
          setShowRejectionQuestions(true);
          
          // 创建针对被拒申请的欢迎消息
          const welcomeMessage: Message = {
            id: 'welcome-rejection-' + Date.now(),
            type: 'ai',
            content: `Hey there 💙 I see you're looking for some guidance after the ${rejectionData.jobTitle} application at ${rejectionData.company}.\n\nFirst, I want you to know that not getting selected doesn't define your worth or potential. Every application is a learning opportunity, and I'm here to help you grow from this experience.\n\nI've prepared some questions you might be thinking about. Feel free to ask any of them, or share what's on your mind!`,
            timestamp: new Date()
          };
          setMessages([welcomeMessage]);
          setShowSuggestions(false);
        } else {
          const storedMessages = await loadMessages();
          if (storedMessages.length > 0) {
            const parsedMessages = storedMessages.map(msg => ({
              ...msg,
              timestamp: new Date(msg.timestamp)
            }));
            setMessages(parsedMessages);
            setShowSuggestions(true);
          } else {
            const greeting = getGreeting();
            const personalizedGreeting = userName ? `${greeting}, ${userName}! ` : `${greeting}! `;
            const welcomeMessage: Message = {
              id: 'welcome',
              type: 'ai',
              content: `${personalizedGreeting}👋 I'm Nova, your AI career assistant. I'm here to help you with your job search journey at Space42.\n\nHow are you feeling today? You can tap the mood button below to let me know, and I'll adjust my responses accordingly!\n\nFeel free to ask me anything or use the quick actions to get started.`,
              timestamp: new Date()
            };
            setMessages([welcomeMessage]);
          }
        }
      } catch (error) {
        console.error('Failed to load chat history:', error);
        const welcomeMessage: Message = {
          id: 'welcome',
          type: 'ai',
          content: "Hi there! 👋 I'm Nova, your AI career assistant. I'm here to help you with your job search journey at Space42.\n\nFeel free to ask me anything about your applications, interviews, or career advice. You can also tap on the suggested questions below to get started!",
          timestamp: new Date()
        };
        setMessages([welcomeMessage]);
      } finally {
        setIsLoading(false);
      }
    };

    loadHistory();
  }, [userName, searchParams]);

  // 保存消息到存储
  useEffect(() => {
    if (!isLoading && messages.length > 0) {
      const messagesToSave = messages.map(msg => ({
        id: msg.id,
        type: msg.type,
        content: msg.content,
        timestamp: msg.timestamp.toISOString()
      }));
      saveMessages(messagesToSave).catch(err => 
        console.error('Failed to save messages:', err)
      );
    }
  }, [messages, isLoading]);

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: content.trim(),
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setShowSuggestions(false);
    setShowQuickActions(false);
    setShowRejectionQuestions(false);
    setIsTyping(true);

    const trimmedContent = content.trim();
    
    // 检查是否有硬编码的回答（预设问题秒回）
    let hardcodedResponse: string | undefined;
    if (rejectionContext) {
      const rejectionResponses = getRejectionResponses(rejectionContext);
      hardcodedResponse = rejectionResponses[trimmedContent] || aiResponses[trimmedContent];
    } else {
      hardcodedResponse = aiResponses[trimmedContent];
    }

    if (hardcodedResponse) {
      // 使用硬编码回答 - 模拟打字效果
      setTimeout(() => {
        const moodLabel = moods.find(m => m.emoji === selectedMood)?.label;
        const finalResponse = getMoodAdjustedResponse(hardcodedResponse!, moodLabel || null);
        
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: 'ai',
          content: finalResponse,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, aiMessage]);
        setIsTyping(false);
        
        setTimeout(() => {
          if (rejectionContext) {
            setShowRejectionQuestions(true);
          } else {
            setShowSuggestions(true);
          }
        }, 500);
      }, 800 + Math.random() * 700);
    } else {
      // 没有硬编码 - 调用真实 AI API
      try {
        const history = formatConversationHistory(messages);
        
        let messageToSend = trimmedContent;
        if (rejectionContext) {
          messageToSend = `[Context: The user was not selected for ${rejectionContext.jobTitle} at ${rejectionContext.company}. Feedback: ${rejectionContext.rejectionReason}]\n\nUser question: ${trimmedContent}`;
        }
        
        const moodLabel = moods.find(m => m.emoji === selectedMood)?.label;
        if (moodLabel) {
          messageToSend = `[User mood: ${moodLabel}]\n\n${messageToSend}`;
        }

        const response = await sendMessageToNova(messageToSend, history);
        
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: 'ai',
          content: response.response,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, aiMessage]);
      } catch (error) {
        console.error('Failed to get AI response:', error);
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: 'ai',
          content: "I'm having trouble connecting right now. Please try again in a moment.",
          timestamp: new Date()
        };
        setMessages(prev => [...prev, errorMessage]);
      } finally {
        setIsTyping(false);
        setTimeout(() => {
          if (rejectionContext) {
            setShowRejectionQuestions(true);
          } else {
            setShowSuggestions(true);
          }
        }, 500);
      }
    }
  };

  // 处理建议问题点击
  const handleSuggestionClick = (question: string) => {
    handleSendMessage(question);
  };

  // 处理快捷操作
  const handleQuickAction = (action: string) => {
    handleSendMessage(action);
    setShowQuickActions(false);
  };

  // 添加消息反应
  const handleReaction = (messageId: string, reaction: string) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, reaction } : msg
    ));
  };

  // 清除聊天记录
  const handleClearHistory = async () => {
    try {
      await clearMessages();
      const welcomeMessage: Message = {
        id: 'welcome-' + Date.now(),
        type: 'ai',
        content: "Hi there! 👋 I'm Nova, your AI career assistant. I'm here to help you with your job search journey at Space42.\n\nFeel free to ask me anything about your applications, interviews, or career advice. You can also tap on the suggested questions below to get started!",
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
      setShowMenu(false);
      setShowSuggestions(true);
      setSelectedMood(null);
    } catch (error) {
      console.error('Failed to clear history:', error);
    }
  };

  // 格式化消息内容
  const formatMessage = (content: string) => {
    return content.split('\n').map((line, index) => {
      let formattedLine = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      if (line.startsWith('•') || line.startsWith('-')) {
        return <li key={index} className="ml-4" dangerouslySetInnerHTML={{ __html: formattedLine }} />;
      }
      if (line.match(/^\d+\./)) {
        return <li key={index} className="ml-4 list-decimal" dangerouslySetInnerHTML={{ __html: formattedLine }} />;
      }
      return <p key={index} className="mb-1" dangerouslySetInnerHTML={{ __html: formattedLine }} />;
    });
  };

  // 主题样式
  const themeStyles = {
    default: {
      bg: 'bg-gray-50',
      accent: 'from-[#5147EF] to-[#9333EA]',
      userBubble: 'bg-[#5147EF]'
    },
    warm: {
      bg: 'bg-orange-50/30',
      accent: 'from-orange-500 to-rose-500',
      userBubble: 'bg-gradient-to-r from-orange-500 to-rose-500'
    },
    focus: {
      bg: 'bg-slate-50',
      accent: 'from-slate-700 to-slate-900',
      userBubble: 'bg-slate-800'
    }
  };

  const currentTheme = themeStyles[chatTheme];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-[#5147EF] to-[#9333EA] rounded-xl flex items-center justify-center animate-pulse">
            <i className="ri-robot-2-fill text-white text-2xl"></i>
          </div>
          <p className="text-gray-500 text-sm">Loading chat history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${currentTheme.bg} flex flex-col transition-colors duration-300`}>
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate('/dashboard')}
              className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <i className="ri-arrow-left-line text-xl text-gray-700"></i>
            </button>
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className={`w-10 h-10 bg-gradient-to-br ${currentTheme.accent} rounded-xl flex items-center justify-center`}>
                  <i className="ri-robot-2-fill text-white text-lg"></i>
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
              </div>
              <div>
                <h1 className="font-bold text-gray-900">Nova AI</h1>
                <p className="text-xs text-green-600 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                  Online • Ready to help
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* 心情显示 */}
            {selectedMood && (
              <div className="px-3 py-1.5 bg-gray-100 rounded-full text-sm flex items-center gap-1.5">
                <span>{selectedMood}</span>
                <button 
                  onClick={() => setSelectedMood(null)}
                  className="text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <i className="ri-close-line text-sm"></i>
                </button>
              </div>
            )}
            
            {/* 主题切换 */}
            <div className="relative">
              <button 
                onClick={() => setShowMenu(!showMenu)}
                className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <i className="ri-more-2-fill text-xl text-gray-700"></i>
              </button>
              
              {showMenu && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setShowMenu(false)}
                  ></div>
                  <div className="absolute right-0 top-12 bg-white rounded-xl shadow-lg border border-gray-100 py-2 w-56 z-50">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-xs text-gray-500 font-medium mb-2">Chat Theme</p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setChatTheme('default')}
                          className={`w-8 h-8 rounded-lg bg-gradient-to-br from-[#5147EF] to-[#9333EA] cursor-pointer ${chatTheme === 'default' ? 'ring-2 ring-offset-2 ring-[#5147EF]' : ''}`}
                        ></button>
                        <button
                          onClick={() => setChatTheme('warm')}
                          className={`w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-rose-500 cursor-pointer ${chatTheme === 'warm' ? 'ring-2 ring-offset-2 ring-orange-500' : ''}`}
                        ></button>
                        <button
                          onClick={() => setChatTheme('focus')}
                          className={`w-8 h-8 rounded-lg bg-gradient-to-br from-slate-700 to-slate-900 cursor-pointer ${chatTheme === 'focus' ? 'ring-2 ring-offset-2 ring-slate-700' : ''}`}
                        ></button>
                      </div>
                    </div>
                    <button
                      onClick={handleClearHistory}
                      className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 cursor-pointer"
                    >
                      <i className="ri-delete-bin-line text-gray-500"></i>
                      Clear chat history
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} group`}
            >
              <div className={`flex gap-3 max-w-[85%] ${message.type === 'user' ? 'flex-row-reverse' : ''}`}>
                {/* Avatar */}
                {message.type === 'ai' && (
                  <div className={`w-8 h-8 bg-gradient-to-br ${currentTheme.accent} rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <i className="ri-robot-2-fill text-white text-sm"></i>
                  </div>
                )}
                {message.type === 'user' && (
                  <div className="w-8 h-8 bg-gradient-to-br from-gray-700 to-gray-900 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xs font-bold">{userName ? userName.charAt(0).toUpperCase() : 'U'}</span>
                  </div>
                )}
                
                {/* Message Bubble */}
                <div className="relative">
                  <div
                    className={`rounded-2xl px-4 py-3 ${
                      message.type === 'user'
                        ? `${currentTheme.userBubble} text-white rounded-tr-md`
                        : 'bg-white text-gray-800 rounded-tl-md shadow-sm border border-gray-100'
                    }`}
                  >
                    <div className="text-sm leading-relaxed">
                      {formatMessage(message.content)}
                    </div>
                    <p className={`text-xs mt-2 ${message.type === 'user' ? 'text-white/60' : 'text-gray-400'}`}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  
                  {/* Reaction */}
                  {message.reaction && (
                    <div className="absolute -bottom-2 right-2 bg-white rounded-full px-1.5 py-0.5 shadow-md border border-gray-100 text-sm">
                      {message.reaction}
                    </div>
                  )}
                  
                  {/* Reaction Picker for AI messages */}
                  {message.type === 'ai' && !message.reaction && (
                    <div className="absolute -bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="flex gap-0.5 bg-white rounded-full px-2 py-1 shadow-md border border-gray-100">
                        {reactions.slice(0, 4).map((reaction) => (
                          <button
                            key={reaction}
                            onClick={() => handleReaction(message.id, reaction)}
                            className="hover:scale-125 transition-transform cursor-pointer text-sm"
                          >
                            {reaction}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex justify-start">
              <div className="flex gap-3 max-w-[85%]">
                <div className={`w-8 h-8 bg-gradient-to-br ${currentTheme.accent} rounded-lg flex items-center justify-center flex-shrink-0`}>
                  <i className="ri-robot-2-fill text-white text-sm"></i>
                </div>
                <div className="bg-white rounded-2xl rounded-tl-md px-4 py-3 shadow-sm border border-gray-100">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          {showQuickActions && !isTyping && (
            <div className="pt-2 animate-fade-in">
              <p className="text-xs text-gray-500 mb-3 flex items-center gap-2">
                <i className="ri-flashlight-line"></i>
                Quick actions
              </p>
              <div className="flex flex-wrap gap-2">
                {quickActions.map((action) => (
                  <button
                    key={action.id}
                    onClick={() => handleQuickAction(action.action)}
                    className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all cursor-pointer border border-gray-200 hover:border-gray-300 hover:shadow-sm"
                  >
                    <i className={`${action.icon} text-gray-500`}></i>
                    {action.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Rejection Coaching Questions */}
          {showRejectionQuestions && rejectionContext && !isTyping && (
            <div className="pt-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 bg-slate-100 rounded-lg flex items-center justify-center">
                  <i className="ri-heart-line text-slate-600 text-sm"></i>
                </div>
                <p className="text-xs text-gray-500">Questions you might have about your application</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {getRejectionQuestions(rejectionContext).map((rq, index) => (
                  <button
                    key={rq.id}
                    onClick={() => handleSuggestionClick(rq.question)}
                    className={`group relative overflow-hidden rounded-xl p-4 text-left transition-all duration-300 hover:scale-[1.02] hover:shadow-lg cursor-pointer ${
                      index === 0 ? 'md:col-span-2 md:row-span-1' : ''
                    }`}
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${rq.color} opacity-90 group-hover:opacity-100 transition-opacity`}></div>
                    <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                    <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2"></div>
                    
                    <div className="relative z-10">
                      <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center mb-3">
                        <i className={`${rq.icon} text-white text-xl`}></i>
                      </div>
                      <p className="text-white text-sm font-medium leading-snug">
                        {rq.question}
                      </p>
                    </div>

                    <div className="absolute bottom-3 right-3 w-6 h-6 bg-white/20 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <i className="ri-arrow-right-line text-white text-sm"></i>
                    </div>
                  </button>
                ))}
              </div>
              
              {/* 返回常规问题的选项 */}
              <button
                onClick={() => {
                  setShowRejectionQuestions(false);
                  setRejectionContextState(null);
                  setShowSuggestions(true);
                }}
                className="mt-4 text-sm text-gray-500 hover:text-gray-700 flex items-center gap-2 cursor-pointer"
              >
                <i className="ri-arrow-left-line"></i>
                Back to general questions
              </button>
            </div>
          )}

          {/* Suggested Questions - Bento Box Style */}
          {showSuggestions && !isTyping && !showQuickActions && !showRejectionQuestions && (
            <div className="pt-4">
              <p className="text-xs text-gray-500 mb-3 flex items-center gap-2">
                <i className="ri-lightbulb-flash-line"></i>
                Suggested questions
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {suggestedQuestions.map((sq, index) => (
                  <button
                    key={sq.id}
                    onClick={() => handleSuggestionClick(sq.question)}
                    className={`group relative overflow-hidden rounded-xl p-4 text-left transition-all duration-300 hover:scale-[1.02] hover:shadow-lg cursor-pointer ${
                      index === 0 ? 'md:col-span-2 md:row-span-1' : ''
                    }`}
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${sq.color} opacity-90 group-hover:opacity-100 transition-opacity`}></div>
                    <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                    <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2"></div>
                    
                    <div className="relative z-10">
                      <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center mb-3">
                        <i className={`${sq.icon} text-white text-xl`}></i>
                      </div>
                      <p className="text-white text-sm font-medium leading-snug">
                        {sq.question}
                      </p>
                    </div>

                    <div className="absolute bottom-3 right-3 w-6 h-6 bg-white/20 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <i className="ri-arrow-right-line text-white text-sm"></i>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 sticky bottom-0">
        <div className="max-w-4xl mx-auto px-4 py-4">
          {/* Mood Picker */}
          {showMoodPicker && (
            <div className="mb-3 p-3 bg-gray-50 rounded-xl animate-fade-in">
              <p className="text-xs text-gray-500 mb-2">How are you feeling?</p>
              <div className="flex gap-2 flex-wrap">
                {moods.map((mood) => (
                  <button
                    key={mood.emoji}
                    onClick={() => {
                      setSelectedMood(mood.emoji);
                      setShowMoodPicker(false);
                    }}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg ${mood.color} hover:scale-105 transition-all cursor-pointer`}
                  >
                    <span className="text-lg">{mood.emoji}</span>
                    <span className="text-sm text-gray-700">{mood.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
          
          <div className="flex items-center gap-2">
            {/* Mood Button */}
            <button
              onClick={() => setShowMoodPicker(!showMoodPicker)}
              className={`w-10 h-10 flex items-center justify-center rounded-xl transition-colors cursor-pointer ${
                showMoodPicker ? 'bg-gray-200' : 'hover:bg-gray-100'
              }`}
            >
              {selectedMood || <i className="ri-emotion-line text-xl text-gray-500"></i>}
            </button>
            
            {/* Quick Actions Toggle */}
            <button
              onClick={() => setShowQuickActions(!showQuickActions)}
              className={`w-10 h-10 flex items-center justify-center rounded-xl transition-colors cursor-pointer ${
                showQuickActions ? 'bg-gray-200' : 'hover:bg-gray-100'
              }`}
            >
              <i className="ri-apps-line text-xl text-gray-500"></i>
            </button>
            
            {/* Input */}
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(inputValue)}
                placeholder="Type your message..."
                className="w-full bg-gray-100 rounded-xl px-4 py-3 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-[#5147EF]/30 focus:bg-white transition-all"
              />
              <button
                onClick={() => handleSendMessage(inputValue)}
                disabled={!inputValue.trim()}
                className={`absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                  inputValue.trim()
                    ? `bg-gradient-to-r ${currentTheme.accent} text-white hover:shadow-md`
                    : 'bg-gray-200 text-gray-400'
                }`}
              >
                <i className="ri-send-plane-2-fill text-sm"></i>
              </button>
            </div>
            
            {/* Voice Button */}
            <button
              className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
              title="Voice input (coming soon)"
            >
              <i className="ri-mic-line text-xl text-gray-500"></i>
            </button>
          </div>
          
          <p className="text-xs text-gray-400 text-center mt-2">
            Nova AI adapts to your mood • Press Enter to send
          </p>
        </div>
      </div>
    </div>
  );
}
