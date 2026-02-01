import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

type OnboardingStep = 'welcome' | 'contract' | 'personal-info' | 'documents' | 'complete';

interface JobOffer {
  jobTitle: string;
  company: string;
  startDate: string;
  salary: string;
  location: string;
}

interface PersonalInfo {
  fullName: string;
  dateOfBirth: string;
  nationality: string;
  passportNumber: string;
  phoneNumber: string;
  emergencyContact: string;
  emergencyPhone: string;
  address: string;
  city: string;
  country: string;
  postalCode: string;
}

interface BankInfo {
  bankName: string;
  accountNumber: string;
  iban: string;
  swiftCode: string;
}

interface OnboardingProgress {
  currentStep: OnboardingStep;
  contractSigned: boolean;
  personalInfo: PersonalInfo;
  bankInfo: BankInfo;
  uploadedDocs: Record<string, boolean>;
  startedAt: string;
  lastUpdated: string;
}

const ONBOARDING_STORAGE_KEY = 'space42_onboarding_progress';

export default function OnboardingPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('welcome');
  const [contractSigned, setContractSigned] = useState(false);
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    fullName: '',
    dateOfBirth: '',
    nationality: '',
    passportNumber: '',
    phoneNumber: '',
    emergencyContact: '',
    emergencyPhone: '',
    address: '',
    city: '',
    country: '',
    postalCode: ''
  });
  const [bankInfo, setBankInfo] = useState<BankInfo>({
    bankName: '',
    accountNumber: '',
    iban: '',
    swiftCode: ''
  });
  const [uploadedDocs, setUploadedDocs] = useState<Record<string, boolean>>({
    passport: false,
    visa: false,
    degree: false,
    certificate: false
  });
  const [isSaving, setIsSaving] = useState(false);

  // Mock job offer data - 统一使用 Space42
  const jobOffer: JobOffer = {
    jobTitle: 'Senior Satellite Communications Engineer',
    company: 'Space42',
    startDate: 'February 15, 2025',
    salary: '$145,000/year',
    location: 'Abu Dhabi, UAE'
  };

  const steps = [
    { id: 'welcome', label: 'Welcome', icon: 'ri-hand-heart-line' },
    { id: 'contract', label: 'Contract', icon: 'ri-file-text-line' },
    { id: 'personal-info', label: 'Personal Info', icon: 'ri-user-line' },
    { id: 'documents', label: 'Documents', icon: 'ri-folder-upload-line' },
    { id: 'complete', label: 'Complete', icon: 'ri-checkbox-circle-line' }
  ];

  // 加载保存的进度
  useEffect(() => {
    const savedProgress = localStorage.getItem(ONBOARDING_STORAGE_KEY);
    if (savedProgress) {
      try {
        const progress: OnboardingProgress = JSON.parse(savedProgress);
        setCurrentStep(progress.currentStep);
        setContractSigned(progress.contractSigned);
        setPersonalInfo(progress.personalInfo);
        setBankInfo(progress.bankInfo);
        setUploadedDocs(progress.uploadedDocs);
      } catch (e) {
        console.error('Failed to load onboarding progress');
      }
    }
  }, []);

  // 保存进度
  const saveProgress = () => {
    setIsSaving(true);
    const progress: OnboardingProgress = {
      currentStep,
      contractSigned,
      personalInfo,
      bankInfo,
      uploadedDocs,
      startedAt: localStorage.getItem(ONBOARDING_STORAGE_KEY) 
        ? JSON.parse(localStorage.getItem(ONBOARDING_STORAGE_KEY)!).startedAt 
        : new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    };
    localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(progress));
    setTimeout(() => setIsSaving(false), 500);
  };

  // 自动保存
  useEffect(() => {
    if (currentStep !== 'welcome') {
      saveProgress();
    }
  }, [currentStep, contractSigned, personalInfo, bankInfo, uploadedDocs]);

  const getCurrentStepIndex = () => {
    return steps.findIndex(step => step.id === currentStep);
  };

  const handleNextStep = () => {
    const currentIndex = getCurrentStepIndex();
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1].id as OnboardingStep);
    }
    // 完成后清除保存的进度
    if (currentIndex === steps.length - 2) {
      localStorage.removeItem(ONBOARDING_STORAGE_KEY);
    }
  };

  const handlePrevStep = () => {
    const currentIndex = getCurrentStepIndex();
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1].id as OnboardingStep);
    }
  };

  const handlePersonalInfoChange = (field: keyof PersonalInfo, value: string) => {
    setPersonalInfo(prev => ({ ...prev, [field]: value }));
  };

  const handleBankInfoChange = (field: keyof BankInfo, value: string) => {
    setBankInfo(prev => ({ ...prev, [field]: value }));
  };

  const handleDocUpload = (docType: string) => {
    setUploadedDocs(prev => ({ ...prev, [docType]: true }));
  };

  const handleSaveAndExit = () => {
    saveProgress();
    navigate('/dashboard');
  };

  const isPersonalInfoComplete = () => {
    return Object.values(personalInfo).every(value => value.trim() !== '') &&
           Object.values(bankInfo).every(value => value.trim() !== '');
  };

  const isDocumentsComplete = () => {
    return uploadedDocs.passport && uploadedDocs.visa && uploadedDocs.degree;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/dashboard')}
              className="border border-gray-800 px-2 py-1 cursor-pointer hover:bg-gray-100 transition-colors"
            >
              <span className="text-gray-900 text-sm font-bold tracking-wider">SPACE</span>
              <span className="text-gray-900 text-sm font-bold">42</span>
            </button>
            <div className="h-6 w-px bg-gray-300"></div>
            <h1 className="text-lg font-bold text-gray-900">Onboarding</h1>
          </div>
          <div className="flex items-center gap-4">
            {currentStep !== 'welcome' && currentStep !== 'complete' && (
              <button
                onClick={handleSaveAndExit}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors cursor-pointer px-4 py-2 rounded-lg hover:bg-gray-100"
              >
                {isSaving ? (
                  <>
                    <i className="ri-loader-4-line animate-spin"></i>
                    <span className="text-sm font-medium">Saving...</span>
                  </>
                ) : (
                  <>
                    <i className="ri-save-line"></i>
                    <span className="text-sm font-medium">Save & Exit</span>
                  </>
                )}
              </button>
            )}
            <div className="w-10 h-10 bg-gradient-to-br from-[#5147EF] to-[#7C3AED] rounded-full flex items-center justify-center cursor-pointer">
              <span className="text-white font-bold text-sm">JD</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Progress Steps */}
        <div className="bg-white rounded-2xl p-8 mb-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                    getCurrentStepIndex() > index
                      ? 'bg-green-500 text-white'
                      : getCurrentStepIndex() === index
                      ? 'bg-[#5147EF] text-white'
                      : 'bg-gray-200 text-gray-400'
                  }`}>
                    {getCurrentStepIndex() > index ? (
                      <i className="ri-check-line text-xl"></i>
                    ) : (
                      <i className={`${step.icon} text-xl`}></i>
                    )}
                  </div>
                  <span className={`text-xs mt-2 font-medium ${
                    getCurrentStepIndex() >= index ? 'text-gray-900' : 'text-gray-400'
                  }`}>
                    {step.label}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`h-1 flex-1 mx-2 rounded-full transition-all ${
                    getCurrentStepIndex() > index ? 'bg-green-500' : 'bg-gray-200'
                  }`}></div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
          {/* Welcome Step */}
          {currentStep === 'welcome' && (
            <div className="text-center max-w-2xl mx-auto">
              <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="ri-trophy-fill text-white text-4xl"></i>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Congratulations, John! 🎉
              </h2>
              <p className="text-gray-600 text-lg mb-8">
                Welcome to {jobOffer.company}! We're thrilled to have you join our team as a {jobOffer.jobTitle}.
              </p>

              <div className="bg-gradient-to-r from-[#5147EF]/10 to-purple-500/10 rounded-xl p-6 mb-8 border border-[#5147EF]/20">
                <h3 className="font-bold text-gray-900 mb-4 text-lg">Your Offer Details</h3>
                <div className="grid grid-cols-2 gap-4 text-left">
                  <div>
                    <p className="text-gray-600 text-sm mb-1">Position</p>
                    <p className="font-semibold text-gray-900">{jobOffer.jobTitle}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm mb-1">Company</p>
                    <p className="font-semibold text-gray-900">{jobOffer.company}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm mb-1">Start Date</p>
                    <p className="font-semibold text-gray-900">{jobOffer.startDate}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm mb-1">Salary</p>
                    <p className="font-semibold text-gray-900">{jobOffer.salary}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-gray-600 text-sm mb-1">Location</p>
                    <p className="font-semibold text-gray-900">{jobOffer.location}</p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 rounded-xl p-6 mb-8 border border-blue-200">
                <div className="flex items-start gap-3">
                  <i className="ri-information-line text-blue-500 text-xl mt-0.5"></i>
                  <div className="text-left">
                    <h4 className="font-semibold text-gray-900 mb-2">What's Next?</h4>
                    <p className="text-gray-700 text-sm leading-relaxed">
                      To complete your onboarding, you'll need to:
                    </p>
                    <ul className="mt-3 space-y-2 text-sm text-gray-700">
                      <li className="flex items-center gap-2">
                        <i className="ri-checkbox-circle-line text-blue-500"></i>
                        Review and sign your employment contract
                      </li>
                      <li className="flex items-center gap-2">
                        <i className="ri-checkbox-circle-line text-blue-500"></i>
                        Complete your personal information
                      </li>
                      <li className="flex items-center gap-2">
                        <i className="ri-checkbox-circle-line text-blue-500"></i>
                        Upload required documents
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <button
                onClick={handleNextStep}
                className="bg-[#5147EF] text-white px-8 py-4 rounded-xl font-semibold hover:bg-[#4339D8] transition-all cursor-pointer text-lg whitespace-nowrap"
              >
                Let's Get Started
                <i className="ri-arrow-right-line ml-2"></i>
              </button>
            </div>
          )}

          {/* Contract Step */}
          {currentStep === 'contract' && (
            <div className="max-w-3xl mx-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Employment Contract</h2>
              <p className="text-gray-600 mb-6">Please review and sign your employment contract</p>

              <div className="bg-gray-50 rounded-xl p-6 mb-6 border border-gray-200 max-h-96 overflow-y-auto">
                <h3 className="font-bold text-gray-900 mb-4">EMPLOYMENT AGREEMENT</h3>
                <div className="space-y-4 text-sm text-gray-700 leading-relaxed">
                  <p>
                    This Employment Agreement ("Agreement") is entered into as of January 18, 2025, 
                    between {jobOffer.company} ("Company") and John Doe ("Employee").
                  </p>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">1. Position and Duties</h4>
                    <p>
                      The Employee is hired as {jobOffer.jobTitle}. The Employee agrees to perform 
                      duties and responsibilities as assigned by the Company and to devote their full 
                      professional time and attention to the business of the Company.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">2. Compensation</h4>
                    <p>
                      The Company agrees to pay the Employee a base salary of {jobOffer.salary}, 
                      payable in accordance with the Company's standard payroll practices. The Employee 
                      may also be eligible for performance bonuses as determined by the Company.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">3. Benefits</h4>
                    <p>
                      The Employee shall be entitled to participate in all employee benefit plans, 
                      practices, and programs maintained by the Company, including health insurance, 
                      retirement plans, and paid time off, as in effect from time to time.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">4. Start Date</h4>
                    <p>
                      The Employee's employment shall commence on {jobOffer.startDate}.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">5. Confidentiality</h4>
                    <p>
                      The Employee agrees to maintain the confidentiality of all proprietary information 
                      and trade secrets of the Company, both during and after employment.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">6. Termination</h4>
                    <p>
                      Either party may terminate this Agreement with 30 days written notice. The Company 
                      may terminate this Agreement immediately for cause.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-amber-50 rounded-xl p-4 mb-6 border border-amber-200">
                <div className="flex items-start gap-3">
                  <i className="ri-alert-line text-amber-600 text-xl mt-0.5"></i>
                  <div>
                    <p className="text-sm text-gray-700">
                      By signing this contract, you acknowledge that you have read, understood, and agree 
                      to all terms and conditions outlined above.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 border-2 border-gray-300 mb-6">
                <div className="flex items-center gap-4 mb-4">
                  <input
                    type="checkbox"
                    id="contract-agree"
                    checked={contractSigned}
                    onChange={(e) => setContractSigned(e.target.checked)}
                    className="w-5 h-5 text-[#5147EF] rounded cursor-pointer"
                  />
                  <label htmlFor="contract-agree" className="text-gray-700 cursor-pointer">
                    I have read and agree to the terms of this employment contract
                  </label>
                </div>
                
                {contractSigned && (
                  <div className="pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-600 mb-3">Electronic Signature</p>
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-300">
                      <p className="font-semibold text-gray-900 text-lg italic">John Doe</p>
                      <p className="text-sm text-gray-500 mt-1">
                        Signed on {new Date().toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between">
                <button
                  onClick={handlePrevStep}
                  className="bg-gray-100 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-all cursor-pointer whitespace-nowrap"
                >
                  <i className="ri-arrow-left-line mr-2"></i>
                  Back
                </button>
                <button
                  onClick={handleNextStep}
                  disabled={!contractSigned}
                  className={`px-8 py-3 rounded-xl font-semibold transition-all cursor-pointer whitespace-nowrap ${
                    contractSigned
                      ? 'bg-[#5147EF] text-white hover:bg-[#4339D8]'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Continue
                  <i className="ri-arrow-right-line ml-2"></i>
                </button>
              </div>
            </div>
          )}

          {/* Personal Info Step */}
          {currentStep === 'personal-info' && (
            <div className="max-w-3xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Personal Information</h2>
                  <p className="text-gray-600">Please provide your personal and banking details</p>
                </div>
                
                {/* Auto-fill Demo Button */}
                <button
                  onClick={() => {
                    setPersonalInfo({
                      fullName: 'Alex Chen',
                      dateOfBirth: '1992-05-15',
                      nationality: 'American',
                      passportNumber: 'N12345678',
                      phoneNumber: '+971 50 123 4567',
                      emergencyContact: 'Sarah Chen',
                      emergencyPhone: '+1 415 555 0123',
                      address: '123 Innovation Street, Tech District',
                      city: 'Abu Dhabi',
                      country: 'United Arab Emirates',
                      postalCode: '12345'
                    });
                    setBankInfo({
                      bankName: 'Emirates NBD',
                      accountNumber: '1234567890',
                      iban: 'AE070331234567890123456',
                      swiftCode: 'EBILAEAD'
                    });
                  }}
                  className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white px-5 py-2.5 rounded-xl font-semibold hover:shadow-lg hover:shadow-emerald-500/25 transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 text-sm"
                >
                  <i className="ri-magic-line text-lg"></i>
                  <span>Auto-fill Demo Data</span>
                </button>
              </div>

              <div className="space-y-6">
                {/* Personal Details */}
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <i className="ri-user-line text-[#5147EF]"></i>
                    Personal Details
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={personalInfo.fullName}
                        onChange={(e) => handlePersonalInfoChange('fullName', e.target.value)}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#5147EF]/30 text-sm"
                        placeholder="Enter your full legal name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Date of Birth <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        value={personalInfo.dateOfBirth}
                        onChange={(e) => handlePersonalInfoChange('dateOfBirth', e.target.value)}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#5147EF]/30 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nationality <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={personalInfo.nationality}
                        onChange={(e) => handlePersonalInfoChange('nationality', e.target.value)}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#5147EF]/30 text-sm"
                        placeholder="e.g., American"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Passport Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={personalInfo.passportNumber}
                        onChange={(e) => handlePersonalInfoChange('passportNumber', e.target.value)}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#5147EF]/30 text-sm"
                        placeholder="Enter passport number"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        value={personalInfo.phoneNumber}
                        onChange={(e) => handlePersonalInfoChange('phoneNumber', e.target.value)}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#5147EF]/30 text-sm"
                        placeholder="+971 XX XXX XXXX"
                      />
                    </div>
                  </div>
                </div>

                {/* Emergency Contact */}
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <i className="ri-phone-line text-red-500"></i>
                    Emergency Contact
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Contact Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={personalInfo.emergencyContact}
                        onChange={(e) => handlePersonalInfoChange('emergencyContact', e.target.value)}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#5147EF]/30 text-sm"
                        placeholder="Emergency contact name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Contact Phone <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        value={personalInfo.emergencyPhone}
                        onChange={(e) => handlePersonalInfoChange('emergencyPhone', e.target.value)}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#5147EF]/30 text-sm"
                        placeholder="+971 XX XXX XXXX"
                      />
                    </div>
                  </div>
                </div>

                {/* Address */}
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <i className="ri-map-pin-line text-[#5147EF]"></i>
                    Address
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Street Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={personalInfo.address}
                        onChange={(e) => handlePersonalInfoChange('address', e.target.value)}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#5147EF]/30 text-sm"
                        placeholder="Street address"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        City <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={personalInfo.city}
                        onChange={(e) => handlePersonalInfoChange('city', e.target.value)}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#5147EF]/30 text-sm"
                        placeholder="City"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Country <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={personalInfo.country}
                        onChange={(e) => handlePersonalInfoChange('country', e.target.value)}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#5147EF]/30 text-sm"
                        placeholder="Country"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Postal Code <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={personalInfo.postalCode}
                        onChange={(e) => handlePersonalInfoChange('postalCode', e.target.value)}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#5147EF]/30 text-sm"
                        placeholder="Postal code"
                      />
                    </div>
                  </div>
                </div>

                {/* Banking Information */}
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <i className="ri-bank-line text-green-500"></i>
                    Banking Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Bank Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={bankInfo.bankName}
                        onChange={(e) => handleBankInfoChange('bankName', e.target.value)}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#5147EF]/30 text-sm"
                        placeholder="Enter bank name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Account Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={bankInfo.accountNumber}
                        onChange={(e) => handleBankInfoChange('accountNumber', e.target.value)}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#5147EF]/30 text-sm"
                        placeholder="Account number"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        IBAN <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={bankInfo.iban}
                        onChange={(e) => handleBankInfoChange('iban', e.target.value)}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#5147EF]/30 text-sm"
                        placeholder="IBAN"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        SWIFT/BIC Code <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={bankInfo.swiftCode}
                        onChange={(e) => handleBankInfoChange('swiftCode', e.target.value)}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#5147EF]/30 text-sm"
                        placeholder="SWIFT/BIC code"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between mt-8">
                <button
                  onClick={handlePrevStep}
                  className="bg-gray-100 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-all cursor-pointer whitespace-nowrap"
                >
                  <i className="ri-arrow-left-line mr-2"></i>
                  Back
                </button>
                <button
                  onClick={handleNextStep}
                  disabled={!isPersonalInfoComplete()}
                  className={`px-8 py-3 rounded-xl font-semibold transition-all cursor-pointer whitespace-nowrap ${
                    isPersonalInfoComplete()
                      ? 'bg-[#5147EF] text-white hover:bg-[#4339D8]'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Continue
                  <i className="ri-arrow-right-line ml-2"></i>
                </button>
              </div>
            </div>
          )}

          {/* Documents Step */}
          {currentStep === 'documents' && (
            <div className="max-w-3xl mx-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Upload Documents</h2>
              <p className="text-gray-600 mb-6">Please upload the required documents to complete your onboarding</p>

              <div className="space-y-4">
                {/* Passport */}
                <div className={`rounded-xl p-6 border-2 transition-all ${
                  uploadedDocs.passport 
                    ? 'bg-green-50 border-green-300' 
                    : 'bg-gray-50 border-gray-300 border-dashed'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        uploadedDocs.passport ? 'bg-green-500' : 'bg-gray-300'
                      }`}>
                        <i className={`text-white text-xl ${
                          uploadedDocs.passport ? 'ri-checkbox-circle-fill' : 'ri-file-line'
                        }`}></i>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          Passport Copy <span className="text-red-500">*</span>
                        </h3>
                        <p className="text-sm text-gray-600">
                          {uploadedDocs.passport ? 'Uploaded successfully' : 'PDF or Image (Max 5MB)'}
                        </p>
                      </div>
                    </div>
                    {!uploadedDocs.passport ? (
                      <button
                        onClick={() => handleDocUpload('passport')}
                        className="bg-[#5147EF] text-white px-6 py-2 rounded-lg font-semibold hover:bg-[#4339D8] transition-all cursor-pointer whitespace-nowrap"
                      >
                        <i className="ri-upload-2-line mr-2"></i>
                        Upload
                      </button>
                    ) : (
                      <button
                        onClick={() => setUploadedDocs(prev => ({ ...prev, passport: false }))}
                        className="text-gray-500 hover:text-gray-700 cursor-pointer"
                      >
                        <i className="ri-delete-bin-line text-xl"></i>
                      </button>
                    )}
                  </div>
                </div>

                {/* Visa */}
                <div className={`rounded-xl p-6 border-2 transition-all ${
                  uploadedDocs.visa 
                    ? 'bg-green-50 border-green-300' 
                    : 'bg-gray-50 border-gray-300 border-dashed'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        uploadedDocs.visa ? 'bg-green-500' : 'bg-gray-300'
                      }`}>
                        <i className={`text-white text-xl ${
                          uploadedDocs.visa ? 'ri-checkbox-circle-fill' : 'ri-file-line'
                        }`}></i>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          Visa/Work Permit <span className="text-red-500">*</span>
                        </h3>
                        <p className="text-sm text-gray-600">
                          {uploadedDocs.visa ? 'Uploaded successfully' : 'PDF or Image (Max 5MB)'}
                        </p>
                      </div>
                    </div>
                    {!uploadedDocs.visa ? (
                      <button
                        onClick={() => handleDocUpload('visa')}
                        className="bg-[#5147EF] text-white px-6 py-2 rounded-lg font-semibold hover:bg-[#4339D8] transition-all cursor-pointer whitespace-nowrap"
                      >
                        <i className="ri-upload-2-line mr-2"></i>
                        Upload
                      </button>
                    ) : (
                      <button
                        onClick={() => setUploadedDocs(prev => ({ ...prev, visa: false }))}
                        className="text-gray-500 hover:text-gray-700 cursor-pointer"
                      >
                        <i className="ri-delete-bin-line text-xl"></i>
                      </button>
                    )}
                  </div>
                </div>

                {/* Degree */}
                <div className={`rounded-xl p-6 border-2 transition-all ${
                  uploadedDocs.degree 
                    ? 'bg-green-50 border-green-300' 
                    : 'bg-gray-50 border-gray-300 border-dashed'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        uploadedDocs.degree ? 'bg-green-500' : 'bg-gray-300'
                      }`}>
                        <i className={`text-white text-xl ${
                          uploadedDocs.degree ? 'ri-checkbox-circle-fill' : 'ri-file-line'
                        }`}></i>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          Educational Certificates <span className="text-red-500">*</span>
                        </h3>
                        <p className="text-sm text-gray-600">
                          {uploadedDocs.degree ? 'Uploaded successfully' : 'PDF or Image (Max 5MB)'}
                        </p>
                      </div>
                    </div>
                    {!uploadedDocs.degree ? (
                      <button
                        onClick={() => handleDocUpload('degree')}
                        className="bg-[#5147EF] text-white px-6 py-2 rounded-lg font-semibold hover:bg-[#4339D8] transition-all cursor-pointer whitespace-nowrap"
                      >
                        <i className="ri-upload-2-line mr-2"></i>
                        Upload
                      </button>
                    ) : (
                      <button
                        onClick={() => setUploadedDocs(prev => ({ ...prev, degree: false }))}
                        className="text-gray-500 hover:text-gray-700 cursor-pointer"
                      >
                        <i className="ri-delete-bin-line text-xl"></i>
                      </button>
                    )}
                  </div>
                </div>

                {/* Certificate (Optional) */}
                <div className={`rounded-xl p-6 border-2 transition-all ${
                  uploadedDocs.certificate 
                    ? 'bg-green-50 border-green-300' 
                    : 'bg-gray-50 border-gray-300 border-dashed'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        uploadedDocs.certificate ? 'bg-green-500' : 'bg-gray-300'
                      }`}>
                        <i className={`text-white text-xl ${
                          uploadedDocs.certificate ? 'ri-checkbox-circle-fill' : 'ri-file-line'
                        }`}></i>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          Professional Certifications
                          <span className="text-gray-500 text-sm ml-2">(Optional)</span>
                        </h3>
                        <p className="text-sm text-gray-600">
                          {uploadedDocs.certificate ? 'Uploaded successfully' : 'PDF or Image (Max 5MB)'}
                        </p>
                      </div>
                    </div>
                    {!uploadedDocs.certificate ? (
                      <button
                        onClick={() => handleDocUpload('certificate')}
                        className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg font-semibold hover:bg-gray-300 transition-all cursor-pointer whitespace-nowrap"
                      >
                        <i className="ri-upload-2-line mr-2"></i>
                        Upload
                      </button>
                    ) : (
                      <button
                        onClick={() => setUploadedDocs(prev => ({ ...prev, certificate: false }))}
                        className="text-gray-500 hover:text-gray-700 cursor-pointer"
                      >
                        <i className="ri-delete-bin-line text-xl"></i>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 rounded-xl p-4 mt-6 border border-blue-200">
                <div className="flex items-start gap-3">
                  <i className="ri-information-line text-blue-500 text-xl mt-0.5"></i>
                  <div>
                    <p className="text-sm text-gray-700">
                      All documents will be securely stored and used only for employment verification purposes. 
                      Please ensure all documents are clear and legible.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between mt-8">
                <button
                  onClick={handlePrevStep}
                  className="bg-gray-100 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-all cursor-pointer whitespace-nowrap"
                >
                  <i className="ri-arrow-left-line mr-2"></i>
                  Back
                </button>
                <button
                  onClick={handleNextStep}
                  disabled={!isDocumentsComplete()}
                  className={`px-8 py-3 rounded-xl font-semibold transition-all cursor-pointer whitespace-nowrap ${
                    isDocumentsComplete()
                      ? 'bg-[#5147EF] text-white hover:bg-[#4339D8]'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Complete Onboarding
                  <i className="ri-checkbox-circle-line ml-2"></i>
                </button>
              </div>
            </div>
          )}

          {/* Complete Step */}
          {currentStep === 'complete' && (
            <div className="text-center max-w-2xl mx-auto">
              <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                <i className="ri-checkbox-circle-fill text-white text-5xl"></i>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                All Set! Welcome Aboard! 🎉
              </h2>
              <p className="text-gray-600 text-lg mb-8">
                Your onboarding is complete! We're excited to have you join the {jobOffer.company} team.
              </p>

              <div className="bg-gradient-to-r from-[#5147EF]/10 to-purple-500/10 rounded-xl p-6 mb-8 border border-[#5147EF]/20">
                <h3 className="font-bold text-gray-900 mb-4">What Happens Next?</h3>
                <div className="space-y-3 text-left">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-[#5147EF] rounded-lg flex items-center justify-center flex-shrink-0">
                      <i className="ri-mail-line text-white"></i>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Check Your Email</p>
                      <p className="text-sm text-gray-600">
                        You'll receive a welcome email with your start date details and next steps
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-[#5147EF] rounded-lg flex items-center justify-center flex-shrink-0">
                      <i className="ri-calendar-line text-white"></i>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Mark Your Calendar</p>
                      <p className="text-sm text-gray-600">
                        Your first day is {jobOffer.startDate}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-[#5147EF] rounded-lg flex items-center justify-center flex-shrink-0">
                      <i className="ri-team-line text-white"></i>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Meet Your Team</p>
                      <p className="text-sm text-gray-600">
                        Your manager will reach out to schedule an orientation call
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="bg-[#5147EF] text-white px-8 py-4 rounded-xl font-semibold hover:bg-[#4339D8] transition-all cursor-pointer text-lg whitespace-nowrap"
                >
                  <i className="ri-home-line mr-2"></i>
                  Back to Dashboard
                </button>
                <button
                  onClick={() => window.print()}
                  className="bg-gray-100 text-gray-700 px-8 py-4 rounded-xl font-semibold hover:bg-gray-200 transition-all cursor-pointer text-lg whitespace-nowrap"
                >
                  <i className="ri-printer-line mr-2"></i>
                  Print Summary
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
