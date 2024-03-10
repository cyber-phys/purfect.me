import React from 'react';

type IncomingCallProps = {
  name: string;
  callType: string;
  onDecline: () => void;
  onAccept: () => void;
  onRemindMe: () => void;
  onMessage: () => void;
};

const IncomingCallScreen: React.FC<IncomingCallProps> = ({
  name,
  callType,
  onDecline,
  onAccept,
  onRemindMe,
  onMessage,
}) => {
  return (
    <div className="h-screen w-full bg-gradient-to-b from-[#160000] to-[#000116] flex flex-col justify-between">
      <div className="pt-10">
        <div className="text-center text-white">
          <h1 className="text-2xl font-semibold">Operator</h1>
          <p className="text-xl">Quantum Call</p>
        </div>
      </div>



      <div className="flex justify-around items-center pb-10">
        <button
          onClick={onDecline}
        >
          <img src={'/call-decline.svg'} style={{ width: '56px', height: '56px' }}/>
        </button>
        <button
          onClick={onAccept}
        >
          <img src={'/call-answer.svg'} style={{ width: '56px', height: '56px' }}/>
        </button>
      </div>
    </div>
  );
};

export default IncomingCallScreen;
