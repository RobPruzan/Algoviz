import { Button, buttonVariants } from '@/components/ui/button';

import Image from 'next/image';
import { siteConfig } from '@/config/site';
import Link from 'next/link';
import { NavigationMenu } from '@radix-ui/react-navigation-menu';
import { Navbar } from '@/components/Navbar';

export default function Home() {
  return (
    <>
      <section className="container grid items-center gap-6 pb-8 pt-6 md:py-10">
        <div className="flex max-w-[980px] bg-opacity-60 shadow-xl flex-col items-start gap-2">
          <h1 className="text-2xl  font-extrabold opacity-70 leading-tight tracking-tighter sm:text-4xl md:text-6xl lg:text-7xl">
            {'Beautiful visualizations of data structures and algorithms'}
          </h1>
        </div>
        <Link href="/visualizer">
          <Button
            className="text-2xl p-7 font-bold w-fit text-gray-300 hover:scale-105 transition bg-opacity-50"
            variant="secondary"
          >
            Start visualizing
          </Button>
        </Link>
      </section>
      <div className="w-screen relative flex justify-center items-center">
        <Image
          className=" opacity-30 filter grayscale absolute inset-0 ml-auto shadow-2xl "
          alt="tree"
          src={'/tree.png'}
          width={800}
          height={800}
        />
      </div>
    </>
  );
}
