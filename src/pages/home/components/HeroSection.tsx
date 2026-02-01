
import { useNavigate } from 'react-router-dom';

export default function HeroSection() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center px-8 pt-16 pb-20 relative overflow-hidden">
      {/* 背景装饰 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-[600px] h-[600px] bg-gradient-to-br from-[#5147EF]/5 to-purple-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-[500px] h-[500px] bg-gradient-to-tr from-emerald-500/5 to-cyan-500/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-indigo-500/3 to-purple-500/3 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-4xl w-full text-center relative z-10">
        {/* Nova Avatar */}
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <div className="w-24 h-24 bg-gradient-to-br from-[#5147EF] to-[#7C3AED] rounded-3xl flex items-center justify-center shadow-2xl shadow-[#5147EF]/30 animate-float">
              <i className="ri-sparkling-2-fill text-white text-4xl"></i>
            </div>
            <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-emerald-400 rounded-full border-4 border-white flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Greeting */}
        <div className="mb-6">
          <span className="inline-flex items-center gap-2 bg-gradient-to-r from-[#5147EF]/10 to-purple-500/10 text-[#5147EF] px-4 py-2 rounded-full text-sm font-medium">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
            Nova is online
          </span>
        </div>

        {/* Main Heading */}
        <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
          Hey there! 👋<br />
          <span className="bg-gradient-to-r from-[#5147EF] to-[#7C3AED] bg-clip-text text-transparent">
            Ready to find your dream role?
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-xl text-gray-500 mb-12 max-w-2xl mx-auto leading-relaxed">
          I'm Nova, your personal career companion at Space42. Let me help you discover opportunities that match your unique talents and aspirations.
        </p>

        {/* CTA Button */}
        <button
          onClick={() => navigate('/briefing')}
          className="bg-gradient-to-r from-[#5147EF] to-[#7C3AED] text-white px-10 py-5 rounded-2xl font-semibold text-lg hover:shadow-2xl hover:shadow-[#5147EF]/30 transition-all cursor-pointer whitespace-nowrap inline-flex items-center gap-3 group"
        >
          <span>Let's Get Started</span>
          <i className="ri-arrow-right-line text-xl group-hover:translate-x-1 transition-transform"></i>
        </button>

        {/* Trust Indicators */}
        <div className="mt-16 flex items-center justify-center gap-8">
          <div className="flex items-center gap-3 text-gray-400">
            <i className="ri-shield-check-line text-xl"></i>
            <span className="text-sm">Secure & Private</span>
          </div>
          <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
          <div className="flex items-center gap-3 text-gray-400">
            <i className="ri-time-line text-xl"></i>
            <span className="text-sm">Takes 2 minutes</span>
          </div>
          <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
          <div className="flex items-center gap-3 text-gray-400">
            <i className="ri-sparkling-line text-xl"></i>
            <span className="text-sm">AI-Powered Matching</span>
          </div>
        </div>

        {/* Quick Links */}
        <div className="mt-12 flex items-center justify-center gap-4">
          <button
            onClick={() => navigate('/browse')}
            className="text-gray-500 hover:text-[#5147EF] text-sm font-medium flex items-center gap-2 transition-colors cursor-pointer"
          >
            <i className="ri-search-line"></i>
            <span>Browse all positions</span>
          </button>
          <span className="text-gray-300">•</span>
          <button
            onClick={() => navigate('/dashboard')}
            className="text-gray-500 hover:text-[#5147EF] text-sm font-medium flex items-center gap-2 transition-colors cursor-pointer"
          >
            <i className="ri-dashboard-line"></i>
            <span>My dashboard</span>
          </button>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
