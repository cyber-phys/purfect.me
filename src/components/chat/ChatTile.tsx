import { ChatMessage } from "@/components/chat/ChatMessage";
import { ChatMessageInput } from "@/components/chat/ChatMessageInput";
import { ChatMessage as ComponentsChatMessage } from "@livekit/components-react";
import { useEffect, useRef, useState } from "react";

const inputHeight = 48;

export type ChatMessageType = {
  id: string;
  timestamp: number;
  isSelf: boolean;
  highlight_word_count: number;
  name: string;
  message: string;
  parent_id: string;
  alt_ids: string[];
  conversation_id: string;
  character_id: string;
  model: string;
  type: string;
};

type ChatTileProps = {
  messages: ChatMessageType[];
  accentColor: string;
  onSend?: (message: string) => Promise<ComponentsChatMessage>;
  onCommand?: (command: string, arg?: string) => void;
};

export const ChatTile = ({ messages, accentColor, onSend, onCommand }: ChatTileProps) => {
  const [selectedMessageIndex, setSelectedMessageIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleCommand = (command: string) => {
    // Split the command by spaces or by square brackets for backward compatibility
    const parts = command.includes(' ') ? command.split(' ') : command.slice(1).split(/\[(\d+)\]/);
    const cmd = parts[0].startsWith('!') ? parts[0].slice(1) : parts[0]; // Remove '!' if present
    const argIndex = parts.length > 1 ? parseInt(parts[1], 10) : undefined;
    const altPosition = parts.length > 2 ? parseInt(parts[2], 10) : undefined; // Adjust for zero-based index
  
    // Convert the argIndex to the corresponding message ID, if valid
    let argId;
    if (typeof argIndex === 'number' && messages[argIndex]) {
      if (cmd === "alt" && typeof altPosition === 'number') {
        // For !alt command with altPosition, use alt_id at specified position if available
        const altIds = messages[argIndex].alt_ids;
        argId = altIds && altIds.length > altPosition ? altIds[altPosition] : undefined;
      } else {
        // For other commands or if altPosition is not specified, use the main message ID
        argId = messages[argIndex].id;
      }
    }
  
    switch (cmd) {
      case "help":
        // Handle !help command
        console.log("Handling !help command");
        break;
      case "fw":
        // Handle !fw[n] or !fw n command with onCommand callback, passing the message ID instead of index
        console.log(`Handling !fw command with argument ID: ${argId}`);
        if (onCommand && argId) onCommand("fw", argId);
        break;
      case "rgen":
        // Handle !rgen or !rgen n command with onCommand callback, passing the message ID instead of index
        console.log(`Handling !rgen command with argument ID: ${argId}`);
        if (onCommand && argId) onCommand("rgen", argId);
        break;
      case "alt":
        // Handle !alt[n] [x] command with onCommand callback, passing the alt_id at position x if specified
        console.log(`Handling !alt command with argument ID: ${argId}`);
        if (onCommand && argId) onCommand("alt", argId);
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
              pos={index}
              alt_ids={message.alt_ids}
              id = {message.id}
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