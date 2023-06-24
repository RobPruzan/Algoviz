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
        {/* {showCopyAlert ? <CopyCheck size={20} /> : <CopyIcon size={20} />} */}
        {/* {match(showCopyAlert)
          .when(
            (show) => show && !isLoading,
            () => <CopyCheck size={20} />
          )
          .when(
            (show) => show && isLoading,
            () => <>LOADING</>
          )
          .when(
            (show) => !show,
            () => <CopyIcon size={20} />
          )
          .run()} */}
        {isLoading && <LoaderIcon className="animate-spin" />}
        {!isLoading && showCopyAlert && <CopyCheck size={20} />}
        {!isLoading && !showCopyAlert && <CopyIcon size={20} />}

        {/* {(() => {
          console.log(showCopyAlert, isLoading);
          if (showCopyAlert && !isLoading) {
            return <CopyCheck size={20} />;
          } else if (showCopyAlert && isLoading) {
            console.log('this case');

            return <>LOADING</>;
          } else {
            return <>else</>;
          }
        })()} */}
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
