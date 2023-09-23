import { Button, buttonVariants } from '@/components/ui/button';

import Image from 'next/image';
import { siteConfig } from '@/config/site';
import Link from 'next/link';
import { NavigationMenu } from '@radix-ui/react-navigation-menu';

import AuthProvider from './AuthProvider';
import { SignInButton } from '@/components/Auth/AuthButtons';
import { z } from 'zod';

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
      {/* 
      <section className="container grid items-center gap-6 pb-8 pt-6 md:py-10">
        <div className="flex max-w-[980px] bg-opacity-60  flex-col items-start gap-2">
          <h1 className="text-2xl font-extrabold opacity-70 leading-tight tracking-tighter sm:text-4xl md:text-6xl lg:text-7xl">
            {'Take your algorithms to the next level'}
          </h1>
        </div>
        <Link href="/visualizer">
          <Button
            className="sm:text-xl sm:p-7 p-4 text-md font-bold w-fit text-gray-300 hover:scale-105 transition bg-opacity-50"
            variant="outline"
          >
            Start visualizing
          </Button>
        </Link>
      </section>
      <div className="w-screen flex items-center justify-center">
        <div className="relative flex justify-center items-center border-2 w-fit h-fit shadow-lg shadow-gray-900">
          <Image
            className=" "
            alt="tree"
            src={'/platform.png'}
            width={850}
            height={400}
          />
        </div>
      </div>
      
      
      */}
      <div className="h-1/2 w-full flex flex-col sm:flex-row  items-center justify-center p-5">
        <div className="w-full sm:w-1/2 h-full flex flex-col items-center justify-center">
          <div className="flex max-w-[980px] bg-opacity-60  flex-col justify-start items-start gap-2 mb-6">
            <h1 className="text-2xl font-extrabold opacity-70 leading-tight tracking-tighter sm:text-4xl md:text-6xl lg:text-7xl">
              {'Take your algorithms to the next level'}
            </h1>
            <Link href="/visualizer" className="mt-6">
              <Button
                className="sm:text-xl sm:p-7 p-4 text-md font-bold w-fit text-gray-300 hover:scale-105 transition bg-opacity-50"
                variant="outline"
              >
                Start visualizing
              </Button>
            </Link>
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
