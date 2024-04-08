import { NextRequest } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { getRequestContext } from '@cloudflare/next-on-pages'

export const config = {
    runtime: 'edge',
};

type CharacterRequestBody = {
    name: string;
    bio: string;
    characterPrompt: string;
    videoSystemPrompt?: string;
    videoPrompt?: string;
    canvasSystemPrompt?: string;
    canvasPrompt?: string;
    startingMessages?: string[];
    voice?: string;
    baseModel: string;
    isVideoTranscriptionEnabled?: boolean;
    isVideoTranscriptionContinuous?: boolean;
    videoTranscriptionModel?: string;
    videoTranscriptionInterval?: string;
    isCanvasEnabled?: boolean;
    canvasModel?: string;
    canvasInterval?: string;
    avatarImage?: string;
};

export default async function handler(req: NextRequest) {
    if (req.method === "POST") {
        const {
            name,
            bio,
            characterPrompt,
            videoSystemPrompt = '',
            videoPrompt = '',
            canvasSystemPrompt = '',
            canvasPrompt = '',
            startingMessages = [],
            voice = '',
            baseModel,
            isVideoTranscriptionEnabled = false,
            isVideoTranscriptionContinuous = false,
            videoTranscriptionModel = '',
            videoTranscriptionInterval = '60',
            isCanvasEnabled = false,
            canvasModel = '',
            canvasInterval = '60',
            avatarImage = ''
        } = await req.json() as CharacterRequestBody;

        // Generate a UUID for the character
        const characterId = uuidv4();

        const db = getRequestContext().env.CHARACTERS_DB;

        // Save the character data to the database
        await db.prepare(`
            INSERT INTO characters (
                id,
                name,
                character_prompt,
                video_system_prompt,
                video_prompt,
                canvas_system_prompt,
                canvas_prompt,
                starting_messages,
                voice,
                base_model,
                is_video_transcription_enabled,
                is_video_transcription_continuous,
                video_transcription_model,
                video_transcription_interval,
                is_canvas_enabled,
                canvas_model,
                canvas_interval,
                bio,
                creation_time
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
            characterId,
            name,
            characterPrompt,
            videoSystemPrompt,
            videoPrompt,
            canvasSystemPrompt,
            canvasPrompt,
            JSON.stringify(startingMessages),
            voice,
            baseModel,
            isVideoTranscriptionEnabled ? 1 : 0,
            isVideoTranscriptionContinuous ? 1 : 0,
            videoTranscriptionModel,
            parseInt(videoTranscriptionInterval, 10),
            isCanvasEnabled ? 1 : 0,
            canvasModel,
            parseInt(canvasInterval, 10),
            bio,
            new Date().toISOString()
        ).run();

        // TODO: Handle the avatarImage (e.g., save it to a storage service)

        return new Response(JSON.stringify({ characterId }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } else {
        return new Response(JSON.stringify({ message: "Method not allowed" }), {
            status: 405,
            headers: { "Content-Type": "application/json" },
        });
    }
}