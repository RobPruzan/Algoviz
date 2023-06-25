'use client';
import { store } from '@/redux/store';
import React from 'react';
import { Provider } from 'react-redux';

type Props = { children: React.ReactNode };

const ReduxProvider = ({ children }: Props) => {
  return <Provider store={store}>{children}</Provider>;
};

export default ReduxProvider;
