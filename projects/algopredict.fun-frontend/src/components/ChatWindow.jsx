import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bot, User, Send } from 'lucide-react';

export default function ChatWindow({ onClose }) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hi! I'm your AlgoPredict assistant. How can I help you today?",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const quickReplies = [
    "How do I create a prediction?",
    "How do I place a bet?",
    "How do I claim rewards?",
    "What are the fees?"
  ];

  const getBotResponse = (userMessage) => {
    const lowerMessage = userMessage.toLowerCase();

    if (lowerMessage.includes('create') || lowerMessage.includes('prediction')) {
      return "To create a prediction, click on 'Create Prediction' in the header. You'll need to be the admin to create predictions. Fill in the question, options, start/end times, category, and image URL.";
    } else if (lowerMessage.includes('bet') || lowerMessage.includes('place')) {
      return "To place a bet: 1) Connect your wallet, 2) Browse predictions on the home page, 3) Click on a prediction, 4) Select your option, 5) Enter the amount, and 6) Confirm the transaction!";
    } else if (lowerMessage.includes('claim') || lowerMessage.includes('reward')) {
      return "After a prediction ends and results are announced, if you won, you can claim your rewards by visiting the prediction page and clicking the 'Claim' button. Make sure you're connected with the same wallet you used to bet!";
    } else if (lowerMessage.includes('fee') || lowerMessage.includes('cost')) {
      return "The platform uses Algorand blockchain, so you'll pay minimal transaction fees (usually less than 0.01 ALGO). There are no additional platform fees - all the prize pool goes to winners!";
    } else if (lowerMessage.includes('wallet') || lowerMessage.includes('connect')) {
      return "Click 'Connect Wallet' in the header and choose your Algorand wallet (Pera, Defly, etc.). Make sure you have some ALGO in your wallet for transactions!";
    } else if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
      return "Hello! Welcome to AlgoPredict.fun! I'm here to help you with predictions, betting, and rewards. What would you like to know?";
    } else if (lowerMessage.includes('admin') || lowerMessage.includes('who can create')) {
      return "Only the admin wallet can create predictions. The admin address is configured in the smart contract. Regular users can browse predictions and place bets!";
    } else if (lowerMessage.includes('category') || lowerMessage.includes('categories')) {
      return "We have three categories: Movies, Politics, and Airdrops. You can filter predictions by category on the home page!";
    } else if (lowerMessage.includes('win') || lowerMessage.includes('payout')) {
      return "Your payout depends on the total prize pool and how many people bet on your option. The fewer people on your side, the higher your potential payout! It's calculated as: (Your Bet × Total Pool) / Total Bets on Your Option";
    } else if (lowerMessage.includes('testnet') || lowerMessage.includes('network')) {
      return "AlgoPredict runs on Algorand TestNet. Make sure your wallet is connected to TestNet and you have some TestNet ALGO for transactions!";
    } else {
      return "I'm here to help! You can ask me about creating predictions, placing bets, claiming rewards, fees, wallets, or general platform questions. What would you like to know?";
    }
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const newUserMessage = {
      id: messages.length + 1,
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newUserMessage]);
    setInputMessage('');
    setIsTyping(true);

    setTimeout(() => {
      const botResponse = {
        id: messages.length + 2,
        text: getBotResponse(inputMessage),
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1000);
  };

  const handleQuickReply = (reply) => {
    setInputMessage(reply);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 100, scale: 0.8 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 100, scale: 0.8 }}
        className="fixed bottom-24 right-6 w-[400px] h-[550px] glass rounded-2xl shadow-2xl flex flex-col z-[10000] overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-white">AlgoPredict Assistant</h3>
              <p className="text-xs text-white/80">Online</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#0a0a0f]/50">
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-2 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.sender === 'bot' && (
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="w-5 h-5 text-white" />
                </div>
              )}
              <div
                className={`max-w-[75%] p-3 rounded-2xl ${message.sender === 'user'
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                    : 'bg-white/10 text-white'
                  }`}
              >
                <p className="text-sm">{message.text}</p>
                <p className="text-xs opacity-60 mt-1">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              {message.sender === 'user' && (
                <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-white" />
                </div>
              )}
            </motion.div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-2 justify-start"
            >
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="bg-white/10 p-3 rounded-2xl">
                <div className="flex gap-1">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 0.6, delay: 0 }}
                    className="w-2 h-2 bg-white/60 rounded-full"
                  />
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }}
                    className="w-2 h-2 bg-white/60 rounded-full"
                  />
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }}
                    className="w-2 h-2 bg-white/60 rounded-full"
                  />
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Replies */}
        {messages.length <= 2 && (
          <div className="px-4 py-2 bg-[#0a0a0f]/50 border-t border-white/10">
            <p className="text-xs text-gray-400 mb-2">Quick questions:</p>
            <div className="flex flex-wrap gap-2">
              {quickReplies.map((reply, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleQuickReply(reply)}
                  className="text-xs px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-full border border-white/10 transition-colors"
                >
                  {reply}
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="p-4 border-t border-white/10 bg-[#0a0a0f]/50">
          <div className="flex gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Type your message..."
              className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400"
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSendMessage}
              disabled={!inputMessage.trim()}
              className="px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5 text-white" />
            </motion.button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
