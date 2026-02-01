
import { useState } from 'react';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    setSubmitMessage('');

    try {
      const formData = new URLSearchParams();
      formData.append('email', email);

      const response = await fetch('https://readdy.ai/api/form/d5v0bihdkj8fk0538310', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      });

      if (response.ok) {
        setSubmitMessage('Thank you for subscribing!');
        setEmail('');
      } else {
        setSubmitMessage('Subscription failed, please try again');
      }
    } catch (error) {
      setSubmitMessage('Subscription failed, please try again');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <footer className="text-white" style={{ backgroundColor: '#0E1A70' }}>
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-3 gap-8 items-center">
          {/* Logo & Description */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <img 
                src="https://static.readdy.ai/image/71c8cfc268cfc72f475364fbeca7de78/6d2abe5bf51054d6de4bc88bc64dd488.png" 
                alt="Space42 Logo" 
                className="h-8 w-8 object-contain"
              />
              <span className="text-lg font-bold">Space42</span>
            </div>
            <p className="text-white/60 text-sm">
              AI-powered career platform for space technology professionals
            </p>
          </div>

          {/* Links */}
          <div className="flex gap-8 justify-center">
            <div>
              <h4 className="text-sm font-semibold mb-3">Product</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-sm text-white/70 hover:text-white transition-colors cursor-pointer">Features</a></li>
                <li><a href="#" className="text-sm text-white/70 hover:text-white transition-colors cursor-pointer">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-3">Company</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-sm text-white/70 hover:text-white transition-colors cursor-pointer">About</a></li>
                <li><a href="#" className="text-sm text-white/70 hover:text-white transition-colors cursor-pointer">Contact</a></li>
              </ul>
            </div>
          </div>

          {/* Newsletter */}
          <div>
            <p className="text-sm text-white/70 mb-3">Stay updated</p>
            <form onSubmit={handleSubmit} className="flex gap-2" data-readdy-form id="newsletter-form">
              <input 
                type="email"
                name="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-sm text-white placeholder-white/50 focus:outline-none focus:border-indigo-400 transition-colors"
                required
              />
              <button 
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 bg-indigo-500 hover:bg-indigo-600 rounded-lg text-sm font-medium transition-all flex items-center gap-2 whitespace-nowrap disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? '...' : 'Subscribe'}
              </button>
            </form>
            {submitMessage && (
              <p className={`text-xs mt-2 ${submitMessage.includes('Thank') ? 'text-green-400' : 'text-red-400'}`}>
                {submitMessage}
              </p>
            )}
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-8 pt-6 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-white/50">
            © 2025 Space42. All rights reserved.
          </p>
          <p className="text-xs text-white/50">
            <a href="https://readdy.ai/?ref=logo" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-400 transition-colors">
              Powered by Readdy
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
