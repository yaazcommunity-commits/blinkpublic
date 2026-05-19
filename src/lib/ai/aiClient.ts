export async function callAIEndpoint(endpoint: string, payload: Record<string, unknown>) {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    let errorMessage = `API error: ${response.status} ${response.statusText}`;
    try {
      const err = await response.json();
      const detail = err.details || err.error?.message || err.error || err.message || '';
      if (detail && typeof detail === 'string') {
        errorMessage = detail;
      }
    } catch {}
    const error = new Error(errorMessage);
    console.error('API Route Error:', errorMessage);
    throw error;
  }

  return response;
}
