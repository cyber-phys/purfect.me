import React, { useEffect, useState, useRef } from "react";
import { Textarea, Select, SelectItem, Avatar, Button, ScrollShadow, Switch } from "@nextui-org/react";
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

const multimodalModels = [
    { name: "Anthropic: Claude 3 Haiku", id: "anthropic/claude-3-haiku" },
    { name: "Anthropic: Claude 3 Haiku (self-moderated)", id: "anthropic/claude-3-haiku:beta" },
    { name: "Anthropic: Claude 3 Opus", id: "anthropic/claude-3-opus" },
    { name: "Anthropic: Claude 3 Sonnet", id: "anthropic/claude-3-sonnet" },
    { name: "Anthropic: Claude 3 Opus (self-moderated)", id: "anthropic/claude-3-opus:beta" },
    { name: "Anthropic: Claude 3 Sonnet (self-moderated)", id: "anthropic/claude-3-sonnet:beta" },
    { name: "Google: Gemini Pro Vision 1.0", id: "google/gemini-pro-vision" },
    { name: "Nous: Hermes 2 Vision 7B (alpha)", id: "nousresearch/nous-hermes-2-vision-7b" },
    { name: "Llava 13B", id: "haotian-liu/llava-13b" },
    { name: "OpenAI: GPT-4 Vision", id: "openai/gpt-4-vision-preview" }
];

const voices = [
    // { name: "Rick", id: "voices/rick.wav" },
    { name: "Golden Voice", id: "/voices/goldvoice.wav" }
];

export default function App() {
    const [models, setModels] = useState<ModelData[]>([]);
    const [selectedModel, setSelectedModel] = useState<string | undefined>(undefined);
    const [avatarImage, setAvatarImage] = useState<File | null>(null);
    const [startingMessages, setStartingMessages] = useState<string[]>([]);
    const [currentMessage, setCurrentMessage] = useState<string>("");
    const [isBaseModelMultiModal, setIsBaseModelMultiModal] = useState(false);
    const [isVideoTranscriptionEnabled, setIsVideoTranscriptionEnabled] = useState(false);
    const [isVideoTranscriptionContinuous, setIsVideoTranscriptionContinuous] = useState(false);
    const [selectedVideoTranscriptionModel, setSelectedVideoTranscriptionModel] = useState<string | undefined>(undefined);
    const [selectedVideoTranscriptionInterval, setSelectedVideoTranscriptionInterval] = useState<string>("60");
    const [selectedVoice, setSelectedVoice] = useState<string | undefined>(undefined);

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

    useEffect(() => {
        if (!isVideoTranscriptionEnabled) {
            setIsVideoTranscriptionContinuous(false);
        }
    }, [isVideoTranscriptionEnabled]);

    const handleSubmit = (event) => {
        event.preventDefault();
        // Handle form submission logic here
        console.log("Form submitted");
    };

    const getSelectedModelDetails = () => {
        const model = models.find((model) => model.id === selectedModel);
        if (model) {
            const outputTokensPrice = parseFloat(model.pricing.completion) * 1000000;
            const InputTokensPrice = parseFloat(model.pricing.prompt) * 1000000;
            return (
                <div className="mt-2">
                    <p>Context: {model.context_length}</p>
                    <p>Input Tokens: ${InputTokensPrice.toLocaleString()} / 1M</p>
                    <p>Output Tokens: ${outputTokensPrice.toLocaleString()} / 1M</p>
                </div>
            );
        }
        return null;
    };

    const getVideoModelDetails = () => {
        const model = models.find((model) => model.id === selectedVideoTranscriptionModel);
        if (model) {
            const interval = parseInt(selectedVideoTranscriptionInterval, 10);
            const pricePerMinute = 255 * 60 / interval * parseFloat(model.pricing.image);
            const outputTokensPrice = parseFloat(model.pricing.completion) * 1000000;
            const InputTokensPrice = parseFloat(model.pricing.prompt) * 1000000;
            const ImageTokensPrice = parseFloat(model.pricing.image) * 1000;
            return (
                <div className="mt-2">
                    <p>Context: {model.context_length}</p>
                    <p>Input Image Tokens: ${ImageTokensPrice.toLocaleString()} / 1K</p>
                    <p>Output Tokens: ${outputTokensPrice.toLocaleString()} / 1M</p>
                    {isVideoTranscriptionContinuous && (
                        <p>  Per Minute: ${pricePerMinute.toFixed(2)}</p>
                    )}
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
                    <ChatBubbles />
                    <Select
                        label="Voice"
                        placeholder="Choose a voice"
                        value={selectedVoice}
                        onChange={(e) => setSelectedVoice(e.target.value)}
                        className="w-full"
                    >
                        {voices.map((voice) => (
                            <SelectItem key={voice.id} value={voice.id}>
                                {voice.name}
                            </SelectItem>
                        ))}
                    </Select>                    <Select
                        label="Base Model"
                        placeholder="Choose a model"
                        value={selectedModel}
                        onChange={(e) => {
                            setSelectedModel(e.target.value);
                            setIsVideoTranscriptionEnabled(multimodalModels.some((model) => model.id === e.target.value));
                            setIsBaseModelMultiModal(multimodalModels.some((model) => model.id === e.target.value));
                        }}
                        className="w-full py-2"
                    >
                        {models.map((model) => (
                            <SelectItem key={model.id} value={model.id}>
                                {model.name}
                            </SelectItem>
                        ))}
                    </Select>
                    {getSelectedModelDetails()}
                    <div className="py-2">
                        <Switch
                            isSelected={isVideoTranscriptionEnabled}
                            // checked={isVideoTranscriptionEnabled}
                            onChange={(e) => setIsVideoTranscriptionEnabled(e.target.checked)}
                            isDisabled={multimodalModels.some((model) => model.id === selectedModel)}
                        >
                            Video Transcriptions
                        </Switch>
                        {isBaseModelMultiModal && (
                            <p className="text-small text-default-500 text-center">Base model is multimodal</p>
                        )}
                    </div>
                    {isVideoTranscriptionEnabled && (
                        <div>
                            <Switch
                                isSelected={isVideoTranscriptionContinuous && isVideoTranscriptionEnabled}
                                onChange={(e) => setIsVideoTranscriptionContinuous(e.target.checked)}
                            >
                                Continous Video Transcription
                            </Switch>
                            {isVideoTranscriptionEnabled && isVideoTranscriptionContinuous && (
                                <div className="py-2">
                                    <Select
                                        label="Video Transcription Interval"
                                        value={selectedVideoTranscriptionInterval}
                                        onChange={(e) => setSelectedVideoTranscriptionInterval(e.target.value)}
                                        className="w-full"
                                    >
                                        <SelectItem key="5" value="5">5 seconds</SelectItem>
                                        <SelectItem key="10" value="10">10 seconds</SelectItem>
                                        <SelectItem key="60" value="60">60 seconds</SelectItem>
                                    </Select>
                                </div>
                            )}
                            <Select
                                label="Video Transcription Model"
                                placeholder="Choose a model"
                                value={selectedVideoTranscriptionModel}
                                onChange={(e) => setSelectedVideoTranscriptionModel(e.target.value)}
                                className="w-full py-2"
                            >
                                {models
                                    .filter((model) =>
                                        multimodalModels.some((multimodalModel) => multimodalModel.id === model.id)
                                    )
                                    .map((model) => (
                                        <SelectItem key={model.id} value={model.id}>
                                            {model.name}
                                        </SelectItem>
                                    ))}
                            </Select>
                            {getVideoModelDetails()}
                        </div>
                    )}
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