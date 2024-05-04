import { NextRequest } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { getRequestContext } from '@cloudflare/next-on-pages'

export const config = {
    runtime: 'edge',
};

type CharacterRequestBody = {
    name: string;
    voiceFile?: string;
};

interface ApiResponse {
    job_id: string;
    error?: string;
}

export default async function handler(req: NextRequest) {
    let voiceID;
    if (req.method === "POST") {
        const {
            name,
            voiceFile,
        } = await req.json() as CharacterRequestBody;

        if (voiceFile) {
            // Define the API endpoint
            const apiEndpoint = 'https://freiza-1.taildd8a6.ts.net:6969/start-training-base64';

            // Prepare the request body
            const requestBody = {
                audio_data: voiceFile // The base64 encoded audio data
            };

            // Send the POST request to the API
            const response = await fetch(apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
            });

            const responseData = await response.json() as ApiResponse;
            
            if (!response.ok) {
                // return new Response(JSON.stringify({ error: responseData.error || 'Failed to start training job' }), {
                    return new Response(JSON.stringify({ error:'Failed to start training job' }), {

                    // status: response.status || 500,
                    status: 405,
                    headers: { "Content-Type": "application/json" },
                });
            }

            // Set voiceID to the returned job_id from the API response
            voiceID = responseData.job_id;
        } else {
            // Generate a UUID for the character if no voiceFile is provided
            return new Response(JSON.stringify({ error: "Voice file is required." }), {
                status: 400,
                headers: { "Content-Type": "application/json" },
            });
        }

        const db = getRequestContext().env.VOICE_DB;

        // Save the character data to the database
        await db.prepare(`
            INSERT INTO voices (
                id,
                name,
                creation_time
            )
            VALUES (?, ?, ?)
        `).bind(
            voiceID,
            name,
            new Date().toISOString()
        ).run();

        return new Response(JSON.stringify({ voiceID }), {
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