import { NextRequest } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { getRequestContext } from '@cloudflare/next-on-pages'

export const config = {
    runtime: 'edge',
};

type CharacterRequestBody = {
    avatarImage?: string; // Assuming avatarImage is a base64 string or URL
    [key: string]: any; // For the rest of the character data
};

export default async function handler(req: NextRequest) {
    if (req.method === "POST") {
        const { avatarImage, ...characterData } = await req.json() as CharacterRequestBody;

        // Generate a UUID for the character
        const characterId = uuidv4();

        const myKv = getRequestContext().env.CHARACTERS_KV;

        // Save the character data to KV store
        await myKv.put(characterId, JSON.stringify(characterData));

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