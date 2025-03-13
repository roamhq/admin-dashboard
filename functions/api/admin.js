export async function onRequestPost({ request, env }) {
    const { username, password } = await request.json();

    if (env.ADMIN_USERNAME == username && env.ADMIN_PASSWORD == password) {
        return new Response("Granted", { status: 200 });
    }

    return new Response("Unauthorized", { status: 401 });
}