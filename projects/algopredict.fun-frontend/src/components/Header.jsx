import { NavLink } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Wallet, TrendingUp, Plus, Menu, X } from 'lucide-react';
import ConnectWalletModal from './ConnectWalletModal';
import { APP_ADMIN } from '../config';
import logo from '../assets/logo.png';

export const Header = ({ wallets, activeAccount, transactionSigner }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (activeAccount?.address === APP_ADMIN) {
      setIsAdmin(true);
    }
  }, [activeAccount]);

  const handleSecondClick = () => {
    if (window.location.pathname === "/") {
      document.getElementById("bets_section")?.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all ${scrolled ? 'bg-[#0d0d12]/95 backdrop-blur-sm border-b border-gray-800' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <NavLink to="/" onClick={handleSecondClick} className="flex items-center gap-2">
              <img src={logo} alt="Logo" className="h-9 w-9" />
              <span className="text-xl font-semibold text-white hidden sm:block">AlgoPredict</span>
            </NavLink>

            <nav className="hidden md:flex items-center gap-1">
              <NavLink
                to="/"
                onClick={handleSecondClick}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                  }`
                }
              >
                <TrendingUp className="w-4 h-4" />
                Markets
              </NavLink>

              {isAdmin && (
                <NavLink
                  to="/create-prediction"
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                    }`
                  }
                >
                  <Plus className="w-4 h-4" />
                  Create
                </NavLink>
              )}
            </nav>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsModalOpen(true)}
                className={`hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors ${activeAccount
                    ? 'bg-gray-800 text-green-400 hover:bg-gray-700'
                    : 'bg-white text-black hover:bg-gray-200'
                  }`}
              >
                <Wallet className="w-4 h-4" />
                {activeAccount ? (
                  <span className="font-mono text-xs">
                    {activeAccount.address.slice(0, 4)}...{activeAccount.address.slice(-4)}
                  </span>
                ) : (
                  'Connect'
                )}
              </button>

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-gray-800 transition-colors"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden bg-[#0d0d12] border-t border-gray-800">
            <div className="px-4 py-4 space-y-2">
              <NavLink
                to="/"
                onClick={handleSecondClick}
                className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
              >
                <TrendingUp className="w-4 h-4" />
                Markets
              </NavLink>
              {isAdmin && (
                <NavLink
                  to="/create-prediction"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Create
                </NavLink>
              )}
              <button
                onClick={() => {
                  setIsModalOpen(true);
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium text-sm bg-white text-black"
              >
                <Wallet className="w-4 h-4" />
                {activeAccount ? `${activeAccount.address.slice(0, 6)}...` : 'Connect Wallet'}
              </button>
            </div>
          </div>
        )}
      </header>

      <div className="h-16" />

      <ConnectWalletModal
        wallets={wallets}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};

export default Header;
