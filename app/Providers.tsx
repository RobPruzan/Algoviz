'use client';
import { ThemeProvider } from 'next-themes';
import AuthProvider from './AuthProvider';
import { QueryProvider } from './QueryProvider';
import ReduxProvider from './ReduxProvider';
import { CanvasProvider } from './CanvasProvider';

export const Providers = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>
    <QueryProvider>
      <ReduxProvider>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <CanvasProvider>{children}</CanvasProvider>
        </ThemeProvider>
      </ReduxProvider>
    </QueryProvider>
  </AuthProvider>
);
