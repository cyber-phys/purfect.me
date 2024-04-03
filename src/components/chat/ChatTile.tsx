import { ChatMessage } from "@/components/chat/ChatMessage";
import { ChatMessageInput } from "@/components/chat/ChatMessageInput";
import { ChatMessage as ComponentsChatMessage } from "@livekit/components-react";
import { useEffect, useRef, useState } from "react";

const inputHeight = 48;

export type ChatMessageType = {
  name: string;
  message: string;
  isSelf: boolean;
  timestamp: number;
  highlight_word_count: number;
};

type ChatTileProps = {
  messages: ChatMessageType[];
  accentColor: string;
  onSend?: (message: string) => Promise<ComponentsChatMessage>;
  onCommand?: (command: string, arg?: number) => void;
};

export const ChatTile = ({ messages, accentColor, onSend, onCommand }: ChatTileProps) => {
  const [selectedMessageIndex, setSelectedMessageIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleCommand = (command: string) => {
    const [cmd, arg] = command.slice(1).split(/\[(\d+)\]/);
    const numArg = arg ? parseInt(arg, 10) : undefined;
  
    switch (cmd) {
      case "help":
        // Handle !help command
        console.log("Handling !help command");
        break;
      case "fw":
        // Handle !fw[n] command
        console.log(`Handling !fw command with argument: ${numArg}`);
        break;
      case "rgen":
        // Handle !rgen command
        console.log("Handling !rgen command");
        break;
      case "alt":
        // Handle !alt[n] command
        console.log(`Handling !alt command with argument: ${numArg}`);
        break;
      default:
        console.log(`Unknown command: ${command}`);
    }
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowUp") {
        setSelectedMessageIndex((prevIndex) =>
          prevIndex !== null ? Math.max(prevIndex - 1, 0) : messages.length - 1
        );
      } else if (event.key === "ArrowDown") {
        setSelectedMessageIndex((prevIndex) =>
          prevIndex !== null ? Math.min(prevIndex + 1, messages.length - 1) : 0
        );
      }
    };
  
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [messages]);
  
  //TODO Scroll to selected message is still sorta broken... 
  useEffect(() => {
    if (selectedMessageIndex !== null && containerRef.current) {
      const selectedMessageElement = containerRef.current.children[selectedMessageIndex];
      if (selectedMessageElement) {
        selectedMessageElement.scrollIntoView({ behavior: "smooth", block: "end" });
      }
    }
  }, [selectedMessageIndex]);

  return (
    <div className="flex flex-col gap-4 w-full h-full">
      <div
        ref={containerRef}
        className="overflow-y-auto"
        style={{
          height: `calc(100% - ${inputHeight}px)`,
        }}
      >
        <div className="flex flex-col min-h-full justify-end gap-6">
          {messages.map((message, index) => (
            <ChatMessage
              key={index}
              name={message.name}
              message={message.message}
              isSelf={message.isSelf}
              accentColor={accentColor}
              highlight_word_count={message.highlight_word_count}
              isSelected={index === selectedMessageIndex}
            />
          ))}
        </div>
      </div>
      <ChatMessageInput
        height={inputHeight}
        placeholder="Type a message"
        accentColor={accentColor}
        onSend={onSend}
        onCommand={handleCommand}
      />
    </div>
  );
};