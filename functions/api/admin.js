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

    if (request.method === 'POST') {
        const { username, password } = await request.json();

        if (env.ADMIN_USERNAME == username && env.ADMIN_PASSWORD == password) {
            return new Response("Granted", { status: 200 , headers: {
                'Access-Control-Allow-Credentials': 'true',
                'Access-Control-Allow-Origin': '*',
            }});
        }

        return new Response("Unauthorized", { status: 401 });
    }

    return new Response("Method not allowed", { status: 405 });
}
