import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SendMessageModal from './SendMessageModal';

const messages = [
  {
    id: 1,
    text: "Quer ouvir seu nome na rádio?\nMande agora seu recado e receba um **\"Alô\" exclusivo na sua rádio favorita**!\n👉 Toque aqui e participe!"
  },
  {
    id: 2,
    text: "📻 Seu recado no ar!\nPeça sua música ou mande aquele abraço na sua rádio favorita.\n👉 Clique e participe!"
  }
];

export default function PushNotification() {
  const [isVisible, setIsVisible] = useState(false);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [showSendMessageModal, setShowSendMessageModal] = useState(false);

  useEffect(() => {
    // Initial delay of 3 seconds before first notification
    const initialTimeout = setTimeout(() => {
      setIsVisible(true);
    }, 3000);

    // Show notification every 180 seconds (3 minutes)
    const interval = setInterval(() => {
      setIsVisible(true);
      setCurrentMessageIndex(prev => (prev + 1) % messages.length);
    }, 180000); // 180 seconds

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (isVisible) {
      // Auto-dismiss after 10 seconds
      const dismissTimeout = setTimeout(() => {
        setIsVisible(false);
      }, 10000);

      return () => clearTimeout(dismissTimeout);
    }
  }, [isVisible]);

  const handleClick = () => {
    setIsVisible(false);
    setShowSendMessageModal(true);
  };

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsVisible(false);
  };

  const formatMessage = (text: string) => {
    // Split by ** for bold text
    const parts = text.split(/\*\*(.*?)\*\*/g);
    return parts.map((part, index) => {
      if (index % 2 === 1) {
        // Bold part
        return <strong key={index} className="font-bold">{part}</strong>;
      }
      // Regular part, split by newline
      return part.split('\n').map((line, lineIndex) => (
        <span key={`${index}-${lineIndex}`}>
          {line}
          {lineIndex < part.split('\n').length - 1 && <br />}
        </span>
      ));
    });
  };

  return (
    <>
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-20 right-4 z-50 w-[calc(100%-2rem)] max-w-sm md:bottom-24 md:right-6"
            data-testid="push-notification"
          >
            <div
              onClick={handleClick}
              className="relative bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl shadow-2xl p-4 cursor-pointer hover:scale-[1.02] transition-transform"
            >
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClose}
                className="absolute top-2 right-2 w-7 h-7 rounded-full hover:bg-white/20 p-0"
                data-testid="close-notification"
              >
                <X className="w-4 h-4" />
              </Button>
              
              <div className="pr-6">
                <div className="text-sm leading-relaxed">
                  {formatMessage(messages[currentMessageIndex].text)}
                </div>
              </div>

              {/* Pulse animation indicator */}
              <div className="absolute -top-1 -right-1">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-500"></span>
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <SendMessageModal
        open={showSendMessageModal}
        onOpenChange={setShowSendMessageModal}
      />
    </>
  );
}