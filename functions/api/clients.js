export async function onRequest({ request, env }) {
  const url = new URL(request.url)
  const method = request.method

  // Enable CORS
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  }

  // Handle CORS preflight requests
  if (method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    })
  }

  try {
    switch (method) {
      case 'GET':
        return await handleGet(request, env, corsHeaders)
      case 'POST':
        return await handlePost(request, env, corsHeaders)
      case 'PUT':
        return await handlePut(request, env, corsHeaders)
      case 'DELETE':
        return await handleDelete(request, env, corsHeaders)
      default:
        return new Response('Method not allowed', {
          status: 405,
          headers: corsHeaders,
        })
    }
  } catch (error) {
    console.error('Error in clients API:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  }
}

async function handleGet(request, env, corsHeaders) {
  try {
    const result = await env.DB.prepare(
      `
      SELECT id, name, origin, hostname, enabled 
      FROM clients 
      ORDER BY name ASC
    `,
    ).all()

    return new Response(
      JSON.stringify({
        success: true,
        data: result.results || [],
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  } catch (error) {
    console.error('Error fetching clients:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Failed to fetch clients',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  }
}

async function handlePost(request, env, corsHeaders) {
  try {
    const clientData = await request.json()

    // Validate required fields
    if (!clientData.name || !clientData.origin || !clientData.hostname) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Missing required fields: name, origin, hostname',
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      )
    }

    const result = await env.DB.prepare(
      `
      INSERT INTO clients (name, origin, hostname, enabled)
      VALUES (?, ?, ?, ?)
    `,
    )
      .bind(clientData.name, clientData.origin, clientData.hostname, clientData.enabled ? 1 : 0)
      .run()

    return new Response(
      JSON.stringify({
        success: true,
        data: { id: result.meta.last_row_id },
        message: 'Client created successfully',
      }),
      {
        status: 201,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  } catch (error) {
    console.error('Error creating client:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Failed to create client',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  }
}

async function handlePut(request, env, corsHeaders) {
  try {
    const clientData = await request.json()

    // Validate required fields
    if (!clientData.id || !clientData.name || !clientData.origin || !clientData.hostname) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Missing required fields: id, name, origin, hostname',
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      )
    }

    const result = await env.DB.prepare(
      `
      UPDATE clients 
      SET name = ?, origin = ?, hostname = ?, enabled = ?
      WHERE id = ?
    `,
    )
      .bind(
        clientData.name,
        clientData.origin,
        clientData.hostname,
        clientData.enabled ? 1 : 0,
        clientData.id,
      )
      .run()

    if (result.meta.changes === 0) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Client not found',
        }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      )
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Client updated successfully',
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  } catch (error) {
    console.error('Error updating client:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Failed to update client',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  }
}

async function handleDelete(request, env, corsHeaders) {
  try {
    const url = new URL(request.url)
    const id = url.searchParams.get('id')

    if (!id) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Client ID is required',
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      )
    }

    const result = await env.DB.prepare(
      `
      DELETE FROM clients WHERE id = ?
    `,
    )
      .bind(id)
      .run()

    if (result.meta.changes === 0) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Client not found',
        }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      )
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Client deleted successfully',
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  } catch (error) {
    console.error('Error deleting client:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Failed to delete client',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  }
}
