import React, { useEffect, useState, useRef } from "react";
import { Textarea, Select, SelectItem, Avatar, Button, ScrollShadow } from "@nextui-org/react";
import { CameraIcon } from "@/components/CameraIcon";
import { PlusIcon } from "@/components/PlusIcon";

type ModelData = {
  id: string;
  name: string;
  description: string;
  pricing: Pricing;
  context_length: number;
  architecture: Architecture;
  top_provider: TopProvider;
  per_request_limits: PerRequestLimits | null;
};

type Pricing = {
  prompt: string;
  completion: string;
  image: string;
  request: string;
};

type Architecture = {
  modality: string;
  tokenizer: string;
  instruct_type: string | null;
};

type TopProvider = {
  max_completion_tokens: number | null;
  is_moderated: boolean;
};

type PerRequestLimits = {
  prompt_tokens: string;
  completion_tokens: string;
} | null;

type ModelsJSON = {
  data: ModelData[];
};

export default function App() {
    const [models, setModels] = useState<ModelData[]>([]);
    const [selectedModel, setSelectedModel] = useState<string | undefined>(undefined);
    const [avatarImage, setAvatarImage] = useState<File | null>(null);
    const [startingMessages, setStartingMessages] = useState<string[]>([]);
    const [currentMessage, setCurrentMessage] = useState<string>("");
  
    useEffect(() => {
      const fetchModels = async () => {
        try {
          const response = await fetch("https://openrouter.ai/api/v1/models");
          const data: ModelsJSON = await response.json();
          setModels(data.data);
        } catch (error) {
          console.error("Error fetching models:", error);
        }
      };
  
      fetchModels();
    }, []);
  
    const handleSubmit = (event) => {
      event.preventDefault();
      // Handle form submission logic here
      console.log("Form submitted");
    };
  
    const getSelectedModelDetails = () => {
        const model = models.find((model) => model.id === selectedModel);
        if (model) {
          return (
            <div className="mt-2">
              <p>Context: {model.context_length}</p>
              <p>Input Tokens: ${model.pricing.prompt} / 1M</p>
              <p>Output Tokens: ${model.pricing.completion} / 1M</p>
            </div>
          );
        }
        return null;
      };
    
      const handleAvatarClick = () => {
        const fileInput = document.createElement("input");
        fileInput.type = "file";
        fileInput.accept = "image/*";
        fileInput.onchange = (event) => {
          const file = (event.target as HTMLInputElement).files?.[0];
          if (file) {
            setAvatarImage(file);
          }
        };
        fileInput.click();
      };

      const handleMessageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setCurrentMessage(event.target.value);
      };
    
      const handleAddMessage = () => {
        if (currentMessage.trim() !== "") {
          setStartingMessages([...startingMessages, currentMessage]);
          setCurrentMessage("");
        }
      };

      const handleRemoveMessage = (index: number) => {
        const updatedMessages = [...startingMessages];
        updatedMessages.splice(index, 1);
        setStartingMessages(updatedMessages);
      };

      const ChatBubbles = () => {
        const [contentHeight, setContentHeight] = useState(0);
        const contentRef = useRef<HTMLDivElement>(null);
      
        useEffect(() => {
          if (contentRef.current) {
            setContentHeight(contentRef.current.scrollHeight);
          }
        }, [startingMessages]);
      
        const maxHeight = 160; // Maximum height in pixels
      
        return (
          <ScrollShadow className={`w-full ${contentHeight > maxHeight ? "h-40" : ""}`}>
            <div
              ref={contentRef}
              className="space-y-2 flex flex-col p-2"
              style={{ maxHeight: `${maxHeight}px` }}
            >
              {startingMessages.map((message, index) => (
                <div
                  key={index}
                  className="bg-gray-200 dark:bg-gray-700 rounded-lg p-2 relative"
                >
                  {message}
                  <button
                    className="absolute top-1 right-1 text-red-500 hover:text-red-700 focus:outline-none"
                    onClick={() => handleRemoveMessage(index)}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </ScrollShadow>
        );
      };
    
      return (
        <div className="flex justify-center items-center h-screen dark text-foreground bg-background">
          <div className="flex-col border border-violet-400 p-4 rounded">
            <h1 className="text-violet-200">Create a new character</h1>
            <div className="py-2">
                <div className="flex items-center justify-center space-x-4">
                  <Avatar
                    showFallback
                    src={avatarImage ? URL.createObjectURL(avatarImage) : undefined}
                    fallback={
                      <CameraIcon
                        className="animate-pulse w-6 h-6 text-default-500 cursor-pointer"
                        fill="currentColor"
                        size={20}
                        onClick={handleAvatarClick}
                      />
                    }
                    onClick={handleAvatarClick}
                    style={{ cursor: "pointer" }}
                  />
                </div>
              </div>
            <form onSubmit={handleSubmit} className="w-full max-w-xs">
              <Textarea
                isRequired
                label="Name"
                placeholder="Enter character's name"
                variant="bordered"
                className="w-full py-2"
              />
              <Textarea
                isRequired
                label="Prompt"
                placeholder="Enter character prompt"
                variant="bordered"
                className="w-full py-2"
              />
            <div className="flex items-center space-x-2 py-2">
                <Textarea
                    label="Starting Messages"
                    placeholder="Enter a starting message"
                    value={currentMessage}
                    onChange={handleMessageChange}
                    variant="bordered"
                    className="w-full"
                />
                <Button
                    onClick={handleAddMessage}
                >
                    <PlusIcon fill="currentColor" size={20} />
                </Button>
                </div>
                    <ChatBubbles/>
              <Select
                label="Select a model"
                placeholder="Choose a model"
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full py-2"
              >
                {models.map((model) => (
                  <SelectItem key={model.id} value={model.id}>
                    {model.name}
                  </SelectItem>
                ))}
              </Select>
              {getSelectedModelDetails()}
              <button
                type="submit"
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
              >
                Submit
              </button>
            </form>
          </div>
        </div>
      );
    }