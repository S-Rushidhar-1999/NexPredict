import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Wallet, ExternalLink } from 'lucide-react';

const ConnectWalletModal = ({ wallets, isOpen, onClose }) => {
  if (!isOpen) return null;

  const handleWalletClick = async (wallet) => {
    if (wallet.isConnected) {
      wallet.setActive();
    } else {
      try {
        const account = await wallet.connect();
        console.log(account);
      } catch (e) {
        console.log(e);
      }
    }
  };

  const getisConnected = () => {
    for (const wallet of wallets) {
      if (wallet.isConnected) {
        return true;
      }
    }
    return false;
  };

  const [isConnected, setIsConnected] = React.useState(false);

  React.useEffect(() => {
    setIsConnected(getisConnected());
  }, [wallets]);

  const disconnectWallet = async () => {
    try {
      for (const wallet of wallets) {
        if (wallet.isConnected) {
          await wallet.disconnect();
        }
      }
    } catch (e) {
      console.log(e);
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="glass rounded-2xl p-6 max-w-md w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Wallet className="w-6 h-6 text-blue-400" />
                <h3 className="text-xl font-bold">Connect Wallet</h3>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 mb-6">
              {wallets.map((wallet) => (
                <motion.button
                  key={wallet.id}
                  onClick={() => handleWalletClick(wallet)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full flex items-center justify-between p-4 rounded-xl transition-all ${wallet.activeAccount
                      ? 'bg-blue-500/20 border-2 border-blue-500'
                      : 'bg-white/5 border border-white/10 hover:bg-white/10'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={wallet.metadata.icon}
                      alt={wallet.metadata.name}
                      className="w-8 h-8 rounded-lg"
                    />
                    <div className="text-left">
                      <div className="font-medium">{wallet.metadata.name}</div>
                      {wallet.activeAccount && (
                        <div className="text-xs text-gray-400">
                          {wallet.activeAccount.address.slice(0, 6)}...
                          {wallet.activeAccount.address.slice(-4)}
                          {wallet.isActive && ' (active)'}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>

            {isConnected && (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={disconnectWallet}
                className="w-full py-3 bg-red-500/20 border border-red-500 rounded-xl font-medium text-red-400 hover:bg-red-500/30 transition-all mb-4"
              >
                Disconnect Wallet
              </motion.button>
            )}

            <div className="text-center text-sm text-gray-400">
              <span>New to Algorand? </span>
              <a
                href="https://algorand.co/wallets"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 inline-flex items-center gap-1"
              >
                Learn more
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ConnectWalletModal;
