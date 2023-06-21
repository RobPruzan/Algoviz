import Visualize from '@/app/visualizer/Visualize';
import { AlgoComboBox } from '@/app/visualizer/Sort/AlgoComboBox';

import { useState } from 'react';
import Content from './Content';
import SideBar from './SideBar';
import CodeExecution from './Canvas/CodeExecution';
import Resizable from './Resizeable';
import ContentWrapper from './ContentWrapper';
export const metadata = {
  content:
    'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no',
};
const page = () => {
  return (
    <div className="h-screen w-screen flex items-display ">
      <Content>
        <ContentWrapper />
      </Content>
    </div>
  );
};

export default page;
