import React, { useEffect, useState, useRef } from "react";
import { Textarea, Select, SelectItem, Avatar, Button, ScrollShadow, Switch } from "@nextui-org/react";
import { useRouter } from 'next/router';

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

interface CharacterResponse {
    characterId: string;
}

export default function App() {
    const router = useRouter();
    const [voiceFile, setVoiceFile] = useState<File | null>(null); // New state for voice file

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const payload = {
            // name: (event.currentTarget.elements.namedItem("name") as HTMLInputElement | HTMLTextAreaElement)?.value,
            voiceFile: voiceFile ? await toBase64(voiceFile) : null // Include voice file in the payload
        };

        try {
            const response = await fetch("https://freiza-1.taildd8a6.ts.net:6969/start-training-base64", {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                console.log(response)
                // const data: CharacterResponse = await response.json();
                router.push(`/create`);
            } else {
                console.error("Error cloning voice:", response.statusText);
            }
        } catch (error) {
            console.error("Error creating character:", error);
        }
    };

    const toBase64 = (file: File) => new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });

    const handleVoiceFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setVoiceFile(file);
        }
    };

    useEffect(() => {
        // Add the class to the body tag
        document.body.classList.add('pm-index-body');
        document.body.classList.add('full-background-page');
    
    
        // Cleanup function to remove the class when the component unmounts
        return () => {
          document.body.classList.remove('pm-index-body');
          document.body.classList.remove('full-background-page');
    
        };
      }, []);

      return (
        <div className="flex text-black justify-center"> 
            <div className="creator-container">
                <h1 className="text-violet-200">Create a new voice</h1>
                    <form onSubmit={handleSubmit} className="w-full max-w-xs mb-10">
                        <Textarea
                            isRequired
                            label="Name"
                            name="name"
                            placeholder="Enter character's name"
                            variant="bordered"
                            className="w-full py-2"
                        />
                        <input
                            type="file"
                            accept="audio/*"
                            onChange={handleVoiceFileChange}
                            className="w-full py-2 mt-4"
                        />
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