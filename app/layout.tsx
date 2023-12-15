import { cn } from "@/lib/utils";
import AuthProvider from "./AuthProvider";
import "./globals.css";
import { Inter } from "next/font/google";
import { fontSans } from "@/lib/fonts";
import { SignInButton } from "@/components/Auth/AuthButtons";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { ModeToggle } from "@/components/ui/mode-toggle";
import ShareableLink from "@/components/ShareableLink";
import React from "react";

import { QueryProvider } from "./QueryProvider";
import { Provider } from "react-redux";
import { store } from "@/redux/store";
import ReduxProvider from "./ReduxProvider";
import PlaygroundsButton from "./PlaygroundsButton";
import { Toaster } from "@/components/ui/toaster";
import ConnectedUsers from "./ConnectedUsers";
import { CanvasContext } from "@/context/CanvasContext";
import { Providers } from "./Providers";
import AdminNav from "@/components/AdminNav";
import HomeButton from "./HomeButton";
import { Github } from "lucide-react";
import UpgradePlayground from "./UpgradePlayground";
import { CommandDialogDemo } from "@/components/ui/CommandDialog";
import { EditorNav } from "@/components/EditorNav";
// const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: "AlgoViz",
  description:
    "A custom playground to visualize your algorithms in the browser",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={cn(
          "min-h-screen bg-background  font-sans antialiased ",
          fontSans.variable
        )}
      >
        <Providers>
          <div className="h-screen w-screen ">
            <div className="h-[5%] w-full flex items-center justify-center">
              <nav className="w-screen pt-[25px] px-[25px] flex justify-end items-center top-full">
                <div className="w-3/6 flex justify-start items-center ">
                  <HomeButton />

                  <PlaygroundsButton />
                  <AdminNav className="mx-2" />
                  <EditorNav />
                </div>

                <div className="w-2/6 " />

                <div className="w-[60%] flex justify-end items-center">
                  {/* <CommandDialogDemo /> */}
                  <UpgradePlayground />
                  <Link
                    aria-label="github-repo"
                    href={"https://github.com/RobPruzan/Algoviz"}
                    className="hidden md:flex w-fit h-fit  p-[.4rem] mx-2 border-2 rounded-md hover:bg-accent"
                  >
                    <Github />
                  </Link>

                  <ConnectedUsers />

                  <ShareableLink />
                  <div className="mx-2">
                    <ModeToggle />
                  </div>
                  <div className="mx-2">
                    <SignInButton />
                  </div>
                </div>
              </nav>
            </div>
            <div className="h-[95%] w-full flex flex-col items-center justify-evenly overflow-hidden">
              {children}
              <Toaster />
            </div>
          </div>
        </Providers>
        <SpeedInsights />
      </body>
    </html>
  );
}
