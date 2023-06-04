// 'use client';
import Visualize from '@/app/visualizer/Visualize';
import { AlgoComboBox } from '@/app/visualizer/Sort/AlgoComboBox';

import { useState } from 'react';
import Content from './Content';
import SideBar from './SideBar';
import CanvasVariableInspector from './Canvas/CanvasVariableInspector';
export const metadata = {
  content:
    'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no',
};
const page = () => {
  return (
    <div className="h-screen w-screen flex justify-evenly items-start">
      <Content>
        <SideBar />
        <Visualize />
        <CanvasVariableInspector />
      </Content>
    </div>
  );
};

export default page;
