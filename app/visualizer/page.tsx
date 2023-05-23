'use client';
import SortVisualize from '@/app/visualizer/SortVisualize';
import { AlgoComboBox } from '@/app/visualizer/AlgoComboBox';

import { useState } from 'react';
import Content from './Content';

// type Props = {}

const page = () => {
  return (
    <div className="h-screen w-screen flex justify-evenly items-center">
      <Content />
    </div>
  );
};

export default page;
