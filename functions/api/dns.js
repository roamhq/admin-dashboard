import { decryptToken } from "./token.js"; // Correct import

export async function onRequest({ request, env }) {
    if (request.method === "GET") {
        const url = new URL(request.url);
        const token = url.searchParams.get("token");

        if (!token) {
            return new Response(JSON.stringify({ error: "Missing token" }), { status: 400 });
        }

        // Correctly pass the secret key
        const clientName = await decryptToken(token, env.DNS_SECRET_KEY);

        if (!clientName) {
            return new Response(JSON.stringify({ error: "Invalid token" }), { status: 403 });
        }

        const { results } = await env.DB.prepare("SELECT * FROM dns_records WHERE client = ?")
            .bind(clientName)
            .all();

        return new Response(JSON.stringify(results), {
            headers: { "Content-Type": "application/json" },
        });
    }

    if (request.method === "POST") {
        const { client, type, host, data } = await request.json();
        await env.DB.prepare("INSERT INTO dns_records (client, type, host, data) VALUES (?, ?, ?, ?)")
            .bind(client, type, host, data)
            .run();

        return new Response(JSON.stringify({ success: true }), { status: 201 });
    }

    return new Response("Method Not Allowed", { status: 405 });
}
