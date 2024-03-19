import { NextRequest } from "next/server";
import { getRequestContext } from '@cloudflare/next-on-pages'

export const config = {
    runtime: 'edge',
};

export default async function handler(req: NextRequest) {
    if (req.method === "GET") {
        const { searchParams } = new URL(req.url);
        const characterId = searchParams.get("id");

        if (!characterId) {
            return new Response(JSON.stringify({ message: "Character ID is required" }), {
                status: 400,
                headers: { "Content-Type": "application/json" },
            });
        }

        const myKv = getRequestContext().env.CHARACTERS_KV;

        // Retrieve the character data from KV store
        const characterData = await myKv.get(characterId);

        if (!characterData) {
            return new Response(JSON.stringify({ message: "Character not found" }), {
                status: 404,
                headers: { "Content-Type": "application/json" },
            });
        }

        return new Response(characterData, {
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