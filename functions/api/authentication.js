export async function onRequest({ request, env }) {
    if (request.method === 'OPTIONS') {
        return new Response(null, {
            status: 204,
            headers: {
            'Access-Control-Allow-Credentials': 'true',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type'
            }
        });
    }

    if (request.method === "GET") {
        const { results } = await env.DB.prepare("SELECT * FROM authentication").all();

        return new Response(JSON.stringify(results), {
            headers: { "Content-Type": "application/json",
                'Access-Control-Allow-Credentials': 'true',
                'Access-Control-Allow-Origin': '*',
              },
        });
    }

    if (request.method === "POST") {
        const data = await request.json();
        
        if (!Array.isArray(data)) {
            return new Response("Invalid data format. Expected array.", {
                status: 400,
                headers: { "Content-Type": "application/json",
                    'Access-Control-Allow-Credentials': 'true',
                    'Access-Control-Allow-Origin': '*',
                  },
            });
        }

        try {
            await env.DB.prepare("DELETE FROM authentication").run();
            
            for (const entry of data) {
                if (entry.hostname && entry.uri && entry.username && entry.password) {
                    await env.DB.prepare(`
                        INSERT INTO authentication (hostname, uri, username, password, theme, enabled) 
                        VALUES (?, ?, ?, ?, ?, ?)
                    `).bind(
                        entry.hostname,
                        entry.uri,
                        entry.username,
                        entry.password,
                        entry.theme || "",
                        entry.enabled || 0
                    ).run();
                }
            }

            return new Response(JSON.stringify({ success: true, message: "Authentication data updated successfully" }), {
                headers: { "Content-Type": "application/json",
                    'Access-Control-Allow-Credentials': 'true',
                    'Access-Control-Allow-Origin': '*',
                  },
            });

        } catch (error) {
            console.error(error);

            return new Response("There was an error updating the authentication data.", {
                status: 500,
                headers: { "Content-Type": "application/json",
                    'Access-Control-Allow-Credentials': 'true',
                    'Access-Control-Allow-Origin': '*',
                  },
            });
        }
    }

    return new Response("Method Not Allowed", { status: 405 });
}
