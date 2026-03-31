import { motion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';

export default function ChatIcon({ onClick }) {
  return (
    <motion.button
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full shadow-2xl flex items-center justify-center z-[9999] glow"
    >
      <MessageCircle className="w-8 h-8 text-white" />
    </motion.button>
  );
}
