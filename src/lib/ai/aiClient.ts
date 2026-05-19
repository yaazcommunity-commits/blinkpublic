export async function callAIEndpoint(endpoint: string, payload: Record<string, unknown>) {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    let details = '';
    try {
      const err = await response.json();
      details = err.details || err.error || '';
    } catch {}
    const error = new Error(`API Route Error: ${response.status}`);
    console.error('API Route Error:', { error, details });
    throw error;
  }

  return response;
}
