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
        const auths = await env.KV_ROAM_AUTHENTICATION.list();
        const results = [];

        for (const key of auths.keys) {
          const value = await env.KV_ROAM_AUTHENTICATION.get(key.name);
          results.push(JSON.parse(value));
        }

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
            for (const entry of data) {
                if (entry.hostname && entry.uri && entry.username && entry.password) {
                    await env.KV_ROAM_AUTHENTICATION.put(entry.hostname + entry.uri, JSON.stringify({
                        hostname: entry.hostname,
                        uri: entry.uri,
                        username: entry.username,
                        password: entry.password,
                        theme: entry.theme || "roam",
                        enabled: entry.enabled || 0
                      }));
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
