import { cn } from '@/lib/utils';
import AuthProvider from './AuthProvider';
import './globals.css';
import { Inter } from 'next/font/google';
import { fontSans } from '@/lib/fonts';
import { SignInButton } from '@/components/Auth/AuthButtons';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { ThemeProvider } from '@/components/ThemeProvider';
import { ModeToggle } from '@/components/ui/mode-toggle';
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from '@/components/ui/dialog';
// import { Label } from '@/components/ui/label';
// import { Input } from '@/components/ui/input';
import ShareableLink from '@/components/ShareableLink';
import React from 'react';

import { QueryProvider } from './QueryProvider';
const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Create Next App',
  description: 'Generated by create next app',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  console.log('SHOULD BE ON SERVER');
  return (
    <html lang="en">
      <body
        className={cn(
          'min-h-screen bg-background  font-sans antialiased ',
          fontSans.variable
        )}
      >
        <AuthProvider>
          <QueryProvider>
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
              {/* temporary padding */}
              <nav className="w-screen pt-[10px] h-[15%] flex justify-end items-center px-[30px] ">
                <div className="w-3/6 flex justify-start items-center ">
                  <Link href="/">
                    <Button className="mr-2" variant="outline">
                      Home
                    </Button>
                  </Link>
                  <Link href="/create">
                    <Button className="mx-2" variant="outline">
                      Spaces
                    </Button>
                  </Link>
                </div>

                <div className="w-2/6  " />

                <div className="w-2/5 flex justify-end items-center">
                  <div className="mx-2 min-w-fit">
                    <ShareableLink />
                  </div>
                  <div className="mx-2">
                    <ModeToggle />
                  </div>
                  <div className="ml-2">
                    <SignInButton />
                  </div>
                </div>
              </nav>
              {/* <Navbar /> */}

              {children}
            </ThemeProvider>
          </QueryProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
