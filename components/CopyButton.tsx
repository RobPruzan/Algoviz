'use client';
import React, { ComponentProps, useState } from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { useInterval } from '@/hooks/useInterval';
import { CopyCheck, CopyIcon } from 'lucide-react';

type Props = {
  copyText: string;
};

function CopyButton({ copyText }: Props) {
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
      <Button onClick={copyToClipboard} variant={'outline'}>
        {showCopyAlert ? <CopyCheck size={20} /> : <CopyIcon size={20} />}
      </Button>
      <Input disabled value={copyText} className={`col-span-3 `} />
    </>
  );
}

export default CopyButton;
