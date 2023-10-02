'use client';
import { ThemeProvider } from 'next-themes';
import AuthProvider from './AuthProvider';
import { QueryProvider } from './QueryProvider';
import ReduxProvider from './ReduxProvider';
import { CanvasProvider } from './CanvasProvider';
import { TooltipProvider } from '@/components/ui/tooltip';

export const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <AuthProvider>
      <QueryProvider>
        <ReduxProvider>
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
            <CanvasProvider>{children}</CanvasProvider>
          </ThemeProvider>
        </ReduxProvider>
      </QueryProvider>
    </AuthProvider>
  );
};
