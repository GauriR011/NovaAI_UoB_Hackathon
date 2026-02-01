
interface NavigationProps {
  scrolled: boolean;
}

export default function Navigation({ scrolled }: NavigationProps) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0E1A70]">
      <div className="w-full px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="border border-white/80 px-2 py-1">
              <span className="text-white text-sm font-bold tracking-wider">SPACE</span>
              <span className="text-white text-sm font-bold">42</span>
            </div>
          </div>

          {/* Center Navigation */}
          <div className="flex items-center gap-8">
            <a href="#" className="text-white text-sm font-medium hover:text-white/80 transition-colors cursor-pointer whitespace-nowrap">
              About us
            </a>
            <a href="#" className="text-white text-sm font-medium hover:text-white/80 transition-colors cursor-pointer whitespace-nowrap">
              Media
            </a>
            <a href="#" className="text-white text-sm font-medium hover:text-white/80 transition-colors cursor-pointer whitespace-nowrap">
              Contact Us
            </a>
            <a href="#" className="text-white text-sm font-medium hover:text-white/80 transition-colors cursor-pointer whitespace-nowrap">
              Sign In
            </a>
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-2">
            <i className="ri-star-line text-white text-lg"></i>
            <span className="text-white text-sm font-medium whitespace-nowrap">Saved jobs (0)</span>
          </div>
        </div>
      </div>
    </nav>
  );
}
