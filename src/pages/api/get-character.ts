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

        const db = getRequestContext().env.CHARACTERS_DB;

        // Query the character data from the Cloudflare D1 database
        const characterData = await db.prepare(`
            SELECT * FROM characters WHERE id = ?
        `).bind(characterId).all();

        if (!characterData || characterData.results.length === 0) {
            return new Response(JSON.stringify({ message: "Character not found" }), {
                status: 404,
                headers: { "Content-Type": "application/json" },
            });
        }

        // Assuming characterData is an array of results, we take the first one
        console.log(characterData)
        const character = characterData.results[0];
        console.log(character)


        if (character && typeof character.starting_messages === 'string') {
            character.starting_messages = JSON.parse(character.starting_messages);
        }

        return new Response(JSON.stringify(character), {
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