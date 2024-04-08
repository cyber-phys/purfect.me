import { NextRequest } from "next/server";
import { getRequestContext } from '@cloudflare/next-on-pages'

type Character = {
    id: string;
    name: string;
    voice: string;
    base_model: string;
    bio: string;
    creation_time: string;
};

export const config = {
    runtime: 'edge',
};

export default async function handler(req: NextRequest) {
    if (req.method === "GET") {
        const db = getRequestContext().env.CHARACTERS_DB;

        const charactersData = await db.prepare(`
        SELECT id, name, voice, base_model, bio, creation_time FROM characters`).all();

        if (!charactersData || charactersData.results.length === 0) {
            return new Response(JSON.stringify({ message: "No characters found" }), {
                status: 404,
                headers: { "Content-Type": "application/json" },
            });
        }

        return new Response(JSON.stringify(charactersData.results), {
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