import { useEffect } from "react";

export default function Home() {
  useEffect(() => {
    // Add keyboard interaction
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === ' ' || event.key === 'Enter') {
        const greeting = document.querySelector('[data-testid="main-greeting"]') as HTMLElement;
        if (greeting) {
          greeting.style.transform = 'scale(1.05)';
          setTimeout(() => {
            greeting.style.transform = 'scale(1)';
          }, 150);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    
    // Performance optimization - reduce animations on slow devices
    if (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4) {
      document.querySelectorAll('[class*="animate-"]').forEach(el => {
        (el as HTMLElement).style.animation = 'none';
      });
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleGreetingClick = (event: React.MouseEvent<HTMLHeadingElement>) => {
    const target = event.currentTarget;
    target.style.transform = 'scale(0.95)';
    setTimeout(() => {
      target.style.transform = 'scale(1)';
    }, 100);
  };

  return (
    <div className="gradient-bg">
      <div className="min-h-screen flex items-center justify-center px-4 py-8">
        
        {/* Main Greeting */}
        <div className="text-center space-y-8 animate-fade-in">
          
          {/* Primary Greeting */}
          <div className="space-y-4">
            <h1 
              className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-light tracking-tight text-gradient animate-float cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-lg"
              onClick={handleGreetingClick}
              tabIndex={0}
              aria-label="Greeting: Hi"
              data-testid="main-greeting"
            >
              hi
            </h1>
            
            {/* Subtle subtitle for context */}
            <p 
              className="text-lg sm:text-xl md:text-2xl text-muted-foreground font-light tracking-wide animate-pulse-gentle"
              data-testid="welcome-text"
            >
              welcome
            </p>
          </div>

          {/* Decorative Elements */}
          <div className="flex justify-center space-x-2 mt-8" data-testid="decorative-dots">
            <div 
              className="w-2 h-2 bg-primary rounded-full animate-pulse-gentle" 
              style={{ animationDelay: '0s' }}
            ></div>
            <div 
              className="w-2 h-2 bg-primary/70 rounded-full animate-pulse-gentle" 
              style={{ animationDelay: '0.5s' }}
            ></div>
            <div 
              className="w-2 h-2 bg-primary/40 rounded-full animate-pulse-gentle" 
              style={{ animationDelay: '1s' }}
            ></div>
          </div>

          {/* Interactive Card */}
          <div className="mt-12 opacity-60 hover:opacity-100 transition-opacity duration-500">
            <div 
              className="bg-card/50 backdrop-blur-sm border border-border rounded-lg p-6 max-w-sm mx-auto shadow-lg hover:shadow-xl transition-shadow duration-300"
              data-testid="info-card"
            >
              <p className="text-sm text-muted-foreground">
                Simple. Clean. Effective.
              </p>
            </div>
          </div>

        </div>

        {/* Background Pattern */}
        <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl"></div>
        </div>

      </div>
    </div>
  );
}
