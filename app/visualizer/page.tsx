'use client';
import Visualize from '@/app/visualizer/Visualize';
import { AlgoComboBox } from '@/app/visualizer/Sort/AlgoComboBox';

import { useState } from 'react';
import Content from './Content';
import SideBar from './SideBar';

const page = () => {
  return (
    <div className="h-screen w-screen flex justify-evenly items-start">
      <Content>
        <SideBar />
        <Visualize />
      </Content>
    </div>
  );
};

export default page;
