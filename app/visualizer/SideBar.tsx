import React, { Dispatch, SetStateAction, useState } from 'react';
import { AlgoComboBox } from './AlgoComboBox';
import { Algorithms } from '@/lib/types';

type Props = {
  algorithm: Algorithms | undefined;
  setAlgorithm: Dispatch<SetStateAction<Algorithms | undefined>>;
};

const SideBar = ({ algorithm, setAlgorithm }: Props) => {
  return (
    <div className="w-44 min-w-fit h-[90%] rounded-md border-2 border-foreground flex flex-col justify-start items-center p-5">
      <AlgoComboBox value={algorithm} setValue={setAlgorithm} />
    </div>
  );
};

export default SideBar;
