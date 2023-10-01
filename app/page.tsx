'use client';
import { Button, buttonVariants } from '@/components/ui/button';

import Image from 'next/image';
import { siteConfig } from '@/config/site';
import Link from 'next/link';
import { NavigationMenu } from '@radix-ui/react-navigation-menu';

import AuthProvider from './AuthProvider';
import { SignInButton } from '@/components/Auth/AuthButtons';
import { z } from 'zod';
import { Github, GithubIcon } from 'lucide-react';
import { useState } from 'react';

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
  // envSchema.parse(process.env);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      {/* <div className="bg-white">
        <header className="absolute inset-x-0 top-0 z-50">
          <nav
            className="flex items-center justify-between p-6 lg:px-8"
            aria-label="Global"
          >
            <div className="flex lg:flex-1">
              <a href="#" className="-m-1.5 p-1.5">
                <span className="sr-only">Your Company</span>
              </a>
            </div>
            <div className="flex lg:hidden">
              <button
                type="button"
                className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700"
                onClick={() => setMobileMenuOpen(true)}
              >
                <span className="sr-only">Open main menu</span>
              </button>
            </div>
            <div className="hidden lg:flex lg:gap-x-12">
            </div>
            <div className="hidden lg:flex lg:flex-1 lg:justify-end">
              <a
                href="#"
                className="text-sm font-semibold leading-6 text-gray-900"
              >
                Log in <span aria-hidden="true">&rarr;</span>
              </a>
            </div>
          </nav>
        </header>

        <div className="relative isolate px-6 pt-14 lg:px-8">
          <div
            className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
            aria-hidden="true"
          >
            <div
              className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
              style={{
                clipPath:
                  'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
              }}
            />
          </div>
          <div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56">
            <div className="hidden sm:mb-8 sm:flex sm:justify-center">
              <div className="relative rounded-full px-3 py-1 text-sm leading-6 text-gray-600 ring-1 ring-gray-900/10 hover:ring-gray-900/20">
                Announcing our next round of funding.{' '}
                <a href="#" className="font-semibold text-indigo-600">
                  <span className="absolute inset-0" aria-hidden="true" />
                  Read more <span aria-hidden="true">&rarr;</span>
                </a>
              </div>
            </div>
            <div className="text-center">
              <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
                Data to enrich your online business
              </h1>
              <p className="mt-6 text-lg leading-8 text-gray-600">
                Anim aute id magna aliqua ad ad non deserunt sunt. Qui irure qui
                lorem cupidatat commodo. Elit sunt amet fugiat veniam occaecat
                fugiat aliqua.
              </p>
              <div className="mt-10 flex items-center justify-center gap-x-6">
                <a
                  href="#"
                  className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  Get started
                </a>
                <a
                  href="#"
                  className="text-sm font-semibold leading-6 text-gray-900"
                >
                  Learn more <span aria-hidden="true">→</span>
                </a>
              </div>
            </div>
          </div>
          <div
            className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]"
            aria-hidden="true"
          >
            <div
              className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]"
              style={{
                clipPath:
                  'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
              }}
            />
          </div>
        </div>
      </div> */}
      <div className="h-5/6 w-full flex flex-col  items-center justify-evenly sm:justify-center  ">
        <div
          className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
          aria-hidden="true"
        >
          <div
            className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[rgb(67,28,87)] to-[#3c3783] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
            style={{
              clipPath:
                'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
            }}
          />
        </div>
        <div
          className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]"
          aria-hidden="true"
        >
          <div
            className="max-h-[350px] relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-3/4 bg-gradient-to-tr from-[rgb(67,28,87)] to-[#3c3783] opacity-30 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]"
            style={{
              clipPath:
                'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
            }}
          />
        </div>
        <div className="w-4/5 h-full sm:h-1/2 flex flex-col sm:flex-row justify-evenly items-center ">
          <div className="w-full h-full flex flex-col items-start justify-center sm:justify-evenly">
            <h1 className="font-extrabold opacity-70 leading-tight tracking-tighter text-3xl md:text-4xl  lg:text-5xl xl:text-5xl">
              {'Take your algorithms to the next level'}
            </h1>
            <Link href="/visualizer" className="">
              <Button
                className="sm:text-xl sm:p-7 p-4 text-md font-bold w-fit text-gray-300 hover:scale-105 transition bg-opacity-50"
                variant="outline"
              >
                Empty Playground
              </Button>
            </Link>
          </div>
          <div className="w-full flex items-center justify-end">
            <div className="relative flex justify-start items-center border-2 w-fit h-fit shadow-lg shadow-gray-900">
              <Image
                className=" "
                alt="tree"
                src={'/platform.png'}
                width={465}
                height={281.25}
              />
            </div>
          </div>
        </div>
        <div className="w-4/5 h-1/2 hidden sm:flex flex-wrap justify-around items-center ">
          <div className="items-center justify-center sm:justify-between sm:items-center h-1/2 w-full tall-show">
            <div className="border-2 shadow-2 shadow-accent shadow-md rounded-md p-3 sm:w-60 lg:w-72 h-40 hidden xl:flex flex-col">
              <div className="h-full w-full  text-2xl flex justify-center items-center text-foreground font-bold">
                Breadth First Search
              </div>
              <div className="h-full w-full  flex items-center justify-center ">
                <Link
                  className="w-full flex items-center justify-center"
                  href={'/visualizer?preset=breadth-first-search'}
                >
                  <Button className="w-3/4 text-md" variant={'outline'}>
                    View
                  </Button>
                </Link>
              </div>
            </div>
            <div className="border-2 shadow-2 shadow-accent shadow-md rounded-md p-3 sm:w-60 lg:w-72 h-40 hidden sm:flex  flex-col">
              <div className="h-full w-full  text-2xl flex justify-center items-center text-foreground font-bold">
                Depth First Search
              </div>
              <div className="h-full w-full  flex items-center justify-center ">
                <Link
                  className="w-full flex items-center justify-center"
                  href={'/visualizer?preset=depth-first-search'}
                >
                  <Button className="w-3/4 text-md" variant={'outline'}>
                    View
                  </Button>
                </Link>
              </div>
            </div>
            <div className="border-2 shadow-2 shadow-accent shadow-md rounded-md p-3 hidden  sm:w-60 lg:w-72 h-32 sm:h-40 sm:flex flex-col">
              <div className="h-full w-full  text-2xl flex justify-center items-center text-foreground font-bold">
                {"Dijkstra's"}
              </div>
              <div className="h-full w-full  flex items-center justify-center ">
                <Link
                  className="w-full flex items-center justify-center"
                  href={'/visualizer?preset=dijkstra'}
                >
                  <Button className="w-3/4 text-md" variant={'outline'}>
                    View
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          <div className=" justify-between items-center h-1/2 w-full hidden xl:flex">
            <div className="border-2 shadow-2 shadow-accent shadow-md rounded-md p-3 sm:w-60 lg:w-72 h-40 flex flex-col ">
              <div className="h-full w-full  text-2xl flex justify-center items-center text-foreground font-bold ">
                Red-black Tree
              </div>
              <div className="h-full w-full  flex items-center justify-center ">
                <Link
                  className="w-full flex items-center justify-center"
                  href={'/visualizer?preset=red-black-tree'}
                >
                  <Button className="w-3/4 text-md" variant={'outline'}>
                    View
                  </Button>
                </Link>
              </div>
            </div>
            <div className="border-2 shadow-2 shadow-accent shadow-md rounded-md p-3 sm:w-60 lg:w-72 h-40 flex flex-col">
              <div className="h-full w-full  text-2xl flex justify-center items-center text-foreground font-bold">
                Binary Search Tree
              </div>
              <div className="h-full w-full  flex items-center justify-center ">
                <Link
                  className="w-full flex items-center justify-center"
                  href={'/visualizer?preset=binary-search-tree'}
                >
                  <Button className="w-3/4 text-md" variant={'outline'}>
                    View
                  </Button>
                </Link>
              </div>
            </div>
            <div className="border-2 shadow-2 shadow-accent shadow-md rounded-md p-3 sm:w-60 lg:w-72 h-40 flex flex-col">
              <div className="h-full w-full  text-2xl flex justify-center items-center text-foreground font-bold">
                Heap
              </div>
              <div className="h-full w-full  flex items-center justify-center ">
                <Link
                  className="w-full flex items-center justify-center"
                  href={'/visualizer?prest=heap'}
                >
                  <Button className="w-3/4 text-md" variant={'outline'}>
                    View
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
