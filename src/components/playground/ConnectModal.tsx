import React from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from '@nextui-org/react';
import { AgentState } from "@/lib/types";
import { useRouter } from 'next/router';

interface ConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect: () => void;
  themeColor: string;
  headerHeight: number;
  agentState: AgentState;
}

const ConnectionModal: React.FC<ConnectionModalProps> = ({ isOpen, onClose, onConnect, themeColor, headerHeight, agentState }) => {
    const router = useRouter();

    const handleClose = () => {
        // Check if the agentState is one of the specified states before closing
        if (['thinking', 'speaking', 'listening'].includes(agentState)) {
          onClose();
        }
    };

    // The onConnect function should be called without closing the modal
    const handleConnect = () => {
        onConnect();
        // Do not close the modal here. It should remain open until the agentState changes.
    };

    const handleChangeCharacter = () => {
        // Navigate back to the home page using Next.js router
        router.push('/');
    };

    return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      aria-labelledby="connection-modal"
      className={`selection:bg-${themeColor}-900`}
      style={{ height: `calc(100% - ${headerHeight}px - 100px)` }}
      hideCloseButton={true}
      classNames={{
        body: "py-6",
        // backdrop: "bg-[#292f46]/50 backdrop-opacity-40",
        base: "border-[#292f46] bg-[#19172c] dark:bg-[#19172c] text-[#a8b0d3]",
        header: "border-b-[1px] border-[#292f46]",
        footer: "border-t-[1px] border-[#292f46]",
        closeButton: "hover:bg-white/5 active:bg-white/10",
      }}
    >
      <ModalContent>
        <ModalHeader>
          <p className="text-white text-xl">Connect to quantum realm</p>
        </ModalHeader>
        <ModalBody>
          <p>Welcome to Purfect, the app that enables quantum link calls to other worlds! This is a voice-driven experience, so please enable microphone permissions when prompted on your device. Feel free to converse naturally - you can interrupt the voice at the other end by talking or sending a message. However, its always polite to let someone finish their thoughts. Thank you, and we hope you enjoy what were building! xoxo </p>
        </ModalBody>
        <ModalFooter>
          {/* <Button auto flat color="error" onClick={handleClose}>
            Cancel
          </Button> */}
          <Button onClick={handleChangeCharacter}>
            Change Character
          </Button>
          <Button onClick={handleConnect}>
            Connect
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ConnectionModal;