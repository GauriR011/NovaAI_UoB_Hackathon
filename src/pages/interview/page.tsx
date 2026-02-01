import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

type InterviewStage =
  | 'prep'
  | 'intro'
  | 'phone'
  | 'phone-analysis'
  | 'phone-complete'
  | 'video'
  | 'video-analysis'
  | 'video-complete'
  | 'hr-pending';

interface InterviewData {
  jobTitle: string;
  company: string;
  scheduledTime: string;
  stage: InterviewStage;
}

interface PrepTip {
  icon: string;
  title: string;
  description: string;
}

interface CommonQuestion {
  question: string;
  tip: string;
}

interface ConversationMessage {
  role: 'ai' | 'user';
  text: string;
}

interface AnalysisFeedback {
  category: string;
  icon: string;
  status: 'strength' | 'improve';
  title: string;
  reason: string;
}

interface PrepMessage {
  id: number;
  role: 'nova' | 'user';
  type: 'text' | 'options' | 'checklist' | 'tips' | 'questions';
  content: string;
  options?: string[];
  data?: PrepTip[] | CommonQuestion[];
}

interface ConfidenceArea {
  id: string;
  label: string;
  icon: string;
  description: string;
  level: number | null;
}

type PrepPhase = 'greeting' | 'confidence' | 'tips' | 'checklist' | 'ready';

