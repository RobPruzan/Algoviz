'use client';
import React, { ComponentProps, useState } from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { useInterval } from '@/hooks/useInterval';
import { CopyCheck, CopyIcon, LoaderIcon } from 'lucide-react';
import { match } from 'ts-pattern';

type Props = {
  copyText: string;
  isLoading: boolean;
};

function CopyButton({ copyText, isLoading }: Props) {
  const [showCopyAlert, setShowCopyAlert] = useState(false);

  const copyToClipboard = async () => {
    try {
      setShowCopyAlert(true);

      await navigator.clipboard.writeText(copyText);
      setTimeout(() => setShowCopyAlert(false), 1500);
    } catch (err) {
      console.error('Failed to copy text: ', err);
      setShowCopyAlert(false);
    }
  };

  return (
    <>
      <Button
        disabled={isLoading}
        onClick={copyToClipboard}
        variant={'outline'}
      >
        {isLoading && <LoaderIcon className="animate-spin" />}
        {!isLoading && showCopyAlert && <CopyCheck size={20} />}
        {!isLoading && !showCopyAlert && <CopyIcon size={20} />}
      </Button>
      <Input
        disabled
        value={copyText}
        className={`col-span-3 overflow-y-scroll`}
      />
    </>
  );
}

export default CopyButton;
