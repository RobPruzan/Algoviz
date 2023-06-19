'use client';
import { SelectedGeometryInfo } from '@/lib/types';
import React, { useState } from 'react';
import CodeExecution from './Canvas/CodeExecution';
import Visualize from './Visualize';

type Props = {};

const ContentWrapper = (props: Props) => {
  const [selectedGeometryInfo, setSelectedGeometryInfo] =
    useState<SelectedGeometryInfo | null>(null);
  return (
    <>
      (
      <Visualize
        selectedGeometryInfo={selectedGeometryInfo}
        setSelectedGeometryInfo={setSelectedGeometryInfo}
      />
      <CodeExecution
        selectedGeometryInfo={selectedGeometryInfo}
        setSelectedGeometryInfo={setSelectedGeometryInfo}
      />
      )
    </>
  );
};

export default ContentWrapper;
