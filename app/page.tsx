import { Button, buttonVariants } from '@/components/ui/button';

import Image from 'next/image';
import { siteConfig } from '@/config/site';
import Link from 'next/link';
import { NavigationMenu } from '@radix-ui/react-navigation-menu';

import AuthProvider from './AuthProvider';
import { SignInButton } from '@/components/Auth/AuthButtons';
import { z } from 'zod';
import { Github, GithubIcon } from 'lucide-react';

const envSchema = z.object({
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  NEXTAUTH_URL: z.string().optional(),
  NEXTAUTH_SECRET: z.string().optional(),
  POSTGRES_URL: z.string().optional(),
  POSTGRES_PRISMA_URL: z.string().optional(),
  POSTGRES_URL_NON_POOLING: z.string().optional(),
  POSTGRES_USER: z.string().optional(),
  POSTGRES_HOST: z.string().optional(),
  POSTGRES_PASSWORD: z.string().optional(),
  POSTGRES_DATABASE: z.string().optional(),
  NEXT_PUBLIC_CODE_EXEC_URL: z.string(),
  SERVERLESS_EXEC_ROUTE: z.string().optional(),
  NEXT_PUBLIC_SOCKET_SERVER_URL: z.string(),
  IS_TAURI_BUILD: z.string(),
  NEXT_PUBLIC_GOD_MODE: z.string(),
});
declare global {
  namespace NodeJS {
    interface ProcessEnv extends z.infer<typeof envSchema> {}
  }
}

export default function Home() {
  envSchema.parse(process.env);

  return (
    <>
      <div className="h-1/2 w-full flex flex-col sm:flex-row  items-center justify-center p-5">
        <div className="w-full sm:w-1/2 h-full flex flex-col items-center justify-center">
          <div className="flex max-w-[980px] bg-opacity-60  flex-col justify-start items-start gap-2 mb-6">
            <h1 className="text-3xl font-extrabold opacity-70 leading-tight tracking-tighter sm:text-4xl md:text-6xl lg:text-7xl">
              {'Take your algorithms to the next level'}
            </h1>
            <div className="flex items-center justify-start mt-6 w-full">
              <Link href="/visualizer" className="mr-6">
                <Button
                  className="sm:text-xl sm:p-7 p-4 text-md font-bold w-fit text-gray-300 hover:scale-105 transition bg-opacity-50"
                  variant="outline"
                >
                  Start visualizing
                </Button>
              </Link>

              <Link
                href={'https://github.com/RobPruzan/Algoviz'}
                className="w-fit h-fit   p-[6px] sm:p-4  border-2 rounded-md hover:bg-accent"
              >
                <Github />
              </Link>
            </div>
          </div>
        </div>
        <div className="w-full sm:w-1/2 h-full flex flex-col items-center justify-center p-5">
          <div className="relative flex justify-start items-center border-2 w-fit h-fit shadow-lg shadow-gray-900">
            <Image
              className=" "
              alt="tree"
              src={'/platform.png'}
              width={750}
              height={450}
            />
          </div>
        </div>
      </div>
    </>
  );
}
