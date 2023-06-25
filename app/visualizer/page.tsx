import Visualize from '@/app/visualizer/Visualize';
import { AlgoComboBox } from '@/app/visualizer/Sort/AlgoComboBox';

import Content from './Content';
import SideBar from './SideBar';
import CodeExecution from './Canvas/CodeExecution';
import Resizable from './Resizeable';
import ContentWrapper from './ContentWrapper';
import { useSearchParams } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { store } from '@/redux/store';
import { CanvasActions } from '@/redux/slices/canvasSlice';
import { CircleReceiver, Edge } from '@/lib/types';
export const metadata = {};
type Props = {
  searchParams?: {
    ['playground-id']?: string;
  };
};
const page = async ({ searchParams }: Props) => {
  const playgroundID = searchParams?.['playground-id'];

  const shapes = await (playgroundID
    ? prisma.playground.findUnique({
        where: {
          id: +playgroundID,
        },
        select: {
          circles: true,
          lines: true,
          pencil: true,
        },
      })
    : null);

  console.log('the shapes', shapes);
  return (
    <div className="h-screen w-screen flex items-display ">
      <div className="h-[95%] w-full  ">
        <Content>
          <ContentWrapper shapes={shapes} />
        </Content>
      </div>
    </div>
  );
};

export default page;
