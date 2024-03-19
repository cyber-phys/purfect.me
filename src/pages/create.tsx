import React, { useEffect, useState } from "react";
import { Textarea, Select, SelectItem } from "@nextui-org/react";

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
    
      return (
        <div className="flex justify-center items-center h-screen dark text-foreground bg-background">
          <div className="flex-col border border-violet-400 p-4 rounded">
            <h1 className="text-violet-200">Create a new character</h1>
            <form onSubmit={handleSubmit} className="w-full max-w-xs">
              <Textarea
                isRequired
                label="Name"
                placeholder="Enter characters name"
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
              <div className="py-2">
                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">
                  Upload a photo
                </label>
                <input
                  type="file"
                  className="block w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 cursor-pointer dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
                />
              </div>
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