import { NextRequest } from "next/server";
import { v4 as uuidv4 } from "uuid";

export const config = {
    runtime: 'edge',
};

export default async function handler(req: NextRequest) {
    if (req.method === "POST") {
        const characterData = await req.json();

        // Generate a UUID for the character
        const characterId = uuidv4();

        // TODO: Save the character data to a database or file system
        // You can use the characterId as a unique identifier for the character

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