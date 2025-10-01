import { Button } from "@/components/ui/button";
import { Wallet } from "lucide-react";
import logoUrl from '@/assets/logo.png';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';

export default function Header() {
  const [, setLocation] = useLocation();
  
  // Fetch user data including balance
  const { data: userData, isLoading } = useQuery<{user: {balance: number}}>({
    queryKey: ['/api/auth/me'],
    refetchInterval: 30000, // Refresh every 30 seconds to keep balance updated
  });
  
  const balance = userData?.user?.balance || 0;
  
  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-10">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <img 
              src={logoUrl} 
              alt="RádioPlay" 
              className="h-7 md:h-9 w-auto object-contain" 
              data-testid="header-logo"
            />
          </div>
          
          {/* Balance and Wallet */}
          <div className="flex items-center gap-2 md:gap-3">
            <div 
              className="bg-green-50 text-green-700 px-3 py-1.5 rounded-lg font-semibold text-sm md:text-base"
              data-testid="balance-display"
            >
              {isLoading ? 'R$ ...' : `R$ ${balance.toFixed(2)}`}
            </div>
            <Button 
              size="icon" 
              variant="ghost" 
              className="w-9 h-9"
              data-testid="wallet-button"
              aria-label="Saque"
              onClick={() => setLocation('/resgatar')}
            >
              <Wallet className="w-5 h-5 text-gray-600" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}