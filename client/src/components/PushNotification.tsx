import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Radio, Music } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SendMessageModal from './SendMessageModal';
import logoUrl from '@/assets/logo.png';

const messages = [
  {
    id: 1,
    icon: Radio,
    title: "Quer ouvir seu nome na rádio?",
    description: "Mande seu recado e receba um alô exclusivo!",
    cta: "👉 Toque aqui e participe",
    rating: true
  },
  {
    id: 2,
    icon: Music,
    title: "📻 Seu recado no ar!",
    description: "Peça sua música ou mande um abraço especial",
    cta: "👉 Clique e participe agora",
    rating: true
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

  const currentMessage = messages[currentMessageIndex];
  const Icon = currentMessage.icon;

  return (
    <>
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-36 right-4 left-4 z-[100] mx-auto max-w-[400px] md:bottom-40"
            data-testid="push-notification"
          >
            <div
              onClick={handleClick}
              className="relative bg-white rounded-lg shadow-xl border border-gray-200 cursor-pointer hover:shadow-2xl transition-all overflow-hidden"
            >
              {/* Close button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClose}
                className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full hover:bg-gray-100 p-0 z-10"
                data-testid="close-notification"
              >
                <X className="w-3.5 h-3.5 text-gray-500" />
              </Button>
              
              <div className="flex items-start gap-3 p-3">
                {/* Logo/Icon Section */}
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary to-blue-600 rounded-lg flex items-center justify-center">
                    {currentMessageIndex === 0 ? (
                      <img src={logoUrl} alt="RádioPlay" className="w-8 h-8 object-contain filter brightness-0 invert" />
                    ) : (
                      <Icon className="w-6 h-6 text-white" />
                    )}
                  </div>
                </div>

                {/* Content Section */}
                <div className="flex-1 pr-4">
                  <h3 className="text-sm font-bold text-gray-900 leading-tight mb-1">
                    {currentMessage.title}
                  </h3>
                  <p className="text-xs text-gray-600 leading-normal mb-2">
                    {currentMessage.description}
                  </p>
                  
                  {/* Rating Stars */}
                  {currentMessage.rating && (
                    <div className="flex items-center gap-0.5 mb-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span key={star} className="text-yellow-400 text-xs">
                          ★
                        </span>
                      ))}
                      <span className="text-xs text-gray-500 ml-1">(4.9)</span>
                    </div>
                  )}
                  
                  {/* CTA Text */}
                  <p className="text-xs font-semibold text-primary">
                    {currentMessage.cta}
                  </p>
                </div>
              </div>

              {/* Bottom accent line */}
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary to-blue-600"></div>
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