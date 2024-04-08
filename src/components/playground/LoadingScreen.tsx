import React, { useEffect, useState } from 'react';
import { Spinner, Progress } from '@nextui-org/react';

const LoadingScreen: React.FC = () => {
  const [progress, setProgress] = useState(0);
  const [flavorText, setFlavorText] = useState('');

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prevProgress) => {
        const newProgress = prevProgress + 10;
        if (newProgress >= 90) {
          clearInterval(timer);
          return 90;
        }
        return newProgress;
      });
    }, 500);

    return () => {
      clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    const texts = [
      'Loading awesome content...',
      'Preparing the magic...',
      'Hang tight, almost there...',
      'Initializing the fun...',
    ];

    let currentIndex = 0;
    const textTimer = setInterval(() => {
      setFlavorText(texts[currentIndex]);
      currentIndex = (currentIndex + 1) % texts.length;
    }, 2000);

    return () => {
      clearInterval(textTimer);
    };
  }, []);

  return (
    <div className="flex items-center justify-center w-full h-full">
      <div className="flex flex-col items-center text-white">
        <h1 className='p-8'>Connecting to the multiverse...</h1>
        <Spinner color="primary" size="lg" />
        <Progress
          value={progress}
          color="primary"
          size="sm"
          className="w-64 mt-4"
        />
        <p className="mt-2 text-lg text-center text-white">{flavorText}</p>
      </div>
    </div>
  );
};

export default LoadingScreen;