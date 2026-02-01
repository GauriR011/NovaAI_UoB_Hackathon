import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { extractTextFromPDF } from '../../lib/pdfParser';
import { matchResumeWithJobs } from '../../lib/resumeMatcher';

interface UserProfile {
  name?: string;
  experience?: string;
  skills?: string[];
  interests?: string[];
  workStyle?: string;
  availability?: string;
}

type StepType = 'welcome' | 'has-cv' | 'upload-cv' | 'analyzing' | 'no-cv-intro' | 'name' | 'experience' | 'skills' | 'interests' | 'workStyle' | 'availability' | 'generating' | 'complete';

export default function BriefingPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<StepType>('welcome');
  const [previousStep, setPreviousStep] = useState<StepType | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile>({});
  const [novaMessage, setNovaMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showCards, setShowCards] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);

  // Nova 的消息内容
  const novaMessages: Record<StepType, string> = {
    'welcome': "Hey there! 👋 I'm Nova, your career companion at Space42. I'm here to help you find your perfect role — no pressure, just a friendly chat. Ready to get started?",
    'has-cv': "First things first — do you have a resume or CV ready? Either way is totally fine! 📄",
    'upload-cv': "Awesome! Just drop your CV here and I'll analyze it to find the best matches for you. ✨",
    'analyzing': "Perfect! Let me take a look... 🔍",
    'no-cv-intro': "No worries at all! Let's build your profile together through a few quick questions. It'll only take a couple of minutes, and I promise to make it fun! 🚀",
    'name': "Let's start simple — what should I call you?",
    'experience': "Nice to meet you! 🌟 What's your background? What kind of work have you been doing?",
    'skills': "That's impressive! Now, what are your superpowers? Pick the skills you're most confident in:",
    'interests': "Love it! What aspects of space technology excite you the most? Pick as many as you like:",
    'workStyle': "Almost there! What's your ideal work environment?",
    'availability': "Last one! When could you start a new adventure?",
    'generating': "Amazing! Let me create your profile and find some perfect matches... ✨",
    'complete': "All done! 🎉 I've created your profile and found some exciting opportunities that match your background. Ready to explore?"
  };

  // 打字效果
  const typeMessage = (message: string) => {
    setIsTyping(true);
    setShowCards(false);
    setNovaMessage('');
    
    let index = 0;
    const interval = setInterval(() => {
      if (index < message.length) {
        setNovaMessage(message.substring(0, index + 1));
        index++;
      } else {
        clearInterval(interval);
        setIsTyping(false);
        setTimeout(() => setShowCards(true), 300);
      }
    }, 15);
  };

  // 返回上一步
  const goBack = () => {
    const stepOrder: StepType[] = ['welcome', 'has-cv', 'no-cv-intro', 'name', 'experience', 'skills', 'interests', 'workStyle', 'availability'];
    const currentIndex = stepOrder.indexOf(currentStep);
    
    if (currentStep === 'upload-cv') {
      setCurrentStep('has-cv');
      return;
    }
    
    if (currentIndex > 0) {
      const prevStep = stepOrder[currentIndex - 1];
      setCurrentStep(prevStep);
    }
  };

  // 判断是否显示返回按钮
  const canGoBack = () => {
    const noBackSteps: StepType[] = ['welcome', 'analyzing', 'generating', 'complete'];
    return !noBackSteps.includes(currentStep);
  };

  // 初始化
  useEffect(() => {
    typeMessage(novaMessages['welcome']);
  }, []);

  // 步骤变化时更新消息
  useEffect(() => {
    if (currentStep !== 'welcome') {
      typeMessage(novaMessages[currentStep]);
    }
  }, [currentStep]);

  // 处理有/没有 CV 的选择
  const handleCVChoice = (hasCV: boolean) => {
    setPreviousStep('has-cv');
    if (hasCV) {
      setCurrentStep('upload-cv');
    } else {
      setCurrentStep('no-cv-intro');
    }
  };

  const handleFileUpload = async (file: File) => {
    setUploadedFile(file);
    setCurrentStep('analyzing');
    
    try {
      const resumeText = await extractTextFromPDF(file);
      console.log('Extracted resume text length:', resumeText.length);
      
      const matchResult = await matchResumeWithJobs(resumeText);
      console.log('Match result:', matchResult);
      
      localStorage.setItem('userProfile', JSON.stringify({
        hasCV: true,
        cvFileName: file.name,
        completedBriefing: true,
        briefingDate: new Date().toISOString(),
        matchResult: matchResult
      }));
      
      navigate('/browse');
    } catch (error) {
      console.error('CV analysis failed:', error);
      // 即使 API 失败，也标记为真实 CV 上传，让 browse 页面显示 fallback
      localStorage.setItem('userProfile', JSON.stringify({
        hasCV: true,
        cvFileName: file.name,
        isRealCV: true,  // 标记为真实上传（非 demo）
        completedBriefing: true,
        briefingDate: new Date().toISOString()
      }));
      navigate('/browse');
    }
  };

  // 处理拖拽
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && (file.type === 'application/pdf' || file.name.endsWith('.doc') || file.name.endsWith('.docx'))) {
      handleFileUpload(file);
    }
  };

  // 处理名字输入
  const handleNameSubmit = () => {
    if (textInput.trim()) {
      setUserProfile(prev => ({ ...prev, name: textInput.trim() }));
      setTextInput('');
      setCurrentStep('experience');
    }
  };

  // 处理经验选择
  const handleExperienceSelect = (exp: string) => {
    setUserProfile(prev => ({ ...prev, experience: exp }));
    setCurrentStep('skills');
  };

  // 处理技能选择
  const handleSkillsConfirm = () => {
    if (selectedSkills.length > 0) {
      setUserProfile(prev => ({ ...prev, skills: selectedSkills }));
      setCurrentStep('interests');
    }
  };

  // 处理兴趣选择
  const handleInterestsConfirm = () => {
    if (selectedInterests.length > 0) {
      setUserProfile(prev => ({ ...prev, interests: selectedInterests }));
      setCurrentStep('workStyle');
    }
  };

  // 处理工作风格选择
  const handleWorkStyleSelect = (style: string) => {
    setUserProfile(prev => ({ ...prev, workStyle: style }));
    setCurrentStep('availability');
  };

  // 处理可用时间选择
  const handleAvailabilitySelect = (avail: string) => {
    setUserProfile(prev => ({ ...prev, availability: avail }));
    setCurrentStep('generating');
    
    // 模拟生成过程
    setTimeout(() => {
      // 保存用户资料
      localStorage.setItem('userProfile', JSON.stringify({
        ...userProfile,
        availability: avail,
        hasCV: false,
        completedBriefing: true,
        briefingDate: new Date().toISOString()
      }));
      setCurrentStep('complete');
    }, 2500);
  };

  // 技能选项
  const skillOptions = [
    { icon: 'ri-code-s-slash-line', label: 'Software Development' },
    { icon: 'ri-settings-3-line', label: 'Systems Engineering' },
    { icon: 'ri-bar-chart-line', label: 'Data Analysis' },
    { icon: 'ri-team-line', label: 'Project Management' },
    { icon: 'ri-rocket-line', label: 'Aerospace Engineering' },
    { icon: 'ri-cpu-line', label: 'Hardware Design' },
    { icon: 'ri-file-text-line', label: 'Technical Writing' },
    { icon: 'ri-customer-service-line', label: 'Customer Relations' },
  ];

  // 兴趣选项
  const interestOptions = [
    { icon: 'ri-earth-line', label: 'Earth Observation' },
    { icon: 'ri-signal-tower-line', label: 'Satellite Communications' },
    { icon: 'ri-space-ship-line', label: 'Space Exploration' },
    { icon: 'ri-robot-line', label: 'AI & Automation' },
    { icon: 'ri-map-pin-line', label: 'Navigation Systems' },
    { icon: 'ri-shield-check-line', label: 'Space Security' },
  ];

  // 计算进度
  const getProgress = () => {
    const steps: StepType[] = ['welcome', 'has-cv', 'no-cv-intro', 'name', 'experience', 'skills', 'interests', 'workStyle', 'availability', 'complete'];
    const noCV_steps: StepType[] = ['no-cv-intro', 'name', 'experience', 'skills', 'interests', 'workStyle', 'availability'];
    
    if (currentStep === 'upload-cv' || currentStep === 'analyzing') return 50;
    if (currentStep === 'complete' || currentStep === 'generating') return 100;
    
    const idx = noCV_steps.indexOf(currentStep);
    if (idx >= 0) {
      return Math.round(((idx + 1) / noCV_steps.length) * 100);
    }
    return 10;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 relative overflow-hidden">
      {/* 背景装饰 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-[600px] h-[600px] bg-gradient-to-br from-[#5147EF]/5 to-purple-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-[500px] h-[500px] bg-gradient-to-tr from-emerald-500/5 to-cyan-500/5 rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 px-8 py-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            {canGoBack() ? (
              <button 
                onClick={goBack}
                className="flex items-center gap-3 text-gray-500 hover:text-gray-700 transition-colors cursor-pointer group"
              >
                <div className="w-10 h-10 rounded-xl bg-white shadow-sm border border-gray-100 flex items-center justify-center group-hover:shadow-md transition-shadow">
                  <i className="ri-arrow-left-line text-lg"></i>
                </div>
                <span className="text-sm font-medium">Back</span>
              </button>
            ) : (
              <button 
                onClick={() => navigate('/')}
                className="flex items-center gap-3 text-gray-500 hover:text-gray-700 transition-colors cursor-pointer group"
              >
                <div className="w-10 h-10 rounded-xl bg-white shadow-sm border border-gray-100 flex items-center justify-center group-hover:shadow-md transition-shadow">
                  <i className="ri-home-line text-lg"></i>
                </div>
                <span className="text-sm font-medium">Home</span>
              </button>
            )}
          </div>
          
          <div className="border-2 border-gray-900 px-3 py-1.5">
            <span className="text-gray-900 text-sm font-bold tracking-wider">SPACE</span>
            <span className="text-gray-900 text-sm font-bold">42</span>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      {currentStep !== 'welcome' && currentStep !== 'has-cv' && (
        <div className="relative z-10 px-8 mb-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-4">
              <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-[#5147EF] to-[#7C3AED] transition-all duration-700 ease-out rounded-full"
                  style={{ width: `${getProgress()}%` }}
                ></div>
              </div>
              <span className="text-sm text-gray-400 font-medium">{getProgress()}%</span>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="relative z-10 px-8 pb-20">
        <div className="max-w-4xl mx-auto">
          {/* Nova Avatar & Message */}
          <div className="flex items-start gap-5 mb-10">
            <div className="relative flex-shrink-0">
              <div className="w-16 h-16 bg-gradient-to-br from-[#5147EF] to-[#7C3AED] rounded-2xl flex items-center justify-center shadow-xl shadow-[#5147EF]/20">
                <i className="ri-sparkling-2-fill text-white text-2xl"></i>
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-400 rounded-full border-2 border-white"></div>
            </div>
            
            <div className="flex-1 pt-2">
              <div className="inline-block bg-white rounded-2xl rounded-tl-md px-6 py-4 shadow-sm border border-gray-100 max-w-2xl">
                <p className="text-gray-700 leading-relaxed text-[15px]">
                  {novaMessage}
                  {isTyping && <span className="inline-block w-0.5 h-4 bg-[#5147EF] ml-1 animate-pulse"></span>}
                </p>
              </div>
              <p className="text-xs text-gray-400 mt-2 ml-2">Nova • Just now</p>
            </div>
          </div>

          {/* Interactive Cards Area */}
          {showCards && (
            <div className="ml-21 animate-fade-in">
              
              {/* Welcome Step - Start Button */}
              {currentStep === 'welcome' && (
                <button
                  onClick={() => setCurrentStep('has-cv')}
                  className="bg-gradient-to-r from-[#5147EF] to-[#7C3AED] text-white px-8 py-4 rounded-2xl font-semibold hover:shadow-xl hover:shadow-[#5147EF]/25 transition-all cursor-pointer whitespace-nowrap flex items-center gap-3 group"
                >
                  <span>Let's Go!</span>
                  <i className="ri-arrow-right-line text-xl group-hover:translate-x-1 transition-transform"></i>
                </button>
              )}

              {/* Has CV Choice */}
              {currentStep === 'has-cv' && (
                <div className="grid grid-cols-2 gap-5 max-w-xl">
                  <button
                    onClick={() => handleCVChoice(true)}
                    className="bg-white rounded-2xl p-6 border-2 border-gray-100 hover:border-[#5147EF] hover:shadow-lg transition-all cursor-pointer group text-left"
                  >
                    <div className="w-14 h-14 bg-gradient-to-br from-[#5147EF]/10 to-purple-500/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <i className="ri-file-text-line text-[#5147EF] text-2xl"></i>
                    </div>
                    <h3 className="font-bold text-gray-900 mb-2">Yes, I have a CV</h3>
                    <p className="text-sm text-gray-500">Upload it and let AI find your matches</p>
                  </button>
                  
                  <button
                    onClick={() => handleCVChoice(false)}
                    className="bg-white rounded-2xl p-6 border-2 border-gray-100 hover:border-emerald-500 hover:shadow-lg transition-all cursor-pointer group text-left"
                  >
                    <div className="w-14 h-14 bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <i className="ri-chat-smile-3-line text-emerald-500 text-2xl"></i>
                    </div>
                    <h3 className="font-bold text-gray-900 mb-2">No, help me out</h3>
                    <p className="text-sm text-gray-500">Answer a few questions to build your profile</p>
                  </button>
                </div>
              )}

              {/* Upload CV */}
              {currentStep === 'upload-cv' && (
                <div className="max-w-xl">
                  <div 
                    className={`bg-white rounded-2xl p-10 border-2 border-dashed transition-all ${
                      dragOver ? 'border-[#5147EF] bg-[#5147EF]/5' : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                  >
                    <div className="text-center">
                      <div className="w-16 h-16 bg-gradient-to-br from-[#5147EF]/10 to-purple-500/10 rounded-2xl flex items-center justify-center mx-auto mb-5">
                        <i className="ri-upload-cloud-2-line text-[#5147EF] text-3xl"></i>
                      </div>
                      <h3 className="font-bold text-gray-900 mb-2">Drop your CV here</h3>
                      <p className="text-sm text-gray-500 mb-5">PDF, DOC, or DOCX • Max 10MB</p>
                      
                      <label className="inline-flex items-center gap-2 bg-[#5147EF] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#4339D8] transition-colors cursor-pointer">
                        <i className="ri-folder-open-line"></i>
                        <span>Browse Files</span>
                        <input 
                          type="file" 
                          accept=".pdf,.doc,.docx"
                          className="hidden"
                          onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                        />
                      </label>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="flex items-center gap-4 my-6">
                    <div className="flex-1 h-px bg-gray-200"></div>
                    <span className="text-sm text-gray-400 font-medium">or try our demo</span>
                    <div className="flex-1 h-px bg-gray-200"></div>
                  </div>

                  {/* Sample CV Option */}
                  <button
                    onClick={() => {
                      setCurrentStep('analyzing');
                      setTimeout(() => {
                        localStorage.setItem('userProfile', JSON.stringify({
                          hasCV: true,
                          cvFileName: 'Alex_Chen_Resume.pdf',
                          isSampleCV: true,
                          completedBriefing: true,
                          briefingDate: new Date().toISOString()
                        }));
                        navigate('/browse');
                      }, 3000);
                    }}
                    className="w-full bg-gradient-to-r from-emerald-50 to-cyan-50 hover:from-emerald-100 hover:to-cyan-100 border-2 border-emerald-200 hover:border-emerald-300 rounded-2xl p-5 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                        <i className="ri-sparkling-2-fill text-emerald-500 text-2xl"></i>
                      </div>
                      <div className="text-left flex-1">
                        <h4 className="font-bold text-gray-900 mb-1 flex items-center gap-2">
                          Try Sample CV
                          <span className="bg-emerald-100 text-emerald-600 text-xs px-2 py-0.5 rounded-full font-medium">Demo</span>
                        </h4>
                        <p className="text-sm text-gray-500">See how AI matching works with Alex Chen's profile</p>
                      </div>
                      <i className="ri-arrow-right-line text-emerald-500 text-xl group-hover:translate-x-1 transition-transform"></i>
                    </div>
                  </button>
                </div>
              )}

              {/* Analyzing */}
              {currentStep === 'analyzing' && (
                <div className="bg-white rounded-2xl p-10 max-w-xl border border-gray-100 shadow-sm">
                  <div className="text-center">
                    <div className="w-20 h-20 mx-auto mb-6 relative">
                      <div className="absolute inset-0 border-4 border-gray-100 rounded-full"></div>
                      <div className="absolute inset-0 border-4 border-[#5147EF] rounded-full border-t-transparent animate-spin"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <i className="ri-sparkling-2-fill text-[#5147EF] text-2xl"></i>
                      </div>
                    </div>
                    <h3 className="font-bold text-gray-900 mb-2">Analyzing your CV...</h3>
                    <p className="text-sm text-gray-500">Finding the best matches for you</p>
                    {uploadedFile && (
                      <div className="mt-4 inline-flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-lg">
                        <i className="ri-file-text-line text-gray-400"></i>
                        <span className="text-sm text-gray-600">{uploadedFile.name}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* No CV Intro - Continue */}
              {currentStep === 'no-cv-intro' && (
                <button
                  onClick={() => setCurrentStep('name')}
                  className="bg-gradient-to-r from-[#5147EF] to-[#7C3AED] text-white px-8 py-4 rounded-2xl font-semibold hover:shadow-xl hover:shadow-[#5147EF]/25 transition-all cursor-pointer whitespace-nowrap flex items-center gap-3 group"
                >
                  <span>Sounds good!</span>
                  <i className="ri-arrow-right-line text-xl group-hover:translate-x-1 transition-transform"></i>
                </button>
              )}

              {/* Name Input */}
              {currentStep === 'name' && (
                <div className="max-w-md">
                  <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                    <input
                      type="text"
                      value={textInput}
                      onChange={(e) => setTextInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleNameSubmit()}
                      placeholder="Type your name..."
                      className="w-full text-lg text-gray-900 placeholder:text-gray-300 focus:outline-none"
                      autoFocus
                    />
                  </div>
                  <button
                    onClick={handleNameSubmit}
                    disabled={!textInput.trim()}
                    className="mt-4 bg-gradient-to-r from-[#5147EF] to-[#7C3AED] text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-[#5147EF]/25 transition-all cursor-pointer whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <span>Continue</span>
                    <i className="ri-arrow-right-line"></i>
                  </button>
                </div>
              )}

              {/* Experience Selection */}
              {currentStep === 'experience' && (
                <div className="grid grid-cols-2 gap-4 max-w-2xl">
                  {[
                    { label: 'Student / Fresh Graduate', icon: 'ri-graduation-cap-line', desc: 'Just starting out' },
                    { label: '1-3 Years Experience', icon: 'ri-seedling-line', desc: 'Early career' },
                    { label: '4-7 Years Experience', icon: 'ri-plant-line', desc: 'Mid-level professional' },
                    { label: '8+ Years Experience', icon: 'ri-tree-line', desc: 'Senior professional' },
                  ].map((option) => (
                    <button
                      key={option.label}
                      onClick={() => handleExperienceSelect(option.label)}
                      className="bg-white rounded-2xl p-5 border-2 border-gray-100 hover:border-[#5147EF] hover:shadow-lg transition-all cursor-pointer group text-left"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-[#5147EF]/10 to-purple-500/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                          <i className={`${option.icon} text-[#5147EF] text-xl`}></i>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{option.label}</h4>
                          <p className="text-xs text-gray-400">{option.desc}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Skills Selection */}
              {currentStep === 'skills' && (
                <div className="max-w-2xl">
                  <div className="grid grid-cols-4 gap-3 mb-6">
                    {skillOptions.map((skill) => (
                      <button
                        key={skill.label}
                        onClick={() => {
                          setSelectedSkills(prev => 
                            prev.includes(skill.label) 
                              ? prev.filter(s => s !== skill.label)
                              : [...prev, skill.label]
                          );
                        }}
                        className={`p-4 rounded-xl border-2 transition-all cursor-pointer text-center ${
                          selectedSkills.includes(skill.label)
                            ? 'border-[#5147EF] bg-[#5147EF]/5 shadow-md'
                            : 'border-gray-100 bg-white hover:border-gray-200'
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center mx-auto mb-2 ${
                          selectedSkills.includes(skill.label)
                            ? 'bg-[#5147EF] text-white'
                            : 'bg-gray-50 text-gray-400'
                        }`}>
                          <i className={`${skill.icon} text-lg`}></i>
                        </div>
                        <span className={`text-xs font-medium ${
                          selectedSkills.includes(skill.label) ? 'text-[#5147EF]' : 'text-gray-600'
                        }`}>{skill.label}</span>
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={handleSkillsConfirm}
                    disabled={selectedSkills.length === 0}
                    className="bg-gradient-to-r from-[#5147EF] to-[#7C3AED] text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-[#5147EF]/25 transition-all cursor-pointer whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <span>Continue with {selectedSkills.length} skills</span>
                    <i className="ri-arrow-right-line"></i>
                  </button>
                </div>
              )}

              {/* Interests Selection */}
              {currentStep === 'interests' && (
                <div className="max-w-2xl">
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    {interestOptions.map((interest) => (
                      <button
                        key={interest.label}
                        onClick={() => {
                          setSelectedInterests(prev => 
                            prev.includes(interest.label) 
                              ? prev.filter(i => i !== interest.label)
                              : [...prev, interest.label]
                          );
                        }}
                        className={`p-5 rounded-xl border-2 transition-all cursor-pointer text-center ${
                          selectedInterests.includes(interest.label)
                            ? 'border-emerald-500 bg-emerald-50 shadow-md'
                            : 'border-gray-100 bg-white hover:border-gray-200'
                        }`}
                      >
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3 ${
                          selectedInterests.includes(interest.label)
                            ? 'bg-emerald-500 text-white'
                            : 'bg-gray-50 text-gray-400'
                        }`}>
                          <i className={`${interest.icon} text-xl`}></i>
                        </div>
                        <span className={`text-sm font-medium ${
                          selectedInterests.includes(interest.label) ? 'text-emerald-600' : 'text-gray-600'
                        }`}>{interest.label}</span>
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={handleInterestsConfirm}
                    disabled={selectedInterests.length === 0}
                    className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-emerald-500/25 transition-all cursor-pointer whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <span>Continue with {selectedInterests.length} interests</span>
                    <i className="ri-arrow-right-line"></i>
                  </button>
                </div>
              )}

              {/* Work Style Selection */}
              {currentStep === 'workStyle' && (
                <div className="grid grid-cols-3 gap-4 max-w-2xl">
                  {[
                    { label: 'On-site', icon: 'ri-building-line', desc: 'Work at the office' },
                    { label: 'Remote', icon: 'ri-home-office-line', desc: 'Work from anywhere' },
                    { label: 'Hybrid', icon: 'ri-refresh-line', desc: 'Best of both worlds' },
                  ].map((option) => (
                    <button
                      key={option.label}
                      onClick={() => handleWorkStyleSelect(option.label)}
                      className="bg-white rounded-2xl p-6 border-2 border-gray-100 hover:border-[#5147EF] hover:shadow-lg transition-all cursor-pointer group text-center"
                    >
                      <div className="w-14 h-14 bg-gradient-to-br from-[#5147EF]/10 to-purple-500/10 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                        <i className={`${option.icon} text-[#5147EF] text-2xl`}></i>
                      </div>
                      <h4 className="font-semibold text-gray-900 mb-1">{option.label}</h4>
                      <p className="text-xs text-gray-400">{option.desc}</p>
                    </button>
                  ))}
                </div>
              )}

              {/* Availability Selection */}
              {currentStep === 'availability' && (
                <div className="flex flex-wrap gap-3 max-w-2xl">
                  {[
                    'Immediately',
                    'Within 2 weeks',
                    'Within 1 month',
                    'Within 3 months',
                    'Just exploring',
                  ].map((option) => (
                    <button
                      key={option}
                      onClick={() => handleAvailabilitySelect(option)}
                      className="bg-white px-6 py-4 rounded-xl border-2 border-gray-100 hover:border-[#5147EF] hover:shadow-lg transition-all cursor-pointer font-medium text-gray-700 hover:text-[#5147EF]"
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}

              {/* Generating */}
              {currentStep === 'generating' && (
                <div className="bg-white rounded-2xl p-10 max-w-xl border border-gray-100 shadow-sm">
                  <div className="text-center">
                    <div className="w-20 h-20 mx-auto mb-6 relative">
                      <div className="absolute inset-0 border-4 border-gray-100 rounded-full"></div>
                      <div className="absolute inset-0 border-4 border-[#5147EF] rounded-full border-t-transparent animate-spin"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <i className="ri-magic-line text-[#5147EF] text-2xl"></i>
                      </div>
                    </div>
                    <h3 className="font-bold text-gray-900 mb-2">Creating your profile...</h3>
                    <p className="text-sm text-gray-500">Finding opportunities that match you</p>
                  </div>
                </div>
              )}

              {/* Complete */}
              {currentStep === 'complete' && (
                <div className="space-y-4 max-w-md">
                  {/* Profile Summary Card */}
                  <div className="bg-gradient-to-br from-[#5147EF] to-[#7C3AED] rounded-2xl p-6 text-white mb-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                        <i className="ri-user-3-line text-2xl"></i>
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">{userProfile.name}</h3>
                        <p className="text-white/80 text-sm">{userProfile.experience}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {userProfile.skills?.slice(0, 3).map((skill, idx) => (
                        <span key={idx} className="bg-white/20 px-3 py-1 rounded-full text-xs">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => navigate('/browse')}
                    className="w-full bg-gradient-to-r from-[#5147EF] to-[#7C3AED] text-white px-8 py-4 rounded-2xl font-semibold hover:shadow-xl hover:shadow-[#5147EF]/25 transition-all cursor-pointer whitespace-nowrap flex items-center justify-center gap-3"
                  >
                    <i className="ri-search-line text-xl"></i>
                    <span>Explore Matching Jobs</span>
                  </button>
                  
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="w-full bg-white text-gray-700 px-8 py-4 rounded-2xl font-semibold hover:shadow-lg transition-all cursor-pointer whitespace-nowrap flex items-center justify-center gap-3 border border-gray-200"
                  >
                    <i className="ri-dashboard-line text-xl"></i>
                    <span>Go to My Dashboard</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Floating Helper */}
      <div className="fixed bottom-8 right-8 z-20">
        <div className="bg-white rounded-full px-5 py-3 flex items-center gap-3 shadow-lg border border-gray-100">
          <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-pulse"></div>
          <span className="text-gray-600 text-sm font-medium">Nova is here to help</span>
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.4s ease-out;
        }
        .ml-21 {
          margin-left: 5.25rem;
        }
      `}</style>
    </div>
  );
}
