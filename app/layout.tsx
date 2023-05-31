import { cn } from '@/lib/utils';
import AuthProvider from './AuthProvider';
import './globals.css';
import { Inter } from 'next/font/google';
import { fontSans } from '@/lib/fonts';
import { SignInButton } from '@/components/Auth/AuthButtons';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
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
  return (
    <AuthProvider>
      <html lang="en">
        <body
          className={cn(
            'min-h-screen bg-background dark font-sans antialiased',
            fontSans.variable
          )}
        >
          <nav className="w-screen p-3 flex justify-end items-center m-2">
            <div className="w-1/5 flex justify-center items-center">
              <Button className="bg-secondary ">
                <Link href="/">Home</Link>
              </Button>
            </div>

            <div className="w-3/5 flex items-center " />

            <div className="w-1/5 flex justify-center items-center">
              <SignInButton />
            </div>
          </nav>
          {/* <Navbar /> */}
          {children}
        </body>
      </html>
    </AuthProvider>
  );
}
