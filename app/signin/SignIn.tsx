'use client';
import { Button } from '@/components/ui/button';
import { Provider } from 'next-auth/providers';
import { signIn } from 'next-auth/react';
import Image from 'next/image';
import React from 'react';

type Props = {
  googleProvider: { id: string; name: string };
};

const SignIn = ({ googleProvider }: Props) => {
  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <DemoCreateAccount googleProvider={googleProvider} />
    </div>
  );
};

export default SignIn;

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Icons } from '@/components/ui/icons';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { InfoIcon } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export function DemoCreateAccount({ googleProvider }: Props) {
  return (
    <Card className="w-2/4 sm:2/5 lg:w-1/4">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">Create an account</CardTitle>
        <CardDescription className="w-full flex">
          Sign in with google
          <TooltipProvider>
            <Tooltip delayDuration={0}>
              <TooltipTrigger className="ml-2" asChild>
                <InfoIcon className="hover:fill-accent" />
              </TooltipTrigger>
              <TooltipContent className="max-w-[300px]">
                <p>
                  Only name, email and pfp are shared by Google. And, by signing
                  in you will be able to:
                  <ul>
                    <li>- Save Algorithms or Datastructures</li>
                    <li>
                      - Create shareable links for people to join your
                      playground
                    </li>
                    <li>- Create playgrounds</li>
                  </ul>
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="flex items-center justify-center">
          <Button
            className="w-full"
            onClick={() => {
              void signIn(googleProvider.id, {
                callbackUrl: window.location.origin,
              });
            }}
            variant="outline"
          >
            <Icons.google className="mr-2 h-4 w-4" />
            Google
          </Button>
        </div>
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground flex items-center">
              Or continue as guest{' '}
              <TooltipProvider>
                <Tooltip delayDuration={0}>
                  <TooltipTrigger className="ml-2" asChild>
                    <InfoIcon className="hover:fill-accent" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-[300px]">
                    <p
                      style={{
                        textTransform: 'initial',
                      }}
                      className="upp"
                    >
                      <b>By signing in as guest, you wont be able to:</b>
                      <ul>
                        <li>- Save Algorithms or Datastructures</li>
                        <li>
                          - Create shareable links for people to join your
                          playground
                        </li>
                        <li>- Create playgrounds</li>
                      </ul>
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </span>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Link
          className="w-full border-2 hover:bg-accent transition flex items-center justify-center p-2 rounded-md "
          href={'/visualizer'}
        >
          Continue as guest
        </Link>
      </CardFooter>
    </Card>
  );
}
