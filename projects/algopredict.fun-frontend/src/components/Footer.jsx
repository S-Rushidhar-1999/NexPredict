import React, { useState } from 'react';

export const Footer = () => {
  const [email, setEmail] = useState('');

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      console.log('Subscribe:', email);
      setEmail('');
    }
  };

  return (
    <footer className="bg-[#0d0d12] border-t border-gray-800 mt-20">
      <div className="max-w-6xl mx-auto px-6 py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          {/* Brand Section */}
          <div className="md:col-span-1">
            <h3 className="text-lg font-semibold text-white mb-3">AlgoPredict</h3>
            <p className="text-sm text-gray-400 leading-relaxed mb-4">
              Decentralized prediction markets on Algorand. Make predictions, place bets, win rewards.
            </p>
          </div>

          {/* Platform Links */}
          <div>
            <h4 className="text-sm font-medium text-gray-300 mb-4">Platform</h4>
            <ul className="space-y-2.5">
              <li>
                <a href="#/" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">
                  Browse Predictions
                </a>
              </li>
              <li>
                <a href="#/create-prediction" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">
                  Create Prediction
                </a>
              </li>
              <li>
                <a href="#/" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">
                  How It Works
                </a>
              </li>
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h4 className="text-sm font-medium text-gray-300 mb-4">Support</h4>
            <ul className="space-y-2.5">
              <li>
                <a href="https://t.me/algopredictfun" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">
                  Help Center
                </a>
              </li>
              <li>
                <a href="https://t.me/algopredictfun" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">
                  Community
                </a>
              </li>
              <li>
                <a href="https://x.com/Algopredictfun" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="text-sm font-medium text-gray-300 mb-4">Legal</h4>
            <ul className="space-y-2.5">
              <li>
                <a href="#/" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#/" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="border-t border-gray-800 pt-10 pb-8">
          <div className="max-w-md">
            <h4 className="text-base font-medium text-white mb-2">Stay in the loop</h4>
            <p className="text-sm text-gray-500 mb-4">Get updates on new predictions and platform news.</p>
            <form onSubmit={handleSubscribe} className="flex gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="flex-1 px-4 py-2 bg-[#1a1a20] border border-gray-700 rounded-md focus:outline-none focus:border-gray-600 text-white text-sm placeholder-gray-600"
                required
              />
              <button
                type="submit"
                className="px-5 py-2 bg-white text-black rounded-md text-sm font-medium hover:bg-gray-200 transition-colors"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-600">
          <p>© 2026 AlgoPredict. All rights reserved.</p>
          <div className="flex items-center gap-5">
            <a
              href="https://x.com/Algopredictfun"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-gray-400 transition-colors"
              aria-label="Twitter"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
            <a
              href="https://t.me/algopredictfun"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-gray-400 transition-colors"
              aria-label="Telegram"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.941z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