/* -------------------------------------------------------------------------- */
/*                               Main Component                               */
/* -------------------------------------------------------------------------- */
export default function InterviewPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [currentStage, setCurrentStage] = useState<InterviewStage>('prep');
  const [isCallActive, setIsCallActive] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [isVideoActive, setIsVideoActive] = useState(false);
  const [videoDuration, setVideoDuration] = useState(0);
  const [conversation, setConversation] = useState<ConversationMessage[]>([]);
  const [isUserSpeaking, setIsUserSpeaking] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [interviewResult, setInterviewResult] = useState<'passed' | 'pending' | null>(null);
  const [showPrepSection, setShowPrepSection] = useState(true);
  const [activeTab, setActiveTab] = useState<'tips' | 'questions' | 'checklist'>('tips');
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [showAnalysisResult, setShowAnalysisResult] = useState(false);
  const [videoConversation, setVideoConversation] = useState<ConversationMessage[]>([]);
  const [isVideoUserSpeaking, setIsVideoUserSpeaking] = useState(false);
  const [videoAnalysisProgress, setVideoAnalysisProgress] = useState(0);
  const [showVideoAnalysisResult, setShowVideoAnalysisResult] = useState(false);

  // Nova Prep States - New Open Style
  const [prepPhase, setPrepPhase] = useState<PrepPhase>('greeting');
  const [showNovaBubble, setShowNovaBubble] = useState(false);
  const [novaBubbleText, setNovaBubbleText] = useState('');
  const [confidenceAreas, setConfidenceAreas] = useState<ConfidenceArea[]>([
    { id: 'technical', label: 'Technical Knowledge', icon: 'ri-code-s-slash-line', description: 'Spacecraft systems, orbital mechanics, mission planning', level: null },
    { id: 'communication', label: 'Communication Skills', icon: 'ri-chat-voice-line', description: 'Articulating ideas clearly and professionally', level: null },
    { id: 'leadership', label: 'Leadership & Teamwork', icon: 'ri-team-line', description: 'Managing teams, collaboration, conflict resolution', level: null },
    { id: 'problem', label: 'Problem Solving', icon: 'ri-lightbulb-line', description: 'Analytical thinking, handling challenges', level: null },
    { id: 'company', label: 'Company Knowledge', icon: 'ri-building-line', description: 'Understanding Space42\'s mission and projects', level: null },
  ]);
  const [selectedGreeting, setSelectedGreeting] = useState<string | null>(null);
  const [showTips, setShowTips] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);

  // Legacy states (keep for compatibility)
  const [prepMessages, setPrepMessages] = useState<PrepMessage[]>([]);
  const [prepStep, setPrepStep] = useState(0);
  const [isNovaTyping, setIsNovaTyping] = useState(false);
  const [userInput, setUserInput] = useState('');
  const prepChatRef = useRef<HTMLDivElement>(null);

  /* -------------------------- Interview Meta Data -------------------------- */
  const interviewData: InterviewData = {
    jobTitle: searchParams.get('job') || 'Manager - Spacecraft Analysis',
    company: 'Space42',
    scheduledTime: 'Jan 20, 2025 at 10:00 AM',
    stage: 'intro',
  };

  /* --------------------------- Analysis Feedback --------------------------- */
  const analysisFeedback: AnalysisFeedback[] = [
    {
      category: 'Technical Knowledge',
      icon: 'ri-code-s-slash-line',
      status: 'strength',
      title: 'Strong technical foundation',
      reason:
        'Demonstrated deep understanding of spacecraft systems and orbital mechanics with specific examples.',
    },
    {
      category: 'Communication',
      icon: 'ri-chat-voice-line',
      status: 'strength',
      title: 'Clear and articulate responses',
      reason:
        'Answers were well-structured and easy to follow, showing excellent verbal communication skills.',
    },
    {
      category: 'Leadership Experience',
      icon: 'ri-team-line',
      status: 'strength',
      title: 'Proven team management',
      reason:
        'Provided concrete examples of leading cross-functional teams and delivering projects on time.',
    },
    {
      category: 'Problem Solving',
      icon: 'ri-lightbulb-line',
      status: 'improve',
      title: 'Add more quantifiable results',
      reason:
        'Consider including specific metrics (e.g., "reduced errors by 30%") to strengthen impact statements.',
    },
    {
      category: 'Company Knowledge',
      icon: 'ri-building-line',
      status: 'improve',
      title: 'Deepen Space42 research',
      reason:
        'Could mention more recent Space42 projects or partnerships to show stronger company interest.',
    },
  ];

  const videoAnalysisFeedback: AnalysisFeedback[] = [
    {
      category: 'Technical Depth',
      icon: 'ri-code-s-slash-line',
      status: 'strength',
      title: 'Excellent technical explanations',
      reason:
        'Provided detailed technical solutions with clear reasoning and demonstrated deep expertise in spacecraft systems.',
    },
    {
      category: 'Problem Solving',
      icon: 'ri-lightbulb-line',
      status: 'strength',
      title: 'Strong analytical approach',
      reason:
        'Showed systematic problem-solving methodology with real-world examples and measurable outcomes.',
    },
    {
      category: 'Presentation Skills',
      icon: 'ri-presentation-line',
      status: 'strength',
      title: 'Clear and confident delivery',
      reason:
        'Maintained excellent eye contact, spoke clearly, and presented ideas in a well-organized manner.',
    },
    {
      category: 'Strategic Thinking',
      icon: 'ri-mind-map',
      status: 'strength',
      title: 'Forward-thinking mindset',
      reason:
        'Demonstrated ability to think beyond immediate tasks and consider long-term implications.',
    },
    {
      category: 'Technical Details',
      icon: 'ri-file-code-line',
      status: 'improve',
      title: 'Include more code/tool examples',
      reason:
        'Could strengthen responses by mentioning specific tools, frameworks, or methodologies used in projects.',
    },
  ];

  /* --------------------------- Score Breakdowns -------------------------- */
  const videoScoreBreakdown = [
    {
      category: 'Technical Depth',
      icon: 'ri-code-s-slash-line',
      score: 24,
      maxScore: 25,
      status: 'excellent',
    },
    {
      category: 'Problem Solving',
      icon: 'ri-lightbulb-line',
      score: 22,
      maxScore: 25,
      status: 'excellent',
    },
    {
      category: 'Presentation Skills',
      icon: 'ri-presentation-line',
      score: 18,
      maxScore: 20,
      status: 'good',
    },
    {
      category: 'Strategic Thinking',
      icon: 'ri-mind-map',
      score: 17,
      maxScore: 20,
      status: 'good',
    },
    {
      category: 'Technical Details',
      icon: 'ri-file-code-line',
      score: 11,
      maxScore: 10,
      status: 'excellent',
    },
  ];

  const scoreBreakdown = [
    {
      category: 'Technical Knowledge',
      icon: 'ri-code-s-slash-line',
      score: 22,
      maxScore: 25,
      status: 'excellent',
    },
    {
      category: 'Communication Skills',
      icon: 'ri-chat-voice-line',
      score: 20,
      maxScore: 20,
      status: 'excellent',
    },
    {
      category: 'Leadership Experience',
      icon: 'ri-team-line',
      score: 18,
      maxScore: 20,
      status: 'good',
    },
    {
      category: 'Problem Solving',
      icon: 'ri-lightbulb-line',
      score: 15,
      maxScore: 20,
      status: 'good',
    },
    {
      category: 'Company Knowledge',
      icon: 'ri-building-line',
      score: 12,
      maxScore: 15,
      status: 'average',
    },
  ];

  /* --------------------------- Prep Content --------------------------- */
  const prepTips: PrepTip[] = [
    {
      icon: 'ri-rocket-line',
      title: 'Research Space42',
      description:
        "Familiarize yourself with Space42's mission, recent projects, and their role in the UAE space industry. Mention specific achievements like satellite launches or partnerships.",
    },
    {
      icon: 'ri-file-list-3-line',
      title: 'Review Technical Skills',
      description:
        'Brush up on spacecraft analysis methodologies, orbital mechanics, and mission planning. Be ready to discuss specific tools and software you\'ve used.',
    },
    {
      icon: 'ri-team-line',
      title: 'Prepare Leadership Examples',
      description:
        'As a Manager role, prepare stories about leading teams, resolving conflicts, and delivering projects under pressure. Use the STAR method.',
    },
    {
      icon: 'ri-global-line',
      title: 'Understand Industry Trends',
      description:
        'Stay updated on current space industry developments, commercial space ventures, and emerging technologies in satellite systems.',
    },
  ];

  const commonQuestions: CommonQuestion[] = [
    {
      question: 'Tell me about your experience in spacecraft operations.',
      tip: 'Focus on specific missions, your role, and measurable outcomes. Mention any certifications or specialized training.',
    },
    {
      question: 'How do you handle complex technical challenges?',
      tip: 'Use a real example. Describe the problem, your analytical approach, and the successful resolution.',
    },
    {
      question: 'Why are you interested in Space42?',
      tip: "Connect your career goals with Space42's mission. Show genuine enthusiasm for their projects and growth.",
    },
    {
      question: 'Describe your management style.',
      tip: 'Highlight collaboration, clear communication, and how you empower team members while maintaining accountability.',
    },
    {
      question: 'How do you prioritize tasks in high-pressure situations?',
      tip: 'Explain your framework for prioritization. Give an example of managing competing deadlines successfully.',
    },
  ];

  const [checklist, setChecklist] = useState([
    { id: 1, text: 'Test your microphone and camera', checked: false },
    { id: 2, text: 'Find a quiet, well-lit space', checked: false },
    { id: 3, text: 'Have your resume ready for reference', checked: false },
    { id: 4, text: 'Prepare questions to ask the interviewer', checked: false },
    { id: 5, text: 'Close unnecessary browser tabs and apps', checked: false },
    { id: 6, text: 'Have a glass of water nearby', checked: false },
  ]);

  const toggleChecklistItem = (id: number) => {
    setChecklist((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    );
  };

  const completedCount = checklist.filter((item) => item.checked).length;

  /* --------------------------- Nova Prep Flow - New Open Style --------------------------- */
  useEffect(() => {
    if (currentStage === 'prep') {
      setTimeout(() => {
        setShowNovaBubble(true);
        setNovaBubbleText(`Hi there! 👋 I'm Nova, your AI interview coach. I'm here to help you prepare for your interview at ${interviewData.company}.`);
        setAnimateIn(true);
      }, 500);
    }
  }, [currentStage]);

  const handleGreetingSelect = (greeting: string) => {
    setSelectedGreeting(greeting);
    setNovaBubbleText("Great! Let me understand where you'd like to focus. Rate your confidence in each area below - this helps me give you personalized tips! 🎯");
    setTimeout(() => setPrepPhase('confidence'), 300);
  };

  const handleConfidenceSelect = (areaId: string, level: number) => {
    setConfidenceAreas(prev => prev.map(area => 
      area.id === areaId ? { ...area, level } : area
    ));
  };

  const allConfidenceRated = confidenceAreas.every(area => area.level !== null);

  const getWeakAreas = () => {
    return confidenceAreas.filter(area => area.level !== null && area.level <= 2);
  };

  const getStrongAreas = () => {
    return confidenceAreas.filter(area => area.level !== null && area.level >= 4);
  };

  const handleContinueToTips = () => {
    const weakAreas = getWeakAreas();
    const strongAreas = getStrongAreas();
    
    let message = "";
    if (weakAreas.length > 0) {
      message = `I see you'd like more support with ${weakAreas.map(a => a.label).join(' and ')}. Let me share some targeted tips to boost your confidence! 💪`;
    } else if (strongAreas.length === confidenceAreas.length) {
      message = "Wow, you're feeling confident across the board! 🌟 Here are some advanced tips to help you really shine!";
    } else {
      message = "Good balance! Here are some tips to help you prepare effectively. Focus on the areas where you want to improve! ✨";
    }
    
    setNovaBubbleText(message);
    setPrepPhase('tips');
    setShowTips(true);
  };

  const handleContinueToChecklist = () => {
    setNovaBubbleText("Almost ready! Let's do a quick pre-interview checklist to make sure everything is set up perfectly. ✅");
    setPrepPhase('checklist');
  };

  const handleReadyToStart = () => {
    setNovaBubbleText("You're all set! 🎉 Remember: be yourself, speak clearly, and take your time with answers. You've got this!");
    setPrepPhase('ready');
  };

  /* --------------------------- Nova Prep Flow --------------------------- */
  const novaScript: Omit<PrepMessage, 'id'>[] = [
    {
      role: 'nova',
      type: 'text',
      content: `Hi there! 👋 I'm Nova, your AI interview coach. I'm here to help you prepare for your interview at ${interviewData.company} for the ${interviewData.jobTitle} position.`,
    },
    {
      role: 'nova',
      type: 'text',
      content: "Let's make sure you're fully prepared and confident. How are you feeling about the interview?",
    },
    {
      role: 'nova',
      type: 'options',
      content: '',
      options: ["I'm excited but nervous", "I feel pretty confident", "I'm not sure what to expect"],
    },
    {
      role: 'nova',
      type: 'text',
      content: "That's completely normal! Let me share some personalized preparation tips based on the role you're applying for. These will help you stand out! ✨",
    },
    {
      role: 'nova',
      type: 'tips',
      content: 'Here are key areas to focus on:',
      data: prepTips,
    },
    {
      role: 'nova',
      type: 'text',
      content: "Now, let's practice with some common questions you might encounter. Would you like to see them?",
    },
    {
      role: 'nova',
      type: 'options',
      content: '',
      options: ['Yes, show me the questions', 'Skip to checklist'],
    },
    {
      role: 'nova',
      type: 'questions',
      content: "Here are the most likely questions you'll face, along with tips for answering them:",
      data: commonQuestions,
    },
    {
      role: 'nova',
      type: 'text',
      content: "Great! Before we start, let's go through a quick checklist to make sure everything is ready. Check off each item as you complete it! ✅",
    },
    {
      role: 'nova',
      type: 'checklist',
      content: 'Pre-Interview Checklist:',
    },
    {
      role: 'nova',
      type: 'text',
      content: "You're all set! 🎉 Remember, be yourself, speak clearly, and don't rush your answers. I believe in you!",
    },
    {
      role: 'nova',
      type: 'options',
      content: "Ready to start your interview?",
      options: ["I'm ready! Let's go", 'Review tips again'],
    },
  ];

  // Initialize Nova conversation
  useEffect(() => {
    if (currentStage === 'prep' && prepMessages.length === 0) {
      addNovaMessage(0);
    }
  }, [currentStage]);

  // Auto-scroll chat
  useEffect(() => {
    if (prepChatRef.current) {
      prepChatRef.current.scrollTop = prepChatRef.current.scrollHeight;
    }
  }, [prepMessages, isNovaTyping]);

  const addNovaMessage = (index: number) => {
    if (index >= novaScript.length) return;

    setIsNovaTyping(true);
    
    setTimeout(() => {
      setIsNovaTyping(false);
      const msg = novaScript[index];
      setPrepMessages((prev) => [...prev, { ...msg, id: Date.now() }]);
      setPrepStep(index + 1);

      // Auto-continue for text messages that aren't followed by options
      if (msg.type === 'text' && index + 1 < novaScript.length) {
        const nextMsg = novaScript[index + 1];
        if (nextMsg.type === 'text' || nextMsg.type === 'tips' || nextMsg.type === 'questions' || nextMsg.type === 'checklist') {
          setTimeout(() => addNovaMessage(index + 1), 800);
        }
      }
    }, 1200);
  };

  const handleOptionSelect = (option: string) => {
    // Add user message
    setPrepMessages((prev) => [
      ...prev,
      { id: Date.now(), role: 'user', type: 'text', content: option },
    ]);

    // Handle different options
    if (option === "I'm ready! Let's go") {
      setTimeout(() => setCurrentStage('intro'), 500);
      return;
    }

    if (option === 'Review tips again') {
      setPrepMessages([]);
      setPrepStep(0);
      setTimeout(() => addNovaMessage(0), 300);
      return;
    }

    if (option === 'Skip to checklist') {
      // Skip to checklist step
      setTimeout(() => {
        const checklistIndex = novaScript.findIndex((m) => m.type === 'checklist') - 1;
        addNovaMessage(checklistIndex);
      }, 500);
      return;
    }

    // Continue to next message
    setTimeout(() => addNovaMessage(prepStep), 500);
  };

  const handleUserInput = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim()) return;

    setPrepMessages((prev) => [
      ...prev,
      { id: Date.now(), role: 'user', type: 'text', content: userInput },
    ]);
    setUserInput('');

    // Continue conversation
    setTimeout(() => addNovaMessage(prepStep), 500);
  };

  /* ------------------------------- Timers ------------------------------- */
  // Phone call timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isCallActive) {
      interval = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isCallActive]);

  // Video call timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isVideoActive) {
      interval = setInterval(() => {
        setVideoDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isVideoActive]);

  /* --------------------------- Conversation Sim -------------------------- */
  // Phone call conversation simulation
  useEffect(() => {
    if (!isCallActive) return;

    const script: ConversationMessage[] = [
      {
        role: 'ai',
        text: "Hello! Thank you for joining this AI screening call for the Spacecraft Analysis position at Space42. How are you today?",
      },
      {
        role: 'user',
        text: "Hi! I'm doing great, thank you. I'm really excited about this opportunity and looking forward to our conversation.",
      },
      {
        role: 'ai',
        text: 'Wonderful! Let\'s get started. Can you tell me about your background in spacecraft operations?',
      },
      {
        role: 'user',
        text: "Absolutely. I have over 6 years of experience in spacecraft systems analysis. At my previous role, I led a team of 8 engineers managing satellite telemetry and orbital maneuvers. We successfully launched 3 communication satellites with zero critical failures.",
      },
      {
        role: 'ai',
        text: 'That\'s impressive. How do you typically handle complex technical challenges when they arise?',
      },
      {
        role: 'user',
        text: "I follow a systematic approach. First, I gather all available data and identify the root cause. Then I collaborate with cross-functional teams to brainstorm solutions. For example, when we faced an unexpected orbital drift issue, I coordinated with the propulsion team and we developed a correction algorithm that's now standard procedure.",
      },
      {
        role: 'ai',
        text: 'Excellent problem-solving approach. What interests you most about this role at Space42?',
      },
      {
        role: 'user',
        text: "Space42's mission to advance the UAE's space capabilities really resonates with me. I'm particularly excited about your recent Earth observation projects and the opportunity to contribute to cutting-edge satellite technology. The manager role also aligns perfectly with my career goal of leading larger technical teams.",
      },
      {
        role: 'ai',
        text: 'Thank you for sharing that. One last question - how do you prioritize tasks when managing multiple projects under tight deadlines?',
      },
      {
        role: 'user',
        text: "I use a combination of impact assessment and stakeholder alignment. I categorize tasks by urgency and strategic importance, then communicate priorities clearly with my team. Regular check-ins help us stay agile. In my last project, this approach helped us deliver two weeks ahead of schedule.",
      },
      {
        role: 'ai',
        text: "Thank you for your detailed responses. I have all the information I need. You'll hear back from us shortly regarding the next steps. Have a great day!",
      },
      {
        role: 'user',
        text: 'Thank you so much for your time. I look forward to hearing from you. Goodbye!',
      },
    ];

    let index = 0;
    const addMessage = () => {
      if (index >= script.length) return;

      const msg = script[index];

      if (msg.role === 'user') setIsUserSpeaking(true);

      setTimeout(() => {
        setConversation((prev) => [...prev, msg]);
        setIsUserSpeaking(false);
        index++;

        const delay = msg.text.length > 150 ? 4000 : 3000;
        setTimeout(addMessage, delay);
      }, msg.role === 'user' ? 2000 : 500);
    };

    const startDelay = setTimeout(addMessage, 1500);
    return () => clearTimeout(startDelay);
  }, [isCallActive]);

  // Video call conversation simulation
  useEffect(() => {
    if (!isVideoActive) return;

    const script: ConversationMessage[] = [
      {
        role: 'ai',
        text: "Welcome to the technical video interview! I'm excited to learn more about your technical expertise. Let's start with a challenging scenario - can you describe a complex technical problem you've solved?",
      },
      {
        role: 'user',
        text: "Thank you! One significant challenge was when our satellite experienced unexpected thermal fluctuations during orbit. I led the analysis team to identify the root cause - a miscalculation in the thermal model. We developed a real-time correction algorithm that adjusted the satellite's orientation to optimize heat distribution.",
      },
      {
        role: 'ai',
        text: 'Impressive problem-solving! How did you validate that your solution would work before implementing it on the live satellite?',
      },
      {
        role: 'user',
        text: "We used a three-phase validation approach. First, we ran extensive simulations using our digital twin model. Then we conducted hardware-in-the-loop testing with our ground equipment. Finally, we implemented the fix incrementally, monitoring telemetry data at each step. This reduced risk while allowing us to verify effectiveness in real conditions.",
      },
      {
        role: 'ai',
        text: 'Excellent methodology. Now, tell me about a time when you had to make a critical decision under pressure with incomplete information.',
      },
      {
        role: 'user',
        text: "During a launch window, we detected an anomaly in the propulsion system 2 hours before launch. With limited time, I had to decide whether to proceed or abort. I quickly assembled key engineers, analyzed available data, and identified it was a sensor calibration issue, not a hardware fault. We recalibrated and launched successfully, saving millions in delay costs.",
      },
      {
        role: 'ai',
        text: 'That shows great leadership under pressure. How do you approach mentoring junior engineers while managing your own technical responsibilities?',
      },
      {
        role: 'user',
        text: "I believe in 'learning by doing' with guidance. I pair junior engineers with experienced team members on critical tasks, conduct weekly technical deep-dives where we analyze real problems together, and create documentation that captures our institutional knowledge. This has reduced onboarding time by 40% and improved team retention.",
      },
      {
        role: 'ai',
        text: 'Wonderful approach to knowledge transfer. One final question - where do you see spacecraft technology heading in the next 5 years, and how would you contribute to that vision at Space42?',
      },
      {
        role: 'user',
        text: "I see three major trends: increased autonomy through AI, miniaturization enabling constellation deployments, and sustainable space practices. At Space42, I'd love to lead initiatives in autonomous spacecraft operations, leveraging my experience in real-time systems. I'm particularly excited about Space42's Earth observation projects and believe my background in data analysis could help advance your imaging capabilities.",
      },
      {
        role: 'ai',
        text: "Thank you for such thoughtful and detailed responses. Your technical depth and strategic thinking are exactly what we're looking for. This concludes our video interview. You'll hear from us soon!",
      },
      {
        role: 'user',
        text: "Thank you so much for this opportunity! I really enjoyed our discussion and I'm very excited about the possibility of joining Space42. Looking forward to hearing from you!",
      },
    ];

    let index = 0;
    const addMessage = () => {
      if (index >= script.length) return;

      const msg = script[index];

      if (msg.role === 'user') setIsVideoUserSpeaking(true);

      setTimeout(() => {
        setVideoConversation((prev) => [...prev, msg]);
        setIsVideoUserSpeaking(false);
        index++;

        const delay =
          msg.text.length > 200
            ? 5000
            : msg.text.length > 100
            ? 4000
            : 3000;
        setTimeout(addMessage, delay);
      }, msg.role === 'user' ? 2500 : 500);
    };

    const startDelay = setTimeout(addMessage, 2000);
    return () => clearTimeout(startDelay);
  }, [isVideoActive]);

  /* --------------------------- Progress Animations -------------------------- */
  // Phone analysis progress
  useEffect(() => {
    if (currentStage !== 'phone-analysis' || showAnalysisResult) return;

    const interval = setInterval(() => {
      setAnalysisProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => setShowAnalysisResult(true), 500);
          return 100;
        }
        return prev + 2;
      });
    }, 50);
    return () => clearInterval(interval);
  }, [currentStage, showAnalysisResult]);

  // Video analysis progress
  useEffect(() => {
    if (currentStage !== 'video-analysis' || showVideoAnalysisResult) return;

    const interval = setInterval(() => {
      setVideoAnalysisProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => setShowVideoAnalysisResult(true), 500);
          return 100;
        }
        return prev + 2;
      });
    }, 50);
    return () => clearInterval(interval);
  }, [currentStage, showVideoAnalysisResult]);

  /* --------------------------- Helper Functions --------------------------- */
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}`;
  };

  const startPhoneCall = () => {
    setCurrentStage('phone');
    setIsCallActive(true);
    setConversation([]);
  };

  const endPhoneCall = () => {
    setIsCallActive(false);
    setIsUserSpeaking(false);
    setTimeout(() => {
      setCurrentStage('phone-analysis');
      setAnalysisProgress(0);
      setShowAnalysisResult(false);
    }, 1000);
  };

  const proceedFromAnalysis = () => {
    setCurrentStage('phone-complete');
  };

  const startVideoInterview = () => {
    setCurrentStage('video');
    setIsVideoActive(true);
    setVideoConversation([]);
  };

  const endVideoInterview = () => {
    setIsVideoActive(false);
    setIsVideoUserSpeaking(false);
    setTimeout(() => {
      setCurrentStage('video-analysis');
      setVideoAnalysisProgress(0);
      setShowVideoAnalysisResult(false);
    }, 1000);
  };

  const proceedFromVideoAnalysis = () => {
    setCurrentStage('video-complete');
    setInterviewResult('passed');
    setShowCompletionModal(true);
  };

  const proceedToHR = () => {
    setShowCompletionModal(false);
    setCurrentStage('hr-pending');
  };

  /* -------------------------------------------------------------------------- */
  /*                                 Render JSX                                 */
  /* -------------------------------------------------------------------------- */
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-[#0E1A70] to-gray-900">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="w-10 h-10 flex items-center justify-center text-white/60 hover:text-white transition-colors cursor-pointer"
            >
              <i className="ri-arrow-left-line text-xl"></i>
            </button>
            <div className="border border-white/80 px-2 py-1">
              <span className="text-white text-sm font-bold tracking-wider">SPACE</span>
              <span className="text-white text-sm font-bold">42</span>
            </div>
          </div>
          <div className="text-white/60 text-sm">AI Interview Session</div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Interview Info Card */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-white/10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-[#5147EF] rounded-xl flex items-center justify-center">
              <i className="ri-rocket-line text-white text-2xl"></i>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{interviewData.jobTitle}</h2>
              <p className="text-white/60">
                {interviewData.company} • {interviewData.scheduledTime}
              </p>
            </div>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-4 mb-12">
          {[
            { id: 'prep', label: 'Interview Prep', icon: 'ri-book-read-line' },
            { id: 'phone', label: 'AI Phone Call', icon: 'ri-phone-line' },
            { id: 'video', label: 'AI Video Interview', icon: 'ri-video-chat-line' },
            { id: 'hr', label: 'HR Interview', icon: 'ri-user-voice-line' },
          ].map((step, index) => {
            const completedStages: InterviewStage[] = [
              'intro',
              'phone',
              'phone-analysis',
              'phone-complete',
              'video',
              'video-analysis',
              'video-complete',
              'hr-pending',
            ];
            const isCompleted =
              (step.id === 'prep' && completedStages.includes(currentStage)) ||
              (step.id === 'phone' && ['phone-complete', 'video', 'video-analysis', 'video-complete', 'hr-pending'].includes(currentStage)) ||
              (step.id === 'video' && ['video-complete', 'hr-pending'].includes(currentStage));

            const isCurrent =
              (step.id === 'prep' && currentStage === 'prep') ||
              (step.id === 'phone' && ['intro', 'phone', 'phone-analysis'].includes(currentStage)) ||
              (step.id === 'video' && ['phone-complete', 'video', 'video-analysis'].includes(currentStage)) ||
              (step.id === 'hr' && currentStage === 'hr-pending');

            return (
              <div key={step.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                      isCompleted
                        ? 'bg-green-500'
                        : isCurrent
                        ? 'bg-[#5147EF] ring-4 ring-[#5147EF]/30'
                        : 'bg-white/10'
                    }`}
                  >
                    {isCompleted ? (
                      <i className="ri-check-line text-white text-xl"></i>
                    ) : (
                      <i className={`${step.icon} text-white text-xl`}></i>
                    )}
                  </div>
                  <span
                    className={`text-sm mt-2 ${
                      isCurrent ? 'text-white font-medium' : 'text-white/40'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
                {index < 3 && (
                  <div
                    className={`w-16 h-0.5 mx-3 ${
                      isCompleted ? 'bg-green-500' : 'bg-white/10'
                    }`}
                  ></div>
                )}
              </div>
            );
          })}
        </div>

        {/* ---------------------------------------------------------------------- */}
        {/* --------------------------- Nova Open Style Prep ----------------------- */}
        {/* ---------------------------------------------------------------------- */}

        {currentStage === 'prep' && (
          <div className={`transition-all duration-500 ${animateIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            {/* Nova Avatar & Bubble */}
            <div className="flex items-start gap-4 mb-8">
              <div className="relative flex-shrink-0">
                <div className="w-16 h-16 bg-gradient-to-br from-[#5147EF] to-[#7C3AED] rounded-full flex items-center justify-center shadow-lg shadow-[#5147EF]/30">
                  <i className="ri-sparkling-2-fill text-white text-2xl"></i>
                </div>
                <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-gray-900 flex items-center justify-center">
                  <i className="ri-check-line text-white text-xs"></i>
                </span>
              </div>
              
              {showNovaBubble && (
                <div className="flex-1 max-w-2xl">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-white font-semibold">Nova</span>
                    <span className="text-xs bg-[#5147EF]/30 text-[#A5B4FC] px-2 py-0.5 rounded-full">AI Interview Coach</span>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl rounded-tl-md p-4 border border-white/10">
                    <p className="text-white/90 leading-relaxed">{novaBubbleText}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Greeting Phase */}
            {prepPhase === 'greeting' && !selectedGreeting && (
              <div className="ml-20 space-y-3 animate-fade-in">
                <p className="text-white/60 text-sm mb-4">How are you feeling about the interview?</p>
                <div className="flex flex-wrap gap-3">
                  {[
                    { text: "I'm excited but nervous 😅", emoji: '😅' },
                    { text: "I feel pretty confident 💪", emoji: '💪' },
                    { text: "I'm not sure what to expect 🤔", emoji: '🤔' },
                  ].map((option) => (
                    <button
                      key={option.text}
                      onClick={() => handleGreetingSelect(option.text)}
                      className="bg-white/5 hover:bg-white/10 border border-white/20 hover:border-[#5147EF]/50 text-white px-5 py-3 rounded-full text-sm font-medium transition-all cursor-pointer hover:scale-105 hover:shadow-lg hover:shadow-[#5147EF]/20"
                    >
                      {option.text}
                    </button>
                  ))}
                </div>
                
                {/* Skip Prep Option */}
                <div className="pt-6 border-t border-white/10 mt-6">
                  <p className="text-white/40 text-xs mb-3">Already prepared?</p>
                  <button
                    onClick={() => setCurrentStage('intro')}
                    className="bg-transparent hover:bg-white/5 border border-white/10 hover:border-white/20 text-white/60 hover:text-white px-5 py-2.5 rounded-full text-sm transition-all cursor-pointer flex items-center gap-2"
                  >
                    <i className="ri-skip-forward-line"></i>
                    Skip prep, start interview directly
                  </button>
                </div>
              </div>
            )}

            {/* User's Selected Response */}
            {selectedGreeting && prepPhase !== 'greeting' && (
              <div className="flex justify-end mb-6">
                <div className="bg-emerald-500/20 border border-emerald-500/30 rounded-2xl rounded-tr-md px-4 py-3 max-w-md">
                  <p className="text-emerald-300 text-sm">{selectedGreeting}</p>
                </div>
              </div>
            )}

            {/* Confidence Assessment Phase */}
            {prepPhase === 'confidence' && (
              <div className="mt-8 animate-fade-in">
                <div className="grid gap-4">
                  {confidenceAreas.map((area, idx) => (
                    <div 
                      key={area.id}
                      className="bg-white/5 backdrop-blur-sm rounded-xl p-5 border border-white/10 hover:border-white/20 transition-all"
                      style={{ animationDelay: `${idx * 100}ms` }}
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-[#5147EF]/20 rounded-xl flex items-center justify-center flex-shrink-0">
                          <i className={`${area.icon} text-[#A5B4FC] text-xl`}></i>
                        </div>
                        <div className="flex-1">
                          <h4 className="text-white font-medium mb-1">{area.label}</h4>
                          <p className="text-white/50 text-sm mb-4">{area.description}</p>
                          
                          {/* Confidence Level Selector */}
                          <div className="flex items-center gap-2">
                            <span className="text-white/40 text-xs w-16">Not sure</span>
                            <div className="flex gap-2 flex-1">
                              {[1, 2, 3, 4, 5].map((level) => (
                                <button
                                  key={level}
                                  onClick={() => handleConfidenceSelect(area.id, level)}
                                  className={`flex-1 h-10 rounded-lg font-medium text-sm transition-all cursor-pointer ${
                                    area.level === level
                                      ? level <= 2
                                        ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30'
                                        : level === 3
                                        ? 'bg-yellow-500 text-white shadow-lg shadow-yellow-500/30'
                                        : 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                                      : 'bg-white/10 text-white/60 hover:bg-white/20'
                                  }`}
                                >
                                  {level}
                                </button>
                              ))}
                            </div>
                            <span className="text-white/40 text-xs w-16 text-right">Very confident</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Continue Button */}
                {allConfidenceRated && (
                  <div className="mt-6 flex justify-center animate-fade-in">
                    <button
                      onClick={handleContinueToTips}
                      className="bg-[#5147EF] hover:bg-[#4339D8] text-white px-8 py-4 rounded-xl font-semibold transition-all cursor-pointer flex items-center gap-3 shadow-lg shadow-[#5147EF]/30 hover:scale-105"
                    >
                      <span>Get Personalized Tips</span>
                      <i className="ri-arrow-right-line"></i>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Tips Phase */}
            {prepPhase === 'tips' && showTips && (
              <div className="mt-8 space-y-6 animate-fade-in">
                {/* Weak Areas - Priority Tips */}
                {getWeakAreas().length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-8 h-8 bg-amber-500/20 rounded-lg flex items-center justify-center">
                        <i className="ri-focus-3-line text-amber-400"></i>
                      </div>
                      <h3 className="text-white font-semibold">Focus Areas</h3>
                      <span className="text-amber-400 text-xs bg-amber-500/20 px-2 py-0.5 rounded-full">Priority</span>
                    </div>
                    <div className="grid gap-3">
                      {getWeakAreas().map((area) => {
                        const tip = prepTips.find(t => 
                          (area.id === 'technical' && t.title.includes('Technical')) ||
                          (area.id === 'company' && t.title.includes('Space42')) ||
                          (area.id === 'leadership' && t.title.includes('Leadership')) ||
                          (area.id === 'problem' && t.title.includes('Industry'))
                        ) || prepTips[0];
                        
                        return (
                          <div key={area.id} className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
                            <div className="flex items-start gap-3">
                              <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                                <i className={`${area.icon} text-amber-400`}></i>
                              </div>
                              <div>
                                <h4 className="text-white font-medium text-sm mb-1">{area.label}</h4>
                                <p className="text-white/60 text-xs leading-relaxed">{tip.description}</p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Common Questions */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 bg-[#5147EF]/20 rounded-lg flex items-center justify-center">
                      <i className="ri-question-answer-line text-[#A5B4FC]"></i>
                    </div>
                    <h3 className="text-white font-semibold">Common Questions</h3>
                  </div>
                  <div className="grid gap-3">
                    {commonQuestions.slice(0, 3).map((item, idx) => (
                      <div key={idx} className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all">
                        <div className="flex items-start gap-3">
                          <span className="w-7 h-7 bg-[#5147EF] rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                            {idx + 1}
                          </span>
                          <div>
                            <p className="text-white font-medium text-sm mb-2">"{item.question}"</p>
                            <div className="flex items-start gap-2 bg-white/5 rounded-lg p-3">
                              <i className="ri-lightbulb-flash-line text-yellow-400 text-sm mt-0.5"></i>
                              <p className="text-white/60 text-xs">{item.tip}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* General Tips */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                      <i className="ri-lightbulb-line text-emerald-400"></i>
                    </div>
                    <h3 className="text-white font-semibold">Quick Tips</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {prepTips.map((tip, idx) => (
                      <div key={idx} className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-8 h-8 bg-[#5147EF]/20 rounded-lg flex items-center justify-center">
                            <i className={`${tip.icon} text-[#A5B4FC] text-sm`}></i>
                          </div>
                          <h4 className="text-white font-medium text-sm">{tip.title}</h4>
                        </div>
                        <p className="text-white/50 text-xs leading-relaxed line-clamp-2">{tip.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Continue Button */}
                <div className="flex justify-center pt-4">
                  <button
                    onClick={handleContinueToChecklist}
                    className="bg-[#5147EF] hover:bg-[#4339D8] text-white px-8 py-4 rounded-xl font-semibold transition-all cursor-pointer flex items-center gap-3 shadow-lg shadow-[#5147EF]/30 hover:scale-105"
                  >
                    <span>Continue to Checklist</span>
                    <i className="ri-arrow-right-line"></i>
                  </button>
                </div>
              </div>
            )}

            {/* Checklist Phase */}
            {prepPhase === 'checklist' && (
              <div className="mt-8 animate-fade-in">
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#5147EF]/20 rounded-xl flex items-center justify-center">
                        <i className="ri-checkbox-multiple-line text-[#A5B4FC] text-xl"></i>
                      </div>
                      <div>
                        <h3 className="text-white font-semibold">Pre-Interview Checklist</h3>
                        <p className="text-white/50 text-sm">Make sure everything is ready</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[#A5B4FC] font-bold">{completedCount}/{checklist.length}</span>
                      <div className="w-24 bg-white/10 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-[#5147EF] to-[#7C3AED] h-2 rounded-full transition-all duration-300"
                          style={{ width: `${(completedCount / checklist.length) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {checklist.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => toggleChecklistItem(item.id)}
                        className={`flex items-center gap-3 p-4 rounded-xl transition-all cursor-pointer text-left ${
                          item.checked
                            ? 'bg-emerald-500/20 border border-emerald-500/30'
                            : 'bg-white/5 border border-white/10 hover:bg-white/10'
                        }`}
                      >
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors flex-shrink-0 ${
                            item.checked ? 'bg-emerald-500' : 'bg-white/20'
                          }`}
                        >
                          {item.checked && (
                            <i className="ri-check-line text-white text-sm"></i>
                          )}
                        </div>
                        <span
                          className={`text-sm ${
                            item.checked
                              ? 'text-emerald-300 line-through'
                              : 'text-white/80'
                          }`}
                        >
                          {item.text}
                        </span>
                      </button>
                    ))}
                  </div>

                  {completedCount === checklist.length && (
                    <div className="mt-6 p-4 bg-emerald-500/20 rounded-xl border border-emerald-500/30 flex items-center gap-3">
                      <i className="ri-checkbox-circle-fill text-emerald-400 text-xl"></i>
                      <span className="text-emerald-300 font-medium">All items completed! You're ready!</span>
                    </div>
                  )}
                </div>

                {/* Continue Button */}
                <div className="flex justify-center mt-6">
                  <button
                    onClick={handleReadyToStart}
                    className="bg-[#5147EF] hover:bg-[#4339D8] text-white px-8 py-4 rounded-xl font-semibold transition-all cursor-pointer flex items-center gap-3 shadow-lg shadow-[#5147EF]/30 hover:scale-105"
                  >
                    <span>I'm Ready!</span>
                    <i className="ri-arrow-right-line"></i>
                  </button>
                </div>
              </div>
            )}

            {/* Ready Phase */}
            {prepPhase === 'ready' && (
              <div className="mt-8 text-center animate-fade-in">
                <div className="bg-gradient-to-br from-emerald-500/20 to-[#5147EF]/20 rounded-2xl p-8 border border-white/10 max-w-lg mx-auto">
                  <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <i className="ri-rocket-2-line text-emerald-400 text-4xl"></i>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">You're All Set! 🎉</h3>
                  <p className="text-white/60 mb-8">
                    Remember: be yourself, speak clearly, and take your time with answers. Good luck!
                  </p>
                  <button
                    onClick={() => setCurrentStage('intro')}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white px-10 py-4 rounded-xl font-semibold transition-all cursor-pointer flex items-center gap-3 mx-auto shadow-lg shadow-emerald-500/30 hover:scale-105"
                  >
                    <i className="ri-play-circle-line text-xl"></i>
                    <span>Start Interview</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Main Content – all stages except prep */}
        {currentStage !== 'prep' && (
          <div className="bg-white rounded-2xl overflow-hidden shadow-2xl">
            {/* Intro Stage */}
            {currentStage === 'intro' && (
              <div className="p-12 text-center">
                <div className="w-24 h-24 bg-[#5147EF]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <i className="ri-phone-line text-[#5147EF] text-4xl"></i>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Ready for AI Phone Screening?
                </h3>
                <p className="text-gray-600 max-w-md mx-auto mb-8">
                  Our AI assistant will conduct a brief phone screening to learn more about your
                  qualifications. This typically takes 5-10 minutes.
                </p>
                <div className="bg-gray-50 rounded-xl p-6 max-w-md mx-auto mb-8">
                  <h4 className="font-semibold text-gray-900 mb-3">What to expect:</h4>
                  <ul className="text-left text-sm text-gray-600 space-y-2">
                    <li className="flex items-center gap-2">
                      <i className="ri-check-line text-green-500"></i>
                      Questions about your background and experience
                    </li>
                    <li className="flex items-center gap-2">
                      <i className="ri-check-line text-green-500"></i>
                      Discussion of your interest in the role
                    </li>
                    <li className="flex items-center gap-2">
                      <i className="ri-check-line text-green-500"></i>
                      Opportunity to ask questions
                    </li>
                  </ul>
                </div>
                <div className="flex items-center justify-center gap-4">
                  <button
                    onClick={() => setCurrentStage('prep')}
                    className="bg-gray-100 text-gray-700 px-6 py-4 rounded-xl font-semibold hover:bg-gray-200 transition-all cursor-pointer whitespace-nowrap flex items-center gap-2"
                  >
                    <i className="ri-arrow-left-line"></i>
                    Back to Prep
                  </button>
                  <button
                    onClick={startPhoneCall}
                    className="bg-[#5147EF] text-white px-8 py-4 rounded-xl font-semibold hover:bg-[#4339D8] transition-all cursor-pointer whitespace-nowrap flex items-center gap-3"
                  >
                    <i className="ri-phone-line text-xl"></i>
                    Start AI Phone Call
                  </button>
                </div>
              </div>
            )}

            {/* Phone Call Stage */}
            {currentStage === 'phone' && (
              <div className="p-12">
                <div className="text-center mb-8">
                  <div
                    className={`w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-6 ${
                      isCallActive ? 'bg-green-500 animate-pulse' : 'bg-gray-200'
                    }`}
                  >
                    <i
                      className={`ri-phone-line text-white text-5xl ${
                        isCallActive ? 'animate-bounce' : ''
                      }`}
                    ></i>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {isCallActive ? 'Call in Progress' : 'Connecting...'}
                  </h3>
                  <p className="text-3xl font-mono text-[#5147EF]">{formatTime(callDuration)}</p>
                </div>

                {/* Transcript */}
                <div className="bg-gray-50 rounded-xl p-6 max-h-80 overflow-y-auto mb-8">
                  <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <i className="ri-chat-voice-line text-[#5147EF]"></i>
                    Live Transcript
                  </h4>
                  <div className="space-y-4">
                    {conversation.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                      >
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                            msg.role === 'ai' ? 'bg-[#5147EF]' : 'bg-emerald-500'
                          }`}
                        >
                          <i
                            className={`${
                              msg.role === 'ai' ? 'ri-robot-line' : 'ri-user-line'
                            } text-white text-sm`}
                          ></i>
                        </div>
                        <div className={`max-w-[80%] ${msg.role === 'user' ? 'text-right' : ''}`}>
                          <span
                            className={`text-xs font-medium mb-1 block ${
                              msg.role === 'ai' ? 'text-[#5147EF]' : 'text-emerald-600'
                            }`}
                          >
                            {msg.role === 'ai' ? 'AI Interviewer' : 'You'}
                          </span>
                          <p
                            className={`text-gray-700 text-sm rounded-lg p-3 shadow-sm ${
                              msg.role === 'ai' ? 'bg-white' : 'bg-emerald-50'
                            }`}
                          >
                            {msg.text}
                          </p>
                        </div>
                      </div>
                    ))}

                    {isCallActive && (
                      <div
                        className={`flex items-center gap-2 ${
                          isUserSpeaking ? 'justify-end' : ''
                        }`}
                      >
                        <div className="flex gap-1">
                          <span
                            className={`w-2 h-2 rounded-full animate-bounce ${
                              isUserSpeaking ? 'bg-emerald-500' : 'bg-[#5147EF]'
                            }`}
                          ></span>
                          <span
                            className={`w-2 h-2 rounded-full animate-bounce ${
                              isUserSpeaking ? 'bg-emerald-500' : 'bg-[#5147EF]'
                            }`}
                            style={{ animationDelay: '0.1s' }}
                          ></span>
                          <span
                            className={`w-2 h-2 rounded-full animate-bounce ${
                              isUserSpeaking ? 'bg-emerald-500' : 'bg-[#5147EF]'
                            }`}
                            style={{ animationDelay: '0.2s' }}
                          ></span>
                        </div>
                        <span
                          className={`text-sm ${
                            isUserSpeaking ? 'text-emerald-600' : 'text-gray-400'
                          }`}
                        >
                          {isUserSpeaking ? 'You are speaking...' : 'AI is listening...'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-center">
                  <button
                    onClick={endPhoneCall}
                    className="bg-red-500 text-white px-8 py-4 rounded-full font-semibold hover:bg-red-600 transition-all cursor-pointer whitespace-nowrap flex items-center gap-3"
                  >
                    <i className="ri-phone-fill text-xl"></i>
                    End Call
                  </button>
                </div>
              </div>
            )}

            {/* Phone Analysis Stage */}
            {currentStage === 'phone-analysis' && (
              <div className="p-12">
                {!showAnalysisResult ? (
                  <div className="text-center">
                    <div className="w-24 h-24 bg-[#5147EF]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                      <i className="ri-brain-line text-[#5147EF] text-4xl animate-pulse"></i>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">
                      Analyzing Your Interview
                    </h3>
                    <p className="text-gray-600 max-w-md mx-auto mb-8">
                      Our AI is reviewing your responses and generating personalized feedback...
                    </p>
                    <div className="max-w-md mx-auto">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-500">Processing</span>
                        <span className="text-sm font-medium text-[#5147EF]">
                          {analysisProgress}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-gradient-to-r from-[#5147EF] to-[#7C3AED] h-3 rounded-full transition-all duration-100"
                          style={{ width: `${analysisProgress}%` }}
                        ></div>
                      </div>
                      <div className="mt-4 flex items-center justify-center gap-6 text-sm text-gray-500">
                        <span className={analysisProgress > 20 ? 'text-green-500' : ''}>
                          <i className="ri-check-line mr-1"></i>Speech Analysis
                        </span>
                        <span className={analysisProgress > 50 ? 'text-green-500' : ''}>
                          <i className="ri-check-line mr-1"></i>Content Review
                        </span>
                        <span className={analysisProgress > 80 ? 'text-green-500' : ''}>
                          <i className="ri-check-line mr-1"></i>Generating Report
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    {/* Result Header */}
                    <div className="text-center mb-8">
                      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i className="ri-checkbox-circle-fill text-green-500 text-4xl"></i>
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">
                        Interview Passed!
                      </h3>
                      <p className="text-gray-600">
                        Great job! Here's your detailed performance analysis.
                      </p>
                    </div>

                    {/* Score Card */}
                    <div className="bg-gradient-to-r from-[#5147EF] to-[#7C3AED] rounded-xl p-6 mb-8 text-white">
                      <div className="grid grid-cols-3 gap-6">
                        <div className="text-center">
                          <p className="text-white/80 text-sm mb-1">Overall Score</p>
                          <p className="text-4xl font-bold">87/100</p>
                        </div>
                        <div className="text-center border-l border-r border-white/20">
                          <p className="text-white/80 text-sm mb-1">Performance Grade</p>
                          <p className="text-4xl font-bold">A</p>
                        </div>
                        <div className="text-center">
                          <p className="text-white/80 text-sm mb-1">Call Duration</p>
                          <p className="text-2xl font-bold">{formatTime(callDuration)}</p>
                        </div>
                      </div>
                    </div>

                    {/* Score Breakdown */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
                      <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <i className="ri-bar-chart-box-line text-[#5147EF]"></i>
                        Score Breakdown
                      </h4>
                      <div className="space-y-4">
                        {scoreBreakdown.map((item, idx) => {
                          const percentage = (item.score / item.maxScore) * 100;
                          const isPositive = item.status === 'excellent' || item.status === 'good';
                          return (
                            <div key={idx}>
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <i
                                    className={`${item.icon} ${
                                      isPositive ? 'text-green-500' : 'text-amber-500'
                                    }`}
                                  ></i>
                                  <span className="text-sm font-medium text-gray-700">
                                    {item.category}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span
                                    className={`text-sm font-bold ${
                                      item.status === 'excellent'
                                        ? 'text-green-600'
                                        : item.status === 'good'
                                        ? 'text-blue-600'
                                        : 'text-amber-600'
                                    }`}
                                  >
                                    {isPositive ? '+' : ''}
                                    {item.score}
                                  </span>
                                  <span className="text-sm text-gray-400">
                                    / {item.maxScore}
                                  </span>
                                </div>
                              </div>
                              <div className="w-full bg-gray-100 rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full transition-all ${
                                    item.status === 'excellent'
                                      ? 'bg-green-500'
                                      : item.status === 'good'
                                      ? 'bg-blue-500'
                                      : 'bg-amber-500'
                                  }`}
                                  style={{ width: `${percentage}%` }}
                                ></div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700">
                            Total Score
                          </span>
                          <span className="text-2xl font-bold text-[#5147EF]">
                            87 / 100
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Feedback */}
                    <div className="space-y-4 mb-8">
                      {/* Strengths */}
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <i className="ri-thumb-up-line text-green-500"></i>
                          What You Did Well
                        </h4>
                        <div className="space-y-3">
                          {analysisFeedback
                            .filter((f) => f.status === 'strength')
                            .map((item, idx) => (
                              <div
                                key={idx}
                                className="bg-green-50 border border-green-100 rounded-xl p-4"
                              >
                                <div className="flex items-start gap-3">
                                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <i className={`${item.icon} text-green-600`}></i>
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
                                        {item.category}
                                      </span>
                                    </div>
                                    <p className="font-medium text-gray-900 text-sm">
                                      {item.title}
                                    </p>
                                    <p className="text-gray-600 text-xs mt-1">
                                      {item.reason}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>

                      {/* Areas to Improve */}
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <i className="ri-lightbulb-line text-amber-500"></i>
                          Areas to Improve
                        </h4>
                        <div className="space-y-3">
                          {analysisFeedback
                            .filter((f) => f.status === 'improve')
                            .map((item, idx) => (
                              <div
                                key={idx}
                                className="bg-amber-50 border border-amber-100 rounded-xl p-4"
                              >
                                <div className="flex items-start gap-3">
                                  <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <i className={`${item.icon} text-amber-600`}></i>
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="text-xs font-medium text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">
                                        {item.category}
                                      </span>
                                    </div>
                                    <p className="font-medium text-gray-900 text-sm">
                                      {item.title}
                                    </p>
                                    <p className="text-gray-600 text-xs mt-1">
                                      {item.reason}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    </div>

                    {/* Next Step */}
                    <div className="text-center">
                      <button
                        onClick={proceedFromAnalysis}
                        className="bg-[#5147EF] text-white px-8 py-4 rounded-xl font-semibold hover:bg-[#4339D8] transition-all cursor-pointer whitespace-nowrap flex items-center gap-3 mx-auto"
                      >
                        <i className="ri-arrow-right-line text-xl"></i>
                        Continue to Next Step
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Phone Complete Stage */}
            {currentStage === 'phone-complete' && (
              <div className="p-12 text-center">
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <i className="ri-check-line text-green-500 text-4xl"></i>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Phone Screening Complete!
                </h3>
                <p className="text-gray-600 max-w-md mx-auto mb-8">
                  Great job! You've passed the AI phone screening. The the next step is a
                  video interview to assess your technical skills.
                </p>
                <div className="bg-[#5147EF]/5 rounded-xl p-6 max-w-md mx-auto mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-gray-600">Phone Screening</span>
                    <span className="text-green-500 font-semibold flex items-center gap-1">
                      <i className="ri-check-circle-fill"></i> Passed
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Duration</span>
                    <span className="text-gray-900 font-medium">
                      {formatTime(callDuration)}
                    </span>
                  </div>
                </div>
                <button
                  onClick={startVideoInterview}
                  className="bg-[#5147EF] text-white px-8 py-4 rounded-xl font-semibold hover:bg-[#4339D8] transition-all cursor-pointer whitespace-nowrap flex items-center gap-3 mx-auto"
                >
                  <i className="ri-video-chat-line text-xl"></i>
                  Continue to Video Interview
                </button>
              </div>
            )}

            {/* Video Interview Stage */}
            {currentStage === 'video' && (
              <div className="p-8">
                <div className="grid grid-cols-2 gap-6 mb-8">
                  {/* AI Feed */}
                  <div className="relative aspect-video bg-gradient-to-br from-[#0E1A70] to-[#5147EF] rounded-xl overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                          <i className="ri-robot-line text-white text-3xl"></i>
                        </div>
                        <p className="text-white font-medium">AI Interviewer</p>
                      </div>
                    </div>
                    {isVideoActive && !isVideoUserSpeaking && (
                      <div className="absolute bottom-4 left-4 flex items-center gap-2">
                        <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
                        <span className="text-white text-sm">Speaking...</span>
                      </div>
                    )}
                  </div>

                  {/* User Feed */}
                  <div className="relative aspect-video bg-gray-900 rounded-xl overflow-hidden">
                    <img
                      src="https://readdy.ai/api/search-image?query=Professional%20person%20in%20video%20call%20interview%20setting%20with%20clean%20background%20looking%20at%20camera%20confident%20expression%20business%20casual%20attire%20good%20lighting%20home%20office%20environment&width=400&height=300&seq=interview1&orientation=landscape"
                      alt="Your video"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-4 left-4 bg-black/50 px-3 py-1 rounded-full">
                      <span className="text-white text-sm">You</span>
                    </div>
                    {isVideoUserSpeaking && (
                      <div className="absolute bottom-4 right-4 flex items-center gap-2 bg-emerald-500/80 px-3 py-1 rounded-full">
                        <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                        <span className="text-white text-sm">Speaking...</span>
                      </div>
                    )}
                    <div className="absolute top-4 right-4 flex items-center gap-2">
                      <button className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors cursor-pointer">
                        <i className="ri-mic-line"></i>
                      </button>
                      <button className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors cursor-pointer">
                        <i className="ri-camera-line"></i>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Video Transcript */}
                <div className="bg-gray-50 rounded-xl p-6 max-h-64 overflow-y-auto mb-6">
                  <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <i className="ri-video-chat-line text-[#5147EF]"></i>
                    Live Transcript
                  </h4>
                  <div className="space-y-4">
                    {videoConversation.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                      >
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                            msg.role === 'ai' ? 'bg-[#5147EF]' : 'bg-emerald-500'
                          }`}
                        >
                          <i
                            className={`${
                              msg.role === 'ai' ? 'ri-robot-line' : 'ri-user-line'
                            } text-white text-sm`}
                          ></i>
                        </div>
                        <div className={`max-w-[80%] ${msg.role === 'user' ? 'text-right' : ''}`}>
                          <span
                            className={`text-xs font-medium mb-1 block ${
                              msg.role === 'ai' ? 'text-[#5147EF]' : 'text-emerald-600'
                            }`}
                          >
                            {msg.role === 'ai' ? 'AI Interviewer' : 'You'}
                          </span>
                          <p
                            className={`text-gray-700 text-sm rounded-lg p-3 shadow-sm ${
                              msg.role === 'ai' ? 'bg-white' : 'bg-emerald-50'
                            }`}
                          >
                            {msg.text}
                          </p>
                        </div>
                      </div>
                    ))}

                    {isVideoActive && (
                      <div
                        className={`flex items-center gap-2 ${
                          isVideoUserSpeaking ? 'justify-end' : ''
                        }`}
                      >
                        <div className="flex gap-1">
                          <span
                            className={`w-2 h-2 rounded-full animate-bounce ${
                              isVideoUserSpeaking ? 'bg-emerald-500' : 'bg-[#5147EF]'
                            }`}
                          ></span>
                          <span
                            className={`w-2 h-2 rounded-full animate-bounce ${
                              isVideoUserSpeaking ? 'bg-emerald-500' : 'bg-[#5147EF]'
                            }`}
                            style={{ animationDelay: '0.1s' }}
                          ></span>
                          <span
                            className={`w-2 h-2 rounded-full animate-bounce ${
                              isVideoUserSpeaking ? 'bg-emerald-500' : 'bg-[#5147EF]'
                            }`}
                            style={{ animationDelay: '0.2s' }}
                          ></span>
                        </div>
                        <span
                          className={`text-sm ${
                            isVideoUserSpeaking ? 'text-emerald-600' : 'text-gray-400'
                          }`}
                        >
                          {isVideoUserSpeaking ? 'You are speaking...' : 'AI is listening...'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Recording Indicator */}
                <div className="bg-gray-50 rounded-xl p-4 mb-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
                      <span className="font-medium text-gray-900">Recording</span>
                    </div>
                    <span className="text-2xl font-mono text-[#5147EF]">
                      {formatTime(videoDuration)}
                    </span>
                  </div>
                </div>

                <div className="flex justify-center">
                  <button
                    onClick={endVideoInterview}
                    className="bg-red-500 text-white px-8 py-4 rounded-full font-semibold hover:bg-red-600 transition-all cursor-pointer whitespace-nowrap flex items-center gap-3"
                  >
                    <i className="ri-stop-circle-line text-xl"></i>
                    End Interview
                  </button>
                </div>
              </div>
            )}

            {/* Video Analysis Stage */}
            {currentStage === 'video-analysis' && (
              <div className="p-12">
                {!showVideoAnalysisResult ? (
                  <div className="text-center">
                    <div className="w-24 h-24 bg-[#5147EF]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                      <i className="ri-video-chat-line text-[#5147EF] text-4xl animate-pulse"></i>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">
                      Analyzing Your Video Interview
                    </h3>
                    <p className="text-gray-600 max-w-md mx-auto mb-8">
                      Our AI is reviewing your technical responses and presentation skills...
                    </p>
                    <div className="max-w-md mx-auto">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-500">Processing</span>
                        <span className="text-sm font-medium text-[#5147EF]">
                          {videoAnalysisProgress}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-gradient-to-r from-[#5147EF] to-[#7C3AED] h-3 rounded-full transition-all duration-100"
                          style={{ width: `${videoAnalysisProgress}%` }}
                        ></div>
                      </div>
                      <div className="mt-4 flex items-center justify-center gap-6 text-sm text-gray-500">
                        <span
                          className={videoAnalysisProgress > 20 ? 'text-green-500' : ''}
                        >
                          <i className="ri-check-line mr-1"></i>Video Analysis
                        </span>
                        <span
                          className={videoAnalysisProgress > 50 ? 'text-green-500' : ''}
                        >
                          <i className="ri-check-line mr-1"></i>Technical Review
                        </span>
                        <span
                          className={videoAnalysisProgress > 80 ? 'text-green-500' : ''}
                        >
                          <i className="ri-check-line mr-1"></i>Generating Report
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    {/* Result Header */}
                    <div className="text-center mb-8">
                      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i className="ri-checkbox-circle-fill text-green-500 text-4xl"></i>
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">
                        Video Interview Passed!
                      </h3>
                      <p className="text-gray-600">
                        Excellent performance! Here's your detailed technical assessment.
                      </p>
                    </div>

                    {/* Score Card */}
                    <div className="bg-gradient-to-r from-[#5147EF] to-[#7C3AED] rounded-xl p-6 mb-8 text-white">
                      <div className="grid grid-cols-3 gap-6">
                        <div className="text-center">
                          <p className="text-white/80 text-sm mb-1">Overall Score</p>
                          <p className="text-4xl font-bold">92/100</p>
                        </div>
                        <div className="text-center border-l border-r border-white/20">
                          <p className="text-white/80 text-sm mb-1">Performance Grade</p>
                          <p className="text-4xl font-bold">A+</p>
                        </div>
                        <div className="text-center">
                          <p className="text-white/80 text-sm mb-1">Interview Duration</p>
                          <p className="text-2xl font-bold">{formatTime(videoDuration)}</p>
                        </div>
                      </div>
                    </div>

                    {/* Score Breakdown */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
                      <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <i className="ri-bar-chart-box-line text-[#5147EF]"></i>
                        Score Breakdown
                      </h4>
                      <div className="space-y-4">
                        {videoScoreBreakdown.map((item, idx) => {
                          const percentage = Math.min(
                            (item.score / item.maxScore) * 100,
                            100
                          );
                          const isPositive =
                            item.status === 'excellent' || item.status === 'good';
                          return (
                            <div key={idx}>
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <i
                                    className={`${item.icon} ${
                                      isPositive ? 'text-green-500' : 'text-amber-500'
                                    }`}
                                  ></i>
                                  <span className="text-sm font-medium text-gray-700">
                                    {item.category}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span
                                    className={`text-sm font-bold ${
                                      item.status === 'excellent'
                                        ? 'text-green-600'
                                        : item.status === 'good'
                                        ? 'text-blue-600'
                                        : 'text-amber-600'
                                    }`}
                                  >
                                    {isPositive ? '+' : ''}
                                    {item.score}
                                  </span>
                                  <span className="text-sm text-gray-400">
                                    / {item.maxScore}
                                  </span>
                                </div>
                              </div>
                              <div className="w-full bg-gray-100 rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full transition-all ${
                                    item.status === 'excellent'
                                      ? 'bg-green-500'
                                      : item.status === 'good'
                                      ? 'bg-blue-500'
                                      : 'bg-amber-500'
                                  }`}
                                  style={{ width: `${percentage}%` }}
                                ></div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700">
                            Total Score
                          </span>
                          <span className="text-2xl font-bold text-[#5147EF]">
                            92 / 100
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Feedback */}
                    <div className="space-y-4 mb-8">
                      {/* Strengths */}
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <i className="ri-thumb-up-line text-green-500"></i>
                          What You Did Well
                        </h4>
                        <div className="space-y-3">
                          {videoAnalysisFeedback
                            .filter((f) => f.status === 'strength')
                            .map((item, idx) => (
                              <div
                                key={idx}
                                className="bg-green-50 border border-green-100 rounded-xl p-4"
                              >
                                <div className="flex items-start gap-3">
                                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <i className={`${item.icon} text-green-600`}></i>
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
                                        {item.category}
                                      </span>
                                    </div>
                                    <p className="font-medium text-gray-900 text-sm">
                                      {item.title}
                                    </p>
                                    <p className="text-gray-600 text-xs mt-1">
                                      {item.reason}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>

                      {/* Areas to Improve */}
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <i className="ri-lightbulb-line text-amber-500"></i>
                          Areas to Improve
                        </h4>
                        <div className="space-y-3">
                          {videoAnalysisFeedback
                            .filter((f) => f.status === 'improve')
                            .map((item, idx) => (
                              <div
                                key={idx}
                                className="bg-amber-50 border border-amber-100 rounded-xl p-4"
                              >
                                <div className="flex items-start gap-3">
                                  <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <i className={`${item.icon} text-amber-600`}></i>
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="text-xs font-medium text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">
                                        {item.category}
                                      </span>
                                    </div>
                                    <p className="font-medium text-gray-900 text-sm">
                                      {item.title}
                                    </p>
                                    <p className="text-gray-600 text-xs mt-1">
                                      {item.reason}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    </div>

                    {/* Next Step */}
                    <div className="text-center">
                      <button
                        onClick={proceedFromVideoAnalysis}
                        className="bg-[#5147EF] text-white px-8 py-4 rounded-xl font-semibold hover:bg-[#4339D8] transition-all cursor-pointer whitespace-nowrap flex items-center gap-3 mx-auto"
                      >
                        <i className="ri-arrow-right-line text-xl"></i>
                        View Final Results
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Video Complete Stage */}
            {currentStage === 'video-complete' && (
              <div className="p-12 text-center">
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <i className="ri-check-line text-green-500 text-4xl"></i>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Video Interview Complete!
                </h3>
                <p className="text-gray-600 max-w-md mx-auto mb-8">
                  Excellent work! You've successfully completed the AI video interview.
                  Your application will now be reviewed by our HR team.
                </p>
                <div className="bg-[#5147EF]/5 rounded-xl p-6 max-w-md mx-auto mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-gray-600">Video Interview</span>
                    <span className="text-green-500 font-semibold flex items-center gap-1">
                      <i className="ri-check-circle-fill"></i> Passed
                    </span>
                  </div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-gray-600">Score</span>
                    <span className="text-[#5147EF] font-bold">92/100 (A+)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Duration</span>
                    <span className="text-gray-900 font-medium">
                      {formatTime(videoDuration)}
                    </span>
                  </div>
                </div>
                <button
                  onClick={proceedToHR}
                  className="bg-[#5147EF] text-white px-8 py-4 rounded-xl font-semibold hover:bg-[#4339D8] transition-all cursor-pointer whitespace-nowrap flex items-center gap-3 mx-auto"
                >
                  <i className="ri-arrow-right-line text-xl"></i>
                  Continue
                </button>
              </div>
            )}

            {/* HR Pending Stage */}
            {currentStage === 'hr-pending' && (
              <div className="p-12 text-center">
                <div className="w-24 h-24 bg-[#5147EF]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <i className="ri-user-voice-line text-[#5147EF] text-4xl"></i>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  AI Interviews Complete!
                </h3>
                <p className="text-gray-600 max-w-md mx-auto mb-8">
                  Congratulations! You've successfully completed both AI screening rounds.
                  Your application has been forwarded to our HR team for the final interview.
                </p>

                <div className="bg-gray-50 rounded-xl p-6 max-w-md mx-auto mb-8">
                  <h4 className="font-semibold text-gray-900 mb-4">Interview Summary</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 flex items-center gap-2">
                        <i className="ri-phone-line text-[#5147EF]"></i>
                        AI Phone Screening
                      </span>
                      <span className="text-green-500 font-semibold flex items-center gap-1">
                        <i className="ri-check-circle-fill"></i> Passed
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 flex items-center gap-2">
                        <i className="ri-video-chat-line text-[#5147EF]"></i>
                        AI Video Interview
                      </span>
                      <span className="text-green-500 font-semibold flex items-center gap-1">
                        <i className="ri-check-circle-fill"></i> Passed
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 flex items-center gap-2">
                        <i className="ri-user-voice-line text-[#5147EF]"></i>
                        HR Interview
                      </span>
                      <span className="text-yellow-500 font-semibold flex items-center gap-1">
                        <i className="ri-time-line"></i> Pending
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 max-w-md mx-auto mb-8">
                  <p className="text-yellow-800 text-sm">
                    <i className="ri-information-line mr-2"></i>
                    Our HR team will contact you within 2-3 business days to schedule the final interview.
                  </p>
                </div>

                <button
                  onClick={() => navigate('/dashboard')}
                  className="bg-[#5147EF] text-white px-8 py-4 rounded-xl font-semibold hover:bg-[#4339D8] transition-all cursor-pointer whitespace-nowrap flex items-center gap-3 mx-auto"
                >
                  <i className="ri-dashboard-line text-xl"></i>
                  Back to Dashboard
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Completion Modal */}
      {showCompletionModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-8 text-center animate-bounce-in">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="ri-trophy-line text-green-500 text-4xl"></i>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Excellent Performance!
            </h3>
            <p className="text-gray-600 mb-6">
              You've successfully passed both AI screening rounds. Your application will now be reviewed by our HR team.
            </p>
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-[#5147EF]">92%</p>
                <p className="text-sm text-gray-500">Match Score</p>
              </div>
              <div className="w-px h-12 bg-gray-200"></div>
              <div className="text-center">
                <p className="text-3xl font-bold text-green-500">A+</p>
                <p className="text-sm text-gray-500">Interview Grade</p>
              </div>
            </div>
            <button
              onClick={proceedToHR}
              className="w-full bg-[#5147EF] text-white py-4 rounded-xl font-semibold hover:bg-[#4339D8] transition-all cursor-pointer whitespace-nowrap"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* Add fade-in animation */}
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.4s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
