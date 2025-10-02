import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
  Music, 
  TrendingUp, 
  DollarSign, 
  Sparkles,
  Radio,
  Coins,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Zap,
  Users,
  Gift,
  Shield,
  ChevronRight,
  Play,
  Star
} from "lucide-react";
import logoUrl from '@/assets/logo.png';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface WelcomeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: () => void;
}

export default function WelcomeModal({ open, onOpenChange, onComplete }: WelcomeModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const totalSteps = 5;

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    onComplete();
    onOpenChange(false);
  };

  const handleStart = () => {
    onComplete();
    onOpenChange(false);
  };

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 300 : -300,
      opacity: 0
    })
  };

  const swipeConfidenceThreshold = 10000;
  const swipePower = (offset: number, velocity: number) => {
    return Math.abs(offset) * velocity;
  };

  const [[page, direction], setPage] = useState([0, 0]);

  const paginate = (newDirection: number) => {
    const newStep = currentStep + newDirection;
    if (newStep >= 0 && newStep < totalSteps) {
      setPage([newStep, newDirection]);
      setCurrentStep(newStep);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        // Step 1: Welcome
        return (
          <motion.div
            key="step-0"
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 }
            }}
            className="space-y-4"
          >
            <div className="flex justify-center mb-4">
              <div className="bg-gradient-to-br from-primary to-blue-500 p-4 rounded-full">
                <Sparkles className="w-12 h-12 text-white" />
              </div>
            </div>
            
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-gray-900">
                Bem-vindo ao RádioPlay! 🎉
              </h2>
              <p className="text-base text-gray-600">
                Ganhe dinheiro ouvindo suas rádios favoritas
              </p>
            </div>
            
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4">
              <p className="text-sm text-gray-700 text-center leading-relaxed">
                Você está prestes a descobrir uma maneira incrível de 
                <span className="font-semibold text-blue-600"> ganhar dinheiro real </span>
                enquanto curte suas músicas preferidas. É simples, rápido e totalmente gratuito!
              </p>
            </div>
            
            <div className="flex items-center justify-center gap-3 pt-2">
              <div className="flex items-center gap-2 bg-white rounded-full px-3 py-1.5 shadow-sm border border-gray-200">
                <Users className="w-4 h-4 text-blue-500" />
                <span className="text-xs font-medium text-gray-700">+10k usuários ativos</span>
              </div>
              <div className="flex items-center gap-2 bg-white rounded-full px-3 py-1.5 shadow-sm border border-gray-200">
                <Star className="w-4 h-4 text-yellow-500" />
                <span className="text-xs font-medium text-gray-700">4.8 avaliação</span>
              </div>
            </div>
          </motion.div>
        );
        
      case 1:
        // Step 2: How it works
        return (
          <motion.div
            key="step-1"
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 }
            }}
            className="space-y-4"
          >
            <div className="text-center space-y-2 mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Como Funciona 📻
              </h2>
              <p className="text-sm text-gray-600">
                Em apenas 3 passos simples
              </p>
            </div>
            
            <div className="space-y-3">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="flex items-start gap-3 bg-white rounded-xl p-4 shadow-sm border border-gray-100"
              >
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Radio className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-gray-900 mb-1">
                    1. Escolha uma rádio para ouvir
                  </h3>
                  <p className="text-xs text-gray-600">
                    Temos diversas estações disponíveis com diferentes estilos musicais
                  </p>
                </div>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex items-start gap-3 bg-white rounded-xl p-4 shadow-sm border border-gray-100"
              >
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-gray-900 mb-1">
                    2. Ganhe pontos automaticamente
                  </h3>
                  <p className="text-xs text-gray-600">
                    Enquanto você escuta, os pontos são creditados em tempo real
                  </p>
                </div>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex items-start gap-3 bg-white rounded-xl p-4 shadow-sm border border-gray-100"
              >
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <DollarSign className="w-5 h-5 text-purple-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-gray-900 mb-1">
                    3. Converta seus pontos em dinheiro
                  </h3>
                  <p className="text-xs text-gray-600">
                    Saque direto para seu PIX quando atingir o mínimo necessário
                  </p>
                </div>
              </motion.div>
            </div>
            
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-3 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-blue-600" />
              <p className="text-xs text-gray-700">
                <span className="font-medium">Dica:</span> Quanto mais tempo ouvindo, mais você ganha!
              </p>
            </div>
          </motion.div>
        );
        
      case 2:
        // Step 3: Points System
        return (
          <motion.div
            key="step-2"
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 }
            }}
            className="space-y-4"
          >
            <div className="text-center space-y-2 mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Sistema de Pontos 💰
              </h2>
              <p className="text-sm text-gray-600">
                Entenda como funciona a conversão
              </p>
            </div>
            
            <div className="space-y-3">
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-4 border border-yellow-200">
                <div className="flex items-center gap-2 mb-3">
                  <Coins className="w-5 h-5 text-yellow-600" />
                  <h3 className="text-sm font-semibold text-gray-900">
                    Ganho de Pontos
                  </h3>
                </div>
                <p className="text-xs text-gray-700 mb-2">
                  Cada rádio oferece diferentes pontos por minuto:
                </p>
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600">Rádios básicas:</span>
                    <span className="font-semibold text-blue-600">1-3 pts/min</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600">Rádios populares:</span>
                    <span className="font-semibold text-blue-600">4-6 pts/min</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600">Rádios premium:</span>
                    <span className="font-semibold text-purple-600">7-10 pts/min</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
                <div className="flex items-center gap-2 mb-3">
                  <DollarSign className="w-5 h-5 text-blue-600" />
                  <h3 className="text-sm font-semibold text-gray-900">
                    Tabela de Conversão
                  </h3>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between bg-white rounded-lg px-3 py-2">
                    <span className="text-xs font-medium text-gray-700">100 pontos</span>
                    <ChevronRight className="w-3 h-3 text-gray-400" />
                    <span className="text-xs font-bold text-blue-600">R$ 7,50</span>
                  </div>
                  <div className="flex items-center justify-between bg-white rounded-lg px-3 py-2">
                    <span className="text-xs font-medium text-gray-700">250 pontos</span>
                    <ChevronRight className="w-3 h-3 text-gray-400" />
                    <span className="text-xs font-bold text-blue-600">R$ 24,00</span>
                  </div>
                  <div className="flex items-center justify-between bg-white rounded-lg px-3 py-2">
                    <span className="text-xs font-medium text-gray-700">400 pontos</span>
                    <ChevronRight className="w-3 h-3 text-gray-400" />
                    <span className="text-xs font-bold text-blue-600">R$ 60,00</span>
                  </div>
                  <div className="flex items-center justify-between bg-white rounded-lg px-3 py-2">
                    <span className="text-xs font-medium text-gray-700">600 pontos</span>
                    <ChevronRight className="w-3 h-3 text-gray-400" />
                    <span className="text-xs font-bold text-blue-600">R$ 150,00</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-blue-50 rounded-lg p-3 flex items-start gap-2">
                <Zap className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-gray-700">
                  <span className="font-medium">Importante:</span> Os pontos são salvos automaticamente em sua conta!
                </p>
              </div>
            </div>
          </motion.div>
        );
        
      case 3:
        // Step 4: Important Tips
        return (
          <motion.div
            key="step-3"
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 }
            }}
            className="space-y-4"
          >
            <div className="text-center space-y-2 mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Dicas para Maximizar seus Ganhos 🚀
              </h2>
              <p className="text-sm text-gray-600">
                Aproveite ao máximo o RádioPlay
              </p>
            </div>
            
            <div className="space-y-2.5">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="flex items-start gap-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-3 border border-blue-100"
              >
                <Play className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="text-xs font-semibold text-gray-900">
                    Mantenha a rádio tocando
                  </h3>
                  <p className="text-xs text-gray-600 mt-0.5">
                    Quanto mais tempo ouvindo, mais pontos você acumula
                  </p>
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="flex items-start gap-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-3 border border-purple-100"
              >
                <Radio className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="text-xs font-semibold text-gray-900">
                    Explore diferentes rádios
                  </h3>
                  <p className="text-xs text-gray-600 mt-0.5">
                    Cada rádio tem uma taxa de pontos diferente
                  </p>
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="flex items-start gap-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-3 border border-blue-100"
              >
                <Gift className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="text-xs font-semibold text-gray-900">
                    Converta pontos regularmente
                  </h3>
                  <p className="text-xs text-gray-600 mt-0.5">
                    Não deixe acumular muito, saque sempre que possível
                  </p>
                </div>
              </motion.div>
              
            </div>
            
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-3 flex items-center gap-2">
              <Star className="w-4 h-4 text-yellow-600" />
              <p className="text-xs text-gray-700">
                <span className="font-medium">Bônus:</span> Usuários ativos ganham pontos extras!
              </p>
            </div>
          </motion.div>
        );
        
      case 4:
        // Step 5: Let's Start
        return (
          <motion.div
            key="step-4"
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 }
            }}
            className="space-y-4"
          >
            <div className="flex justify-center mb-4">
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
                className="bg-gradient-to-br from-primary to-blue-500 p-4 rounded-full"
              >
                <Music className="w-12 h-12 text-white" />
              </motion.div>
            </div>
            
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-gray-900">
                Pronto para Começar? 🎵
              </h2>
              <p className="text-base text-gray-600">
                Sua jornada para ganhar dinheiro começa agora!
              </p>
            </div>
            
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4">
              <p className="text-sm text-gray-700 text-center leading-relaxed">
                Você está a um clique de começar a 
                <span className="font-semibold text-blue-600"> ganhar dinheiro </span>
                enquanto ouve suas músicas favoritas. Escolha uma rádio e deixe a magia acontecer!
              </p>
            </div>
            
            <div className="space-y-2 pt-2">
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <CheckCircle className="w-4 h-4 text-blue-500" />
                <span>100% Gratuito</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <CheckCircle className="w-4 h-4 text-blue-500" />
                <span>Pagamento garantido via PIX</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <CheckCircle className="w-4 h-4 text-blue-500" />
                <span>Suporte 24/7</span>
              </div>
            </div>
            
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                repeatType: "reverse"
              }}
              className="pt-2"
            >
              <Button
                onClick={handleStart}
                className="w-full bg-gradient-to-r from-primary to-blue-500 hover:from-primary/90 hover:to-blue-600 text-white font-bold py-5 text-base shadow-lg"
                data-testid="button-start-welcome-final"
              >
                Começar a Ganhar
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </motion.div>
          </motion.div>
        );
        
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95%] max-w-md p-0 bg-white rounded-2xl border-0 max-h-[90vh] flex flex-col">
        {/* Header with Logo - Fixed at top */}
        <div className="bg-gradient-to-br from-primary to-blue-500 px-6 pt-6 pb-4 flex-shrink-0">
          <div className="flex items-center justify-between mb-4">
            <img src={logoUrl} alt="RádioPlay" className="h-8 object-contain" />
            <button
              onClick={handleSkip}
              className="text-white/80 hover:text-white text-xs font-medium transition-colors"
              data-testid="button-skip-welcome"
            >
              Pular introdução
            </button>
          </div>
          
          {/* Progress Indicators */}
          <div className="flex items-center justify-center gap-1.5">
            {Array.from({ length: totalSteps }).map((_, index) => (
              <motion.div
                key={index}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  index === currentStep 
                    ? 'w-8 bg-white' 
                    : index < currentStep
                    ? 'w-1.5 bg-white/60'
                    : 'w-1.5 bg-white/30'
                }`}
                initial={false}
                animate={{
                  width: index === currentStep ? 32 : 6
                }}
              />
            ))}
          </div>
        </div>
        
        {/* Content - Scrollable */}
        <div className="px-6 py-6 overflow-y-auto flex-1">
          <AnimatePresence mode="wait" custom={direction}>
            {renderStep()}
          </AnimatePresence>
        </div>
        
        {/* Navigation Buttons - Fixed at bottom */}
        {currentStep < totalSteps - 1 && (
          <div className="px-6 pb-6 flex items-center justify-between flex-shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className={`${currentStep === 0 ? 'invisible' : ''}`}
              data-testid="button-previous-step"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Anterior
            </Button>
            
            <Button
              onClick={handleNext}
              size="sm"
              className="bg-gradient-to-r from-primary to-blue-500 hover:from-primary/90 hover:to-blue-600 text-white"
              data-testid="button-next-step"
            >
              Próximo
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}