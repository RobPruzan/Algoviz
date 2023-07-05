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
  NEXT_PUBLIC_API_ROUTE: z.string(),
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
      <section className="container grid items-center gap-6 pb-8 pt-6 md:py-10">
        <div className="flex max-w-[980px] bg-opacity-60  flex-col items-start gap-2">
          <h1 className="text-2xl  font-extrabold opacity-70 leading-tight tracking-tighter sm:text-4xl md:text-6xl lg:text-7xl">
            {'Take your algorithms to the next level'}
          </h1>
        </div>
        <Link href="/visualizer">
          <Button
            className="sm:text-xl sm:p-7 p-4 text-md font-bold w-fit text-gray-300 hover:scale-105 transition bg-opacity-50"
            // variant="secondary"
            variant="outline"
          >
            Start visualizing
          </Button>
        </Link>
      </section>
      <div className="w-screen flex items-center justify-center">
        <div className="relative flex justify-center items-center border-2 w-fit h-fit shadow-lg shadow-gray-900">
          {/* <Image
          className=" opacity-30 filter grayscale absolute inset-0 ml-auto"
          alt="tree"
          src={'/tree.png'}
          width={800}
          height={800}
        /> */}
          <Image
            className=" w-[500px]  lg:w-[850px] "
            // className=" opacity-30 filter grayscale absolute inset-0 ml-auto"
            alt="tree"
            src={'/platform.png'}
            width={850}
            height={850}
          />
        </div>
      </div>
    </>
  );
}
