import { useState, useEffect } from 'react';
import { X, Smartphone, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { pwaManager } from '@/lib/pwa';

export function PWAInstallPrompt() {
  // Component completely disabled - no install prompt will be shown
  return null;
}