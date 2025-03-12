export async function onRequestPost({ request, env }) {
    const { clientName, token } = await request.json();

    if (clientName && !token) {
        const generatedToken = await generateToken(clientName, env.DNS_SECRET_KEY);
        return new Response(JSON.stringify({ token: generatedToken }), {
            headers: { "Content-Type": "application/json" },
        });
    }

    if (!clientName && token) {
        const clientName = await decryptToken(token, env.DNS_SECRET_KEY);
        return new Response(JSON.stringify({ clientName }), {
            headers: { "Content-Type": "application/json" },
        });
    }

    return new Response(JSON.stringify({ error: "Invalid request" }), { status: 400 });
}

async function generateToken(clientName, secretKey) {
    const encoder = new TextEncoder();
    const keyBuffer = await crypto.subtle.digest("SHA-256", encoder.encode(secretKey));
    const keyData = new Uint8Array(keyBuffer).slice(0, 16); // 16-byte key

    const iv = crypto.getRandomValues(new Uint8Array(12)); // 12-byte IV for AES-GCM
    const algo = { name: "AES-GCM", iv };

    const cryptoKey = await crypto.subtle.importKey("raw", keyData, algo, false, ["encrypt"]);
    const encrypted = await crypto.subtle.encrypt(algo, cryptoKey, encoder.encode(clientName));

    return encodeBase64(new Uint8Array([...iv, ...new Uint8Array(encrypted)]));
}

export async function decryptToken(token, secretKey) {
    try {
        const encoder = new TextEncoder();
        const keyBuffer = await crypto.subtle.digest("SHA-256", encoder.encode(secretKey));
        const keyData = new Uint8Array(keyBuffer).slice(0, 16);

        const decoded = decodeBase64(token);
        const iv = decoded.slice(0, 12);
        const encryptedData = decoded.slice(12);

        const algo = { name: "AES-GCM", iv };
        const cryptoKey = await crypto.subtle.importKey("raw", keyData, algo, false, ["decrypt"]);

        const decrypted = await crypto.subtle.decrypt(algo, cryptoKey, encryptedData);
        return new TextDecoder().decode(decrypted);
    } catch (error) {
        return false;
    }
}

// Base64 Encoding/Decoding for binary data
function encodeBase64(buffer) {
    return btoa(String.fromCharCode(...buffer));
}

function decodeBase64(base64) {
    return new Uint8Array(atob(base64).split("").map(c => c.charCodeAt(0)));
}
